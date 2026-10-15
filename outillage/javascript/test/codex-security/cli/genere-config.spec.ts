import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { DepotGitEnMemoire } from '../../doubles/DepotGitEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { genereConfig } from '../../../src/codex-security/cli/genere-config.ts';
import { cheminConfigCible } from '../../../src/codex-security/domaine/cheminConfig.ts';
import { NOMBRE_DE_JOURS_PAR_DEFAUT } from '../../../src/codex-security/domaine/fenetreDeModification.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import {
  ENVIRONNEMENT_CODEX_SECURITY,
  ENVIRONNEMENT_PROXY,
} from '../../doubles/environnement.ts';

const ENV_RACINE =
  'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\nFOURNISSEUR_MODELE=deepseek-v4-flash-0731\n';

const environnementConfigure = () => {
  environnement.fournisseur = () => ({
    apiKey: 'cle-fournisseur',
    modele: 'deepseek-v4-flash-0731',
    nom: 'albert',
    url: 'https://fournisseur.example/v1',
  });
  environnement.pourCodexSecurity = () => ({
    ...ENVIRONNEMENT_CODEX_SECURITY,
    proxy: () => ENVIRONNEMENT_PROXY,
  });
};

describe('génère-config (ligne de commande)', () => {
  it("signale l'erreur et sort en code 1 quand la génération échoue", async () => {
    const console = new ConsoleEnMemoire();

    const code = await genereConfig(['--cible', 'test'], {
      systemeDeFichier: new SystemeDeFichierEnMemoire(),
      console,
      depotGit: new DepotGitEnMemoire(),
    });

    expect(code).toBe(1);
    expect(console.erreurs.map((l) => l.message)).toEqual([
      'Erreur: fichier .env introuvable à la racine du dépôt (depuis .env.template)',
    ]);
  });

  it('génère la config pour la cible passée en option --cible', async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });
    environnementConfigure();

    const code = await genereConfig(['--cible', 'projet-x'], {
      systemeDeFichier,
      console: new ConsoleEnMemoire(),
      depotGit: new DepotGitEnMemoire(['src/noyau/environnement.ts']),
    });

    expect(code).toBe(0);
    expect(systemeDeFichier.existe(cheminConfigCible('projet-x'))).toBe(true);
  });

  it('transmet la fenêtre de jours passée en option --jours', async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });
    environnementConfigure();
    const depotGit = new DepotGitEnMemoire(['src/noyau/environnement.ts']);

    const code = await genereConfig(['--cible', 'projet-x', '--jours', '30'], {
      systemeDeFichier,
      console: new ConsoleEnMemoire(),
      depotGit,
    });

    expect(code).toBe(0);
    expect(depotGit.nombreDeJoursDemande).toBe(30);
  });

  it('utilise la fenêtre par défaut sans option --jours', async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });
    environnementConfigure();
    const depotGit = new DepotGitEnMemoire(['src/noyau/environnement.ts']);

    await genereConfig(['--cible', 'projet-x'], {
      systemeDeFichier,
      console: new ConsoleEnMemoire(),
      depotGit,
    });

    expect(depotGit.nombreDeJoursDemande).toBe(NOMBRE_DE_JOURS_PAR_DEFAUT);
  });

  it('rejette une fenêtre --jours qui n’est pas un entier positif', async () => {
    const console = new ConsoleEnMemoire();

    const code = await genereConfig(['--cible', 'projet-x', '--jours', '-3'], {
      systemeDeFichier: new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE }),
      console,
      depotGit: new DepotGitEnMemoire(),
    });

    expect(code).toBe(2);
    expect(console.erreurs.map((l) => l.message)).toContain(
      'Erreur : --jours doit être un entier positif (reçu « -3 »).'
    );
  });
});
