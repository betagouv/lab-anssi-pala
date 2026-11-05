import { afterEach, describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { genereConfigProxy } from '../../../src/codex-security/cli/genere-config-proxy.ts';
import { environnement } from '../../../src/noyau/environnement.ts';

const ENV_RACINE =
  'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\nFOURNISSEUR_MODELE=deepseek-v4-flash-0731\nLITELLM_BASE_URL=http://127.0.0.1:4000\nLITELLM_API_KEY=sk-local\n';

const modeleProxyInitial = environnement.pourProxyLiteLLM;

afterEach(() => {
  environnement.pourProxyLiteLLM = modeleProxyInitial;
});

const modeleConfigure = () => {
  environnement.pourProxyLiteLLM = () => ({
    cellar: () => ({
      credentials: { accessKeyId: 'access-key', secretAccessKey: 'secret-key' },
      nomDuBucket: 'nom-du-bucket',
      region: 'region',
      url: 'url',
    }),
    cheminFichierDeConfiguration: 'un/chemin/config.yaml',
    configuration: () => ({
      modele: 'deepseek-v4-flash-0731',
      coutEntreeParToken: 0,
      coutSortieParToken: 0,
    }),
  });
};

describe('génère-config-proxy (ligne de commande)', () => {
  it('génère le config.yaml du proxy et sort en code 0', async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });
    modeleConfigure();

    const code = await genereConfigProxy([], {
      systemeDeFichier,
      console: new ConsoleEnMemoire(),
    });

    expect(code).toBe(0);
    expect(systemeDeFichier.existe('un/chemin/config.yaml')).toBe(true);
  });

  it('signale l’erreur et sort en code 1 quand la génération échoue', async () => {
    const console = new ConsoleEnMemoire();
    modeleConfigure();

    const systemeDeFichier = new SystemeDeFichierEnMemoire();
    systemeDeFichier.leveUneErreurALEcriture(new Error('Erreur survenue'));
    const code = await genereConfigProxy([], {
      systemeDeFichier,
      console,
    });

    expect(code).toBe(1);
    expect(console.erreurs.map((l) => l.message)).toEqual(['Erreur survenue']);
  });
});
