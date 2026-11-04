import { afterEach, describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  GenereConfigurationProxy,
} from '../../../src/codex-security/application/genereConfigurationProxy.ts';
import { CHEMIN_CONFIG_PROXY_GENERE } from '../../../src/codex-security/domaine/cheminConfig.ts';
import { environnement } from '../../../src/noyau/environnement.ts';

const ENV_RACINE =
  'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\nFOURNISSEUR_MODELE=deepseek-v4-flash-0731\nLITELLM_BASE_URL=http://127.0.0.1:4000\nLITELLM_API_KEY=sk-local\n';

const modeleProxyInitial = environnement.pourProxyLiteLLM;

afterEach(() => {
  environnement.pourProxyLiteLLM = modeleProxyInitial;
});

const modeleConfigure = (
  parametres: Partial<ReturnType<typeof environnement.pourProxyLiteLLM>> = {}
) => {
  environnement.pourProxyLiteLLM = () => ({
    cheminFichierDeConfiguration: 'un/chemin',
    configuration: () => ({
      modele: 'deepseek-v4-flash-0731',
      coutEntreeParToken: 0.0000004,
      coutSortieParToken: 0.0000008,
    }),
    ...parametres,
  });
};

const systemeConfigure = () => new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });

const uneGeneration = (doubles: Partial<Dependances> = {}) =>
  new GenereConfigurationProxy({
    systemeDeFichier: systemeConfigure(),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Génère Configuration Proxy', () => {
  it('écrit le config.yaml généré, avec le modèle de l’environnement', () => {
    const systemeDeFichier = systemeConfigure();
    modeleConfigure();

    uneGeneration({ systemeDeFichier }).execute();

    const lu = parse(systemeDeFichier.lit(CHEMIN_CONFIG_PROXY_GENERE));
    expect(lu.model_list[0].model_name).toBe('deepseek-v4-flash-0731');
    expect(lu.model_list[0].litellm_params.model).toBe(
      'hosted_vllm/deepseek-v4-flash-0731'
    );
  });

  it('refuse de générer si un coût par token est absent (NaN)', () => {
    const systemeDeFichier = systemeConfigure();
    modeleConfigure({
      configuration: () => ({
        coutEntreeParToken: Number.NaN,
        coutSortieParToken: Number.NaN,
        modele: 'Un modèle',
      }),
    });

    expect(() => uneGeneration({ systemeDeFichier }).execute()).toThrow(
      /FOURNISSEUR_COUT_ENTREE_PAR_TOKEN/
    );
    expect(systemeDeFichier.existe(CHEMIN_CONFIG_PROXY_GENERE)).toBe(false);
  });

  it('annonce le fichier généré et renvoie son chemin', () => {
    const console = new ConsoleEnMemoire();
    modeleConfigure();

    const chemin = uneGeneration({ console }).execute();

    expect(chemin).toBe(CHEMIN_CONFIG_PROXY_GENERE);
    expect(console.lignes.map((l) => l.message)).toContain(
      `Généré: ${CHEMIN_CONFIG_PROXY_GENERE}`
    );
  });

  it('écrase tout fichier généré préexistant', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env': ENV_RACINE,
      [CHEMIN_CONFIG_PROXY_GENERE]: 'ancien: contenu\n',
    });
    modeleConfigure();

    uneGeneration({ systemeDeFichier }).execute();

    expect(systemeDeFichier.lit(CHEMIN_CONFIG_PROXY_GENERE)).not.toContain('ancien');
  });
});
