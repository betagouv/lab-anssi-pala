import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  GenereConfigCible,
} from '../../../src/codex-security/application/genereConfigCible.ts';
import { cheminConfigCible } from '../../../src/codex-security/domaine/cheminConfig.ts';
import { NOMBRE_DE_JOURS_PAR_DEFAUT } from '../../../src/codex-security/domaine/fenetreDeModification.ts';
import { Cible } from '../../../src/environnement/domaine/Cible.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import { GitMemoire } from '../../doubles/GitMemoire.ts';

import { EntrepotDeScanMemoire } from '../../noyau/persistance/entrepots.ts';

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

const ENV_RACINE =
  'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\nFOURNISSEUR_MODELE=deepseek-v4-flash-0731\nLITELLM_BASE_URL=http://127.0.0.1:4000\nLITELLM_API_KEY=sk-local\n';

const systemeDeFichierConfigure = () =>
  new SystemeDeFichierEnMemoire({
    '.env': ENV_RACINE,
    [`cible/copies/${UNE_CIBLE}/src/noyau/environnement.ts`]: '',
    [`cible/copies/${UNE_CIBLE}/src/codex-security/application/lanceScan.ts`]: '',
  });

const uneGeneration = (doubles: Partial<Dependances> = {}) =>
  new GenereConfigCible({
    systemeDeFichier: systemeDeFichierConfigure(),
    console: new ConsoleEnMemoire(),
    git: new GitMemoire(['src/noyau/environnement.ts']),
    entrepot: new EntrepotDeScanMemoire(),
    ...doubles,
  });

describe('Génère Config Cible', () => {
  it('écrit la config ciblée, avec le modèle et le fournisseur de l’environnement', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    fournisseurAlbert();

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
    environnement.urlLiteLLMConfiguree = () => 'https://litellm.local';

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
    const git = new GitMemoire([
      'src/codex-security/application/lanceScan.ts',
      'src/noyau/environnement.ts',
    ]);

    uneGeneration({ systemeDeFichier, git }).execute(UNE_CIBLE, 30);

    const lu = parse(systemeDeFichier.lit(CHEMIN_FICHIER_CONFIG_CIBLE));
    expect(lu.scan.scope.paths).toEqual([
      'src/codex-security/application/lanceScan.ts',
      'src/noyau/environnement.ts',
    ]);
    expect(git.nombreDeJoursDemande).toBe(30);
  });

  it('met à jour la copie de travail de la cible avant de calculer le diff', () => {
    const git = new GitMemoire();

    uneGeneration({ git }).execute('mon-projet', NOMBRE_DE_JOURS_PAR_DEFAUT);

    expect(git.repertoireMisAJour).toBe(
      new Cible({ nom: 'mon-projet' }).copieDeTravail
    );
    expect(git.misAJourAvantLeDiff).toBe(true);
  });

  it('interroge le dépôt git sur la copie de travail de la cible passée en paramètre', () => {
    const git = new GitMemoire();

    uneGeneration({ git }).execute('mon-projet', NOMBRE_DE_JOURS_PAR_DEFAUT);

    expect(git.repertoireDemande).toBe(
      new Cible({ nom: 'mon-projet' }).copieDeTravail
    );
  });

  it('refuse de générer sans .env racine (fournisseur non configuré)', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire();

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

    uneGeneration({ console }).execute(UNE_CIBLE, NOMBRE_DE_JOURS_PAR_DEFAUT);

    expect(console.lignes.map((l) => l.message)[0]).toBe(
      'Mise à jour de la copie de travail : cible/copies/la-cible'
    );
  });

  it('annonce le fichier généré et le fournisseur configuré', () => {
    const console = new ConsoleEnMemoire();

    uneGeneration({ console }).execute(UNE_CIBLE, NOMBRE_DE_JOURS_PAR_DEFAUT);

    expect(console.lignes.map((l) => l.message)).toEqual([
      'Mise à jour de la copie de travail : cible/copies/la-cible',
      'Généré: outils/codex-security/configs/config-la-cible.yaml',
      '  Périmètre ciblé pour le fournisseur : albert (1 fichier)',
      '  Informations d’historique Git : 7 derniers jours (premier commit : 440e7be3, dernier commit : d852e879)',
    ]);
  });

  it('renvoie le chemin du fichier généré, à passer ensuite au scan (--config)', () => {
    const chemin = uneGeneration().execute(UNE_CIBLE, NOMBRE_DE_JOURS_PAR_DEFAUT);

    expect(chemin).toBe(CHEMIN_FICHIER_CONFIG_CIBLE);
  });

  it('génère un fichier distinct par cible pour industrialiser plusieurs projets', () => {
    const systemeDeFichier = systemeDeFichierConfigure();

    const chemin = uneGeneration({ systemeDeFichier }).execute(
      'projet-x',
      NOMBRE_DE_JOURS_PAR_DEFAUT
    );

    expect(chemin).toBe('outils/codex-security/configs/config-projet-x.yaml');
    expect(systemeDeFichier.existe(chemin)).toBe(true);
  });

  it('vérifie l’existence des fichiers modifiers dans le dossier cible', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    const git = new GitMemoire([
      'src/codex-security/application/lanceScan.ts',
      'src/codex-security/ancien-dossier/ancien-fichier.ts',
      'src/noyau/environnement.ts',
    ]);

    uneGeneration({ systemeDeFichier, git }).execute(UNE_CIBLE, 30);

    const lu = parse(systemeDeFichier.lit(CHEMIN_FICHIER_CONFIG_CIBLE));
    expect(lu.scan.scope.paths).toEqual([
      'src/codex-security/application/lanceScan.ts',
      'src/noyau/environnement.ts',
    ]);
    expect(git.nombreDeJoursDemande).toBe(30);
  });

  it('persiste les informations de la configuration générée', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    const git = new GitMemoire([
      'src/codex-security/application/lanceScan.ts',
      'src/noyau/environnement.ts',
    ]);
    const entrepotMemoire = new EntrepotDeScanMemoire();

    uneGeneration({ systemeDeFichier, git, entrepot: entrepotMemoire }).execute(
      UNE_CIBLE,
      NOMBRE_DE_JOURS_PAR_DEFAUT
    );

    expect(entrepotMemoire.tousLesElements).toEqual([
      {
        [UNE_CIBLE]: {
          premierCommit: '440e7be3397d56a67f4fbda13c1d0c0ad9a36374',
          dernierCommit: 'd852e87954688029939791687afffe34c81bc361',
          dureeHistorique: 7,
          nombreDeFichiers: 2,
        },
      },
    ]);
  });

  it('persiste les informations de la configuration générée avec absence de commits', () => {
    const systemeDeFichier = systemeDeFichierConfigure();
    const git = new GitMemoire([]);
    const entrepotMemoire = new EntrepotDeScanMemoire();

    uneGeneration({ systemeDeFichier, git, entrepot: entrepotMemoire }).execute(
      UNE_CIBLE,
      NOMBRE_DE_JOURS_PAR_DEFAUT
    );

    expect(entrepotMemoire.tousLesElements).toEqual([
      {
        [UNE_CIBLE]: {
          dureeHistorique: 7,
          nombreDeFichiers: 0,
        },
      },
    ]);
  });
});
