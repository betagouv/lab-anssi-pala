import { beforeEach, describe, expect, it } from 'vitest';
import { ApiChatSimulee } from '../../doubles/ApiChatSimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  VerifieAppelsOutilsLLM,
} from '../../../src/shannon/application/verifieAppelsOutilsLLM.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import {
  ENVIRONNEMENT_FOURNISSEUR,
  ENVIRONNEMENT_SHANNON,
} from '../../doubles/environnement.ts';

const unDepotDeFichiersPret = () =>
  new SystemeDeFichierEnMemoire({
    'outils/shannon/shannon.env': 'SHANNON_AI_MODEL=albert:openai/gpt-oss-120b\n',
  });

const uneVerification = (doubles: Partial<Dependances> = {}) =>
  new VerifieAppelsOutilsLLM({
    apiChat: new ApiChatSimulee(),
    systemeDeFichier: unDepotDeFichiersPret(),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Verifie appels outils LLM', () => {
  beforeEach(() => {
    environnement.pourShannon = () => ENVIRONNEMENT_SHANNON;
    environnement.fournisseur = () => ENVIRONNEMENT_FOURNISSEUR;
  });

  it('refuse de scanner si le fichier de variables d’environnement n’existe pas', async () => {
    const systemeDeFichier = unDepotDeFichiersPret();
    systemeDeFichier.fichiers.delete('outils/shannon/shannon.env');

    await expect(uneVerification({ systemeDeFichier }).execute({})).rejects.toThrow(
      'Fichier manquant : outils/shannon/shannon.env (lancer pnpm run génère-env)'
    );
  });

  it('interroge le modèle de Shannon chez le fournisseur conformément à son URL', async () => {
    const apiChat = new ApiChatSimulee();

    await uneVerification({ apiChat }).execute({});

    expect(apiChat.demandes[0]).toMatchObject({
      url: 'http://fournisseur.local',
      cle: 'cle-shannon',
      modele: 'openai/gpt-oss-120b',
    });
  });

  it("valide émission et multi-tour quand le modèle appelle l'outil puis répond à son résultat", async () => {
    const console = new ConsoleEnMemoire();

    const statut = await uneVerification({ console }).execute({});

    expect(statut).toBe(0);
    expect(console.lignes.map((l) => l.message).slice(-2)).toEqual([
      'Emission de tool_calls valides : 1/1',
      'Enchainement multi-tour        : 1/1',
    ]);
  });

  it('répète la sonde suivant le nombre de fois définis, avec une ligne par essai puis le bilan', async () => {
    environnement.pourShannon = () => ({
      ...ENVIRONNEMENT_SHANNON,
      nombreEssais: 3,
    });
    const console = new ConsoleEnMemoire();

    await uneVerification({
      console,
    }).execute({});

    expect(console.lignes.map((l) => l.message).slice(-6)).toEqual([
      'essai 1: emission=OK  multi-tour=OK  {"finish":"tool_calls","tokens":42}',
      'essai 2: emission=OK  multi-tour=OK  {"finish":"tool_calls","tokens":42}',
      'essai 3: emission=OK  multi-tour=OK  {"finish":"tool_calls","tokens":42}',
      '',
      'Emission de tool_calls valides : 3/3',
      'Enchainement multi-tour        : 3/3',
    ]);
  });

  const appel = (nom: string, args: string) => [
    { id: 'appel-1', function: { name: nom, arguments: args } },
  ];

  it.each([
    [undefined, 'aucun tool_calls structure'],
    [appel('lire', '{"command":"ls"}'), "outil inattendu: 'lire'"],
    [appel('execute', 'command=ls'), 'arguments non JSON'],
    [appel('execute', '{"command":""}'), "parametre 'command' absent ou vide"],
    [appel('execute', '{}'), "parametre 'command' absent ou vide"],
  ])("refuse l'émission %j : %s", async (appels, raison) => {
    const apiChat = new ApiChatSimulee([
      {
        reponse: {
          message: { role: 'assistant', content: 'ls', tool_calls: appels },
        },
      },
    ]);
    const console = new ConsoleEnMemoire();

    const statut = await uneVerification({ apiChat, console }).execute({});

    expect(statut).toBe(1);
    expect(console.lignes.map((l) => l.message)).toContain(
      `essai 1: emission=KO  multi-tour=KO  {"emission":"${raison}"}`
    );
  });

  it('valide le multi-tour quand le modèle enchaîne un nouvel appel valide au lieu de répondre', async () => {
    const executeLs = {
      reponse: {
        message: {
          role: 'assistant',
          tool_calls: appel('execute', '{"command":"ls"}'),
        },
      },
    };
    const executeCat = {
      reponse: {
        message: {
          role: 'assistant',
          content: '',
          tool_calls: appel('execute', '{"command":"cat README.md"}'),
        },
      },
    };
    const console = new ConsoleEnMemoire();

    const statut = await uneVerification({
      apiChat: new ApiChatSimulee([executeLs, executeCat]),
      console,
    }).execute({});

    expect(statut).toBe(0);
    expect(console.lignes.map((l) => l.message)).toContain(
      'essai 1: emission=OK  multi-tour=OK  {}'
    );
  });

  it("refuse le multi-tour quand le modèle ne répond pas et n'enchaîne aucun appel valide", async () => {
    const executeLs = {
      reponse: {
        message: {
          role: 'assistant',
          tool_calls: appel('execute', '{"command":"ls"}'),
        },
      },
    };
    const rienDExploitable = {
      reponse: {
        message: {
          role: 'assistant',
          content: '  ',
          tool_calls: appel('execute', '{}'),
        },
      },
    };
    const console = new ConsoleEnMemoire();

    await uneVerification({
      apiChat: new ApiChatSimulee([executeLs, rienDExploitable]),
      console,
    }).execute({});

    expect(console.lignes.map((l) => l.message)).toContain(
      `essai 1: emission=OK  multi-tour=KO  {"multitour":"ni reponse ni nouvel appel valide (parametre 'command' absent ou vide)"}`
    );
  });

  it("consigne l'erreur réseau ou HTTP de l'émission comme du second tour", async () => {
    environnement.pourShannon = () => ({
      ...ENVIRONNEMENT_SHANNON,
      nombreEssais: 2,
    });
    const executeLs = {
      reponse: {
        message: {
          role: 'assistant',
          tool_calls: appel('execute', '{"command":"ls"}'),
        },
      },
    };
    const console = new ConsoleEnMemoire();

    await uneVerification({
      apiChat: new ApiChatSimulee([
        { erreur: 'http_401: clé invalide' },
        executeLs,
        { erreur: 'reseau: TimeoutError' },
      ]),
      console,
    }).execute({});

    expect(console.lignes.map((l) => l.message)).toEqual(
      expect.arrayContaining([
        'essai 1: emission=KO  multi-tour=KO  {"emission":"http_401: clé invalide"}',
        'essai 2: emission=OK  multi-tour=KO  {"multitour":"reseau: TimeoutError"}',
      ])
    );
  });

  it("annonce le modèle vérifié, l'URL de son fournisseur et le nombre d'essais", async () => {
    const console = new ConsoleEnMemoire();

    await uneVerification({ console }).execute({});

    expect(console.lignes.map((l) => l.message).slice(0, 2)).toEqual([
      'Modèle openai/gpt-oss-120b sur http://fournisseur.local, 1 essai(s)',
      '',
    ]);
  });

  it('vérifie le modèle désigné au lancement, chez le fournisseur', async () => {
    const apiChat = new ApiChatSimulee();

    await uneVerification({ apiChat }).execute({
      modele: 'scaleway:deepseek-v4-flash-0731',
    });

    expect(apiChat.demandes[0]).toMatchObject({
      url: 'http://fournisseur.local',
      modele: 'deepseek-v4-flash-0731',
    });
  });

  it('refuse de vérifier sans URL du fournisseur : aucune API à interroger', async () => {
    const apiChat = new ApiChatSimulee();
    environnement.fournisseur = () => ({ ...ENVIRONNEMENT_FOURNISSEUR, url: '' });

    await expect(uneVerification({ apiChat }).execute({})).rejects.toThrow(
      'URL absente : définir FOURNISSEUR_BASE_URL dans le .env racine.'
    );
    expect(apiChat.demandes).toEqual([]);
  });
});
