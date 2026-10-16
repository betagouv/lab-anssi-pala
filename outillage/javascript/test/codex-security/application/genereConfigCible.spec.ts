import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { DepotGitEnMemoire } from '../../doubles/DepotGitEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  GenereConfigCible,
} from '../../../src/codex-security/application/genereConfigCible.ts';
import { cheminConfigCible } from '../../../src/codex-security/domaine/cheminConfig.ts';
import { NOMBRE_DE_JOURS_PAR_DEFAUT } from '../../../src/codex-security/domaine/fenetreDeModification.ts';
import { Cible } from '../../../src/environnement/domaine/Cible.ts';
import { environnement } from '../../../src/noyau/environnement.ts';

const UNE_CIBLE = 'la-cible';

const CHEMIN_FICHIER_CONFIG_CIBLE = cheminConfigCible(UNE_CIBLE);

const fournisseurAlbert = () => {
  environnement.fournisseur = () => ({
    apiKey: 'cle-fournisseur',
    modele: 'deepseek-v4-flash-0731',
    nom: 'albert',
    url: 'https://fournisseur.example/v1',
  });
};
const urlDuProxy = (url: string) => {
  environnement.urlLiteLLMConfiguree = () => url;
};

const ENV_RACINE =
  'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\nFOURNISSEUR_MODELE=deepseek-v4-flash-0731\n';

const systemeDeFichierConfigure = () =>
  new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });

const uneGeneration = (doubles: Partial<Dependances> = {}) =>
  new GenereConfigCible({
    systemeDeFichier: systemeDeFichierConfigure(),
    console: new ConsoleEnMemoire(),
    depotGit: new DepotGitEnMemoire(['src/noyau/environnement.ts']),
    ...doubles,
  });

describe('Génère Config Cible', () => {
  it('écrit la config ciblée, avec le modèle et le fournisseur de l’environnement', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    fournisseurAlbert();
    urlDuProxy('http://127.0.0.1:4000');

    uneGeneration({ systemeDeFichier }).execute(
      UNE_CIBLE,
      NOMBRE_DE_JOURS_PAR_DEFAUT
    );

    const lu = parse(systemeDeFichier.lit(CHEMIN_FICHIER_CONFIG_CIBLE));
    expect(lu.codex.model).toBe('deepseek-v4-flash-0731');
    expect(lu.codex.model_provider).toBe('albert');
  });

  it('pointe le fournisseur vers l’URL du proxy (LITELLM_BASE_URL)', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    fournisseurAlbert();
    urlDuProxy('https://litellm.local');

    uneGeneration({ systemeDeFichier }).execute(
      UNE_CIBLE,
      NOMBRE_DE_JOURS_PAR_DEFAUT
    );

    const lu = parse(systemeDeFichier.lit(CHEMIN_FICHIER_CONFIG_CIBLE));
    expect(lu.codex.model_providers.albert.base_url).toBe(
      'https://litellm.local/v1'
    );
  });

  it('renseigne le périmètre avec les fichiers modifiés (diff git) de la fenêtre demandée', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    const depotGit = new DepotGitEnMemoire([
      'src/codex-security/application/lanceScan.ts',
      'src/noyau/environnement.ts',
    ]);
    fournisseurAlbert();
    urlDuProxy('http://127.0.0.1:4000');

    uneGeneration({ systemeDeFichier, depotGit }).execute(UNE_CIBLE, 30);

    const lu = parse(systemeDeFichier.lit(CHEMIN_FICHIER_CONFIG_CIBLE));
    expect(lu.scan.scope.paths).toEqual([
      'src/codex-security/application/lanceScan.ts',
      'src/noyau/environnement.ts',
    ]);
    expect(depotGit.nombreDeJoursDemande).toBe(30);
  });

  it('met à jour la copie de travail de la cible avant de calculer le diff', () => {
    const depotGit = new DepotGitEnMemoire();
    fournisseurAlbert();
    urlDuProxy('http://127.0.0.1:4000');

    uneGeneration({ depotGit }).execute('mon-projet', NOMBRE_DE_JOURS_PAR_DEFAUT);

    expect(depotGit.repertoireMisAJour).toBe(
      new Cible({ nom: 'mon-projet' }).copieDeTravail
    );
    expect(depotGit.misAJourAvantLeDiff).toBe(true);
  });

  it('interroge le dépôt git sur la copie de travail de la cible passée en paramètre', () => {
    const depotGit = new DepotGitEnMemoire();
    fournisseurAlbert();
    urlDuProxy('http://127.0.0.1:4000');

    uneGeneration({ depotGit }).execute('mon-projet', NOMBRE_DE_JOURS_PAR_DEFAUT);

    expect(depotGit.repertoireDemande).toBe(
      new Cible({ nom: 'mon-projet' }).copieDeTravail
    );
  });

  it('refuse de générer sans .env racine (fournisseur non configuré)', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire();
    fournisseurAlbert();
    urlDuProxy('http://127.0.0.1:4000');

    expect(() =>
      uneGeneration({ systemeDeFichier }).execute(
        UNE_CIBLE,
        NOMBRE_DE_JOURS_PAR_DEFAUT
      )
    ).toThrow(
      'Erreur: fichier .env introuvable à la racine du dépôt (depuis .env.template)'
    );
    expect(systemeDeFichier.existe(CHEMIN_FICHIER_CONFIG_CIBLE)).toBe(false);
  });

  it('annonce la mise à jour de la copie de travail en première étape', () => {
    const console = new ConsoleEnMemoire();
    fournisseurAlbert();
    urlDuProxy('http://127.0.0.1:4000');

    uneGeneration({ console }).execute(UNE_CIBLE, NOMBRE_DE_JOURS_PAR_DEFAUT);

    expect(console.lignes.map((l) => l.message)[0]).toBe(
      'Mise à jour de la copie de travail : cible/copies/la-cible'
    );
  });

  it('annonce le fichier généré et le fournisseur configuré', () => {
    const console = new ConsoleEnMemoire();
    fournisseurAlbert();
    urlDuProxy('http://127.0.0.1:4000');

    uneGeneration({ console }).execute(UNE_CIBLE, NOMBRE_DE_JOURS_PAR_DEFAUT);

    expect(console.lignes.map((l) => l.message)).toEqual([
      'Mise à jour de la copie de travail : cible/copies/la-cible',
      'Généré: outils/codex-security/configs/config-la-cible.yaml',
      '  Périmètre ciblé pour le fournisseur : albert (1 fichier)',
    ]);
  });

  it('renvoie le chemin du fichier généré, à passer ensuite au scan (--config)', () => {
    fournisseurAlbert();
    urlDuProxy('http://127.0.0.1:4000');

    const chemin = uneGeneration().execute(UNE_CIBLE, NOMBRE_DE_JOURS_PAR_DEFAUT);

    expect(chemin).toBe(CHEMIN_FICHIER_CONFIG_CIBLE);
  });

  it('génère un fichier distinct par cible pour industrialiser plusieurs projets', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    fournisseurAlbert();
    urlDuProxy('http://127.0.0.1:4000');

    const chemin = uneGeneration({ systemeDeFichier }).execute(
      'projet-x',
      NOMBRE_DE_JOURS_PAR_DEFAUT
    );

    expect(chemin).toBe('outils/codex-security/configs/config-projet-x.yaml');
    expect(systemeDeFichier.existe(chemin)).toBe(true);
  });
});
