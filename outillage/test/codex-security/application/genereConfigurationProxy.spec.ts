import { afterEach, describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  GenereConfigurationProxy,
} from '../../../src/codex-security/application/genereConfigurationProxy.ts';
import { environnement } from '../../../src/noyau/environnement.ts';

const modeleProxyInitial = environnement.pourProxyLiteLLM;

afterEach(() => {
  environnement.pourProxyLiteLLM = modeleProxyInitial;
});

const CHEMIN_CONFIG_PROXY_GENERE =
  'outils/codex-security/litellm/config-genere.yaml';

const modeleConfigure = (
  parametres: Partial<ReturnType<typeof environnement.pourProxyLiteLLM>> = {}
) => {
  environnement.pourProxyLiteLLM = () => ({
    cellar: () => ({
      credentials: { accessKeyId: 'access-key', secretAccessKey: 'secret-key' },
      nomDuBucket: 'nom-du-bucket',
      region: 'region',
      url: 'url',
    }),
    cheminFichierDeConfiguration: CHEMIN_CONFIG_PROXY_GENERE,
    configuration: () => ({
      modele: 'deepseek-v4-flash-0731',
      coutEntreeParToken: 0.0000004,
      coutSortieParToken: 0.0000008,
    }),
    ...parametres,
  });
};

const systemeConfigure = () =>
  new SystemeDeFichierEnMemoire({
    [CHEMIN_CONFIG_PROXY_GENERE]: '',
  });

const uneGeneration = (doubles: Partial<Dependances> = {}) =>
  new GenereConfigurationProxy({
    systemeDeFichier: systemeConfigure(),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Génère Configuration Proxy', () => {
  it('écrit le config.yaml généré, avec le modèle de l’environnement', async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire();
    modeleConfigure();

    await uneGeneration({ systemeDeFichier }).execute();

    const lu = parse(systemeDeFichier.lit(CHEMIN_CONFIG_PROXY_GENERE));
    expect(lu.model_list[0].model_name).toBe('deepseek-v4-flash-0731');
    expect(lu.model_list[0].litellm_params.model).toBe(
      'hosted_vllm/deepseek-v4-flash-0731'
    );
  });

  it('refuse de générer si un coût par token est absent (NaN)', async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire();
    modeleConfigure({
      configuration: () => ({
        coutEntreeParToken: Number.NaN,
        coutSortieParToken: Number.NaN,
        modele: 'Un modèle',
      }),
    });

    await expect(uneGeneration({ systemeDeFichier }).execute()).rejects.toThrow(
      /FOURNISSEUR_COUT_ENTREE_PAR_TOKEN/
    );
    expect(systemeDeFichier.existe(CHEMIN_CONFIG_PROXY_GENERE)).toBe(false);
  });

  it('annonce le fichier généré', async () => {
    const console = new ConsoleEnMemoire();
    modeleConfigure();

    await uneGeneration({ console }).execute();

    expect(console.lignes.map((l) => l.message)).toContain(
      `Généré: ${CHEMIN_CONFIG_PROXY_GENERE}`
    );
  });

  it('écrase tout fichier généré préexistant', async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      [CHEMIN_CONFIG_PROXY_GENERE]: 'ancien: contenu\n',
    });
    modeleConfigure();

    await uneGeneration({ systemeDeFichier }).execute();

    expect(systemeDeFichier.lit(CHEMIN_CONFIG_PROXY_GENERE)).not.toContain('ancien');
  });
});
