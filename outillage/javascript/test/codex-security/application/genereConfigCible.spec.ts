import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  GenereConfigCible,
} from '../../../src/codex-security/application/genereConfigCible.ts';
import {
  cheminConfigCible,
  NOM_CIBLE_PAR_DEFAUT,
} from '../../../src/codex-security/domaine/cheminConfig.ts';

const CHEMIN_FICHIER_CONFIG_CIBLE = cheminConfigCible(NOM_CIBLE_PAR_DEFAUT);
import { environnement } from '../../../src/noyau/environnement.ts';
import {
  ENVIRONNEMENT_CODEX_SECURITY,
  ENVIRONNEMENT_PROXY,
} from '../../doubles/environnement.ts';

const fournisseurAlbert = () => {
  environnement.fournisseur = () => ({
    apiKey: 'cle-fournisseur',
    modele: 'deepseek-v4-flash-0731',
    nom: 'albert',
    url: 'https://fournisseur.example/v1',
  });
};

const proxySurLePort = (portLiteLLM: number) => {
  environnement.pourCodexSecurity = () => ({
    ...ENVIRONNEMENT_CODEX_SECURITY,
    proxy: () => ({ ...ENVIRONNEMENT_PROXY, portLiteLLM }),
  });
};

const ENV_RACINE =
  'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\nFOURNISSEUR_MODELE=deepseek-v4-flash-0731\n';

const systemeDeFichierConfigure = () =>
  new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });

const uneGeneration = (doubles: Partial<Dependances> = {}) =>
  new GenereConfigCible({
    systemeDeFichier: systemeDeFichierConfigure(),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Génère Config Cible', () => {
  it('écrit la config ciblée, avec le modèle et le fournisseur de l’environnement', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    fournisseurAlbert();
    proxySurLePort(4000);

    uneGeneration({ systemeDeFichier }).execute(NOM_CIBLE_PAR_DEFAUT);

    const lu = parse(systemeDeFichier.lit(CHEMIN_FICHIER_CONFIG_CIBLE));
    expect(lu.codex.model).toBe('deepseek-v4-flash-0731');
    expect(lu.codex.model_provider).toBe('albert');
  });

  it('pointe le fournisseur vers le port du proxy lu dans l’environnement', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    fournisseurAlbert();
    proxySurLePort(4010);

    uneGeneration({ systemeDeFichier }).execute(NOM_CIBLE_PAR_DEFAUT);

    const lu = parse(systemeDeFichier.lit(CHEMIN_FICHIER_CONFIG_CIBLE));
    expect(lu.codex.model_providers.albert.base_url).toBe(
      'http://127.0.0.1:4010/v1'
    );
  });

  it('délimite le périmètre avec les chemins à scanner par défaut', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    fournisseurAlbert();
    proxySurLePort(4000);

    uneGeneration({ systemeDeFichier }).execute(NOM_CIBLE_PAR_DEFAUT);

    const lu = parse(systemeDeFichier.lit(CHEMIN_FICHIER_CONFIG_CIBLE));
    expect(lu.scan.scope.paths).toEqual(['src']);
  });

  it('refuse de générer sans .env racine (fournisseur non configuré)', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire();
    fournisseurAlbert();
    proxySurLePort(4000);

    expect(() =>
      uneGeneration({ systemeDeFichier }).execute(NOM_CIBLE_PAR_DEFAUT)
    ).toThrow(
      'Erreur: fichier .env introuvable à la racine du dépôt (depuis .env.template)'
    );
    expect(systemeDeFichier.existe(CHEMIN_FICHIER_CONFIG_CIBLE)).toBe(false);
  });

  it('annonce le fichier généré et le fournisseur configuré', () => {
    const console = new ConsoleEnMemoire();
    fournisseurAlbert();
    proxySurLePort(4000);

    uneGeneration({ console }).execute(NOM_CIBLE_PAR_DEFAUT);

    expect(console.lignes.map((l) => l.message)).toEqual([
      'Généré: outils/codex-security/configs/config-cible.yaml',
      '  Périmètre ciblé pour le fournisseur : albert (1 chemin)',
    ]);
  });

  it('renvoie le chemin du fichier généré, à passer ensuite au scan (--config)', () => {
    fournisseurAlbert();
    proxySurLePort(4000);

    const chemin = uneGeneration().execute(NOM_CIBLE_PAR_DEFAUT);

    expect(chemin).toBe(CHEMIN_FICHIER_CONFIG_CIBLE);
  });

  it('génère un fichier distinct par cible pour industrialiser plusieurs projets', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    fournisseurAlbert();
    proxySurLePort(4000);

    const chemin = uneGeneration({ systemeDeFichier }).execute('projet-x');

    expect(chemin).toBe('outils/codex-security/configs/config-projet-x.yaml');
    expect(systemeDeFichier.existe(chemin)).toBe(true);
  });
});
