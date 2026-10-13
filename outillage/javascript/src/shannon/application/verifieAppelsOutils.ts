import { parseEnv } from 'node:util';
import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { jugeAppelOutil, MESSAGES_SONDE } from '../domaine/SondeAppelsOutils.ts';
import { SpecModele } from '../domaine/SpecModele.ts';
import type { ApiChat } from '../ports/ApiChat.ts';
import { environnement } from '../../noyau/environnement.ts';
import { CHEMIN_FICHIER_ENV_SHANNON } from '../../codex-security/domaine/cheminEnvironnement.ts';

export type Dependances = {
  apiChat: ApiChat;
  systemeDeFichier: SystemeDeFichier;
  console: Console;
};

type Destinataire = { url: string; cle: string; modele: string };
type ResultatEssai = {
  emission: boolean;
  multitour: boolean;
  details: Record<string, unknown>;
};

export class VerifieAppelsOutils {
  readonly #apiChat: ApiChat;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #console: Console;

  constructor({ apiChat, systemeDeFichier, console }: Dependances) {
    this.#apiChat = apiChat;
    this.#systemeDeFichier = systemeDeFichier;
    this.#console = console;
  }

  async execute({ modele }: { modele?: string }): Promise<number> {
    if (!this.#systemeDeFichier.existe(CHEMIN_FICHIER_ENV_SHANNON))
      throw new Error(
        'Fichier manquant : outils/shannon/shannon.env (lancer pnpm run génère-env)'
      );
    const destinataire = this.#destinataire(modele);
    const essais = environnement.pourShannon(this.#systemeDeFichier).nombreEssais;
    this.#console.aLaLigne(
      `Modèle ${destinataire.modele} sur ${destinataire.url}, ${essais} essai(s)`,
      'BLEU'
    );
    this.#console.aLaLigne('');

    const resultats: ResultatEssai[] = [];
    for (let numero = 1; numero <= essais; numero++) {
      const resultat = await this.#unEssai(destinataire);
      resultats.push(resultat);
      const etat = (ok: boolean) => (ok ? 'OK' : 'KO');
      const emission = etat(resultat.emission);
      const multitour = etat(resultat.multitour);
      this.#console.aLaLigne(
        `essai ${numero}: emission=${emission}  multi-tour=${multitour}  ${JSON.stringify(resultat.details)}`,
        emission && multitour ? 'VERT' : 'ROUGE'
      );
    }
    return this.#bilan(resultats);
  }

  // Le modèle que Shannon utilisera, chez le fournisseur, avec la clé de Shannon (jamais affichée).
  #destinataire(modeleImpose?: string): Destinataire {
    let environnementShannon = environnement.pourShannon(this.#systemeDeFichier);
    const cle = environnementShannon.apiKey;
    const url = environnement.fournisseur().url;
    if (!url)
      throw new Error(
        'URL absente : définir FOURNISSEUR_BASE_URL dans le .env racine.'
      );
    const modele = SpecModele.exigee(modeleImpose || environnementShannon.model);
    return {
      url,
      cle,
      modele: modele.identifiant,
    };
  }

  // Statut 0 seulement si tous les essais passent les deux contrôles.
  #bilan(resultats: ResultatEssai[]): number {
    const emissions = resultats.filter((r) => r.emission).length;
    const multitours = resultats.filter((r) => r.multitour).length;
    this.#console.aLaLigne('');
    this.#console.aLaLigne(
      `Emission de tool_calls valides : ${emissions}/${resultats.length}`,
      emissions === resultats.length ? 'VERT' : 'ROUGE'
    );
    this.#console.aLaLigne(
      `Enchainement multi-tour        : ${multitours}/${resultats.length}`,
      multitours === resultats.length ? 'VERT' : 'ROUGE'
    );
    return emissions === resultats.length && multitours === resultats.length ? 0 : 1;
  }

  // Deux contrôles : émission d'un appel d'outil valide, puis enchaînement après son résultat.
  async #unEssai(destinataire: Destinataire): Promise<ResultatEssai> {
    const premier = await this.#apiChat.complete({
      ...destinataire,
      messages: MESSAGES_SONDE,
    });
    if ('erreur' in premier)
      return {
        emission: false,
        multitour: false,
        details: { emission: premier.erreur },
      };
    const { message, finDeReponse, tokensDeSortie } = premier.reponse;
    const details: Record<string, unknown> = {
      finish: finDeReponse,
      tokens: tokensDeSortie,
    };
    const emis = jugeAppelOutil(message);
    if ('raison' in emis)
      return {
        emission: false,
        multitour: false,
        details: { ...details, emission: emis.raison },
      };

    const second = await this.#apiChat.complete({
      ...destinataire,
      messages: [
        ...MESSAGES_SONDE,
        {
          role: 'assistant',
          content: message.content ?? '',
          tool_calls: message.tool_calls,
        },
        {
          role: 'tool',
          tool_call_id: emis.appel.id,
          content: 'README.md\nsrc\npackage.json\nexit_code=0',
        },
      ],
    });
    if ('erreur' in second)
      return {
        emission: true,
        multitour: false,
        details: { ...details, multitour: second.erreur },
      };
    const suite = second.reponse.message;
    // Le modèle répond au résultat de l'outil, ou enchaîne un nouvel appel valide.
    if (suite.content?.trim()) return { emission: true, multitour: true, details };
    const relance = jugeAppelOutil(suite);
    if ('appel' in relance) return { emission: true, multitour: true, details };
    return {
      emission: true,
      multitour: false,
      details: {
        ...details,
        multitour: `ni reponse ni nouvel appel valide (${relance.raison})`,
      },
    };
  }
}
