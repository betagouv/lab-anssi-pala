import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { GitMemoire } from '../../doubles/GitMemoire.ts';
import { PreparationOutilSimulee } from '../../doubles/PreparationOutilSimulee.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { CibleBootstrap } from '../../../src/bootstrap/domaine/CibleBootstrap.ts';
import {
  type Dependances,
  PrepareEnvironnement,
} from '../../../src/bootstrap/application/prepareEnvironnement.ts';

const unePreparation = (doubles: Partial<Dependances> = {}) => {
  const systemeDeFichier = new SystemeDeFichierEnMemoire({
    '.git': '',
    'outils/codex-security/source/.git': '',
    'outils/shannon/source/.git': '',
  });
  return new PrepareEnvironnement({
    git: new GitMemoire(),
    systemeDeFichier,
    console: new ConsoleEnMemoire(),
    outils: [],
    ...doubles,
  });
};

describe('Prépare l’environnement', () => {
  it('initialise les sous-modules des outils', async () => {
    const git = new GitMemoire();

    await unePreparation({ git }).execute({});

    expect(git.sousModulesInitialises).toBe(true);
  });

  it("n'initialise pas les sous-modules Git si l’entrepôt PALA n’est pas un checkout git (ex. déploiement)", async () => {
    const console = new ConsoleEnMemoire();
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      'outils/codex-security/source/.git': '',
      'outils/shannon/source/.git': '',
    });

    await unePreparation({ console, systemeDeFichier }).execute({});

    expect(systemeDeFichier.aLu('.git')).toBe(true);
    expect(console.lignes.map((ligne) => ligne.message)).toContain(
      '==> Sous-modules des outils : pas de dépôt git ici (ex. déploiement) — sources supposées déjà présentes, étape ignorée'
    );
  });

  it("n'initialise pas les sous-modules Git si l’entrepôt codex n’est pas un checkout git (ex. déploiement)", async () => {
    const console = new ConsoleEnMemoire();
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.git': '',
      'outils/codex-security/source/': '',
      'outils/shannon/source/.git': '',
    });

    await unePreparation({ console, systemeDeFichier }).execute({});

    expect(systemeDeFichier.aLu('outils/codex-security/source/.git')).toBe(true);
    expect(console.lignes.map((ligne) => ligne.message)).toContain(
      '==> Sous-modules des outils : pas de dépôt git ici (ex. déploiement) — sources supposées déjà présentes, étape ignorée'
    );
  });

  it("n'initialise pas les sous-modules Git si l’entrepôt shannon n’est pas un checkout git (ex. déploiement)", async () => {
    const console = new ConsoleEnMemoire();
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.git': '',
      'outils/codex-security/source/.git': '',
      'outils/shannon/source/': '',
    });

    await unePreparation({ console, systemeDeFichier }).execute({});

    expect(systemeDeFichier.aLu('outils/shannon/source/.git')).toBe(true);
    expect(console.lignes.map((ligne) => ligne.message)).toContain(
      '==> Sous-modules des outils : pas de dépôt git ici (ex. déploiement) — sources supposées déjà présentes, étape ignorée'
    );
  });

  it('crée le dossier des copies de scan', async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire();

    await unePreparation({ systemeDeFichier }).execute({});

    expect(systemeDeFichier.existe('cible/copies')).toBe(true);
  });

  it('clone la cible demandée dans sa copie de travail, sur la branche par défaut du dépôt distant', async () => {
    const git = new GitMemoire();
    const cible = new CibleBootstrap({
      nom: 'app',
      url: 'https://git.example/app.git',
    });

    await unePreparation({ git }).execute({ cible });

    expect(git.clonages).toEqual([
      {
        url: 'https://git.example/app.git',
        branche: undefined,
        copie: 'cible/copies/app',
      },
    ]);
  });

  it('conserve une copie de travail existante sans la recloner', async () => {
    const git = new GitMemoire();
    const systemeDeFichier = new SystemeDeFichierEnMemoire();
    systemeDeFichier.creeDossier('cible/copies/app');
    const console = new ConsoleEnMemoire();

    await unePreparation({ git, systemeDeFichier, console }).execute({
      cible: new CibleBootstrap({ nom: 'app', url: 'https://git.example/app.git' }),
    });

    expect(git.clonages).toEqual([]);
    expect(console.lignes.map((ligne) => ligne.message)).toContain(
      '    conservé : cible/copies/app (déjà présent)'
    );
  });

  it('annonce le clonage de la cible, avec la branche demandée, puis la copie créée', async () => {
    const console = new ConsoleEnMemoire();

    await unePreparation({ console }).execute({
      cible: new CibleBootstrap({
        nom: 'app',
        url: 'https://git.example/app.git',
        branche: 'main',
      }),
    });

    expect(console.lignes.map((ligne) => ligne.message)).toEqual(
      expect.arrayContaining([
        '    clone de la cible « app » depuis https://git.example/app.git (branche main)',
        '    créé : cible/copies/app',
      ])
    );
  });

  it("sans cible demandée, n'en clone aucune et indique comment en cloner une", async () => {
    const git = new GitMemoire();
    const console = new ConsoleEnMemoire();

    await unePreparation({ git, console }).execute({});

    expect(git.clonages).toEqual([]);
    expect(console.lignes.map((ligne) => ligne.message)).toContain(
      '    (aucune cible demandée : passer --project <nom> --url <git-url> pour en cloner une)'
    );
  });

  it("prépare chaque outil du registre, dans l'ordre, en l'annonçant", async () => {
    const console = new ConsoleEnMemoire();
    const journal: string[] = [];
    const codex = new PreparationOutilSimulee('codex-security', journal);
    const shannon = new PreparationOutilSimulee('shannon', journal);

    await unePreparation({ console, outils: [codex, shannon] }).execute({});

    expect(journal).toEqual(['codex-security', 'shannon']);
    expect(console.lignes.map((ligne) => ligne.message)).toEqual(
      expect.arrayContaining([
        '==> Préparation de codex-security',
        '==> Préparation de shannon',
      ])
    );
  });

  it("récapitule les fichiers d'environnement à renseigner, présents ou à créer", async () => {
    const console = new ConsoleEnMemoire();
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      'outils/shannon/shannon.env': 'SHANNON_AI_MODEL=albert:x',
    });
    const outils = [
      new PreparationOutilSimulee('codex-security', []),
      new PreparationOutilSimulee('shannon', [], 'outils/shannon/shannon.env'),
    ];

    await unePreparation({ console, systemeDeFichier, outils }).execute({});

    expect(console.lignes.slice(-4).map((ligne) => ligne.message)).toEqual([
      "==> Terminé. Fichiers d'environnement à renseigner (non versionnés) :",
      '    .env                             (depuis .env.template)',
      '    outils/shannon/shannon.env       (depuis shannon.env.template — présent)',
      '    ainsi que les configs Shannon remplies, depuis outils/shannon/configs/*.template.yaml.',
    ]);
  });

  it('rappelle comment cibler la copie de travail avec chaque outil', async () => {
    const console = new ConsoleEnMemoire();

    await unePreparation({ console }).execute({
      cible: new CibleBootstrap({ nom: 'app', url: 'https://git.example/app.git' }),
    });

    expect(console.lignes.slice(-6).map((ligne) => ligne.message)).toEqual([
      '',
      '==> Cible prête : cible/copies/app',
      '    Codex Security :',
      '       Pour un scan par défaut : CIBLE="$PWD/cible/copies/app" pnpm scan',
      '       Pour un scan avec configuration : CIBLE="$PWD/cible/copies/app" CONFIG="$PWD/outils/codex-security/configs/<fichier_config>.yaml" pnpm scan',
      '    Shannon        : pnpm shannon --project app --url <url-app> --config <fichier>',
    ]);
  });

  it('colore la sortie du bootstrap', async () => {
    const laConsole = new ConsoleEnMemoire();

    await unePreparation({ console: laConsole }).execute({
      cible: new CibleBootstrap({ nom: 'app', url: 'https://git.example/app.git' }),
    });

    let lesDernieresLignes = laConsole.lignes.slice(-6);

    expect(lesDernieresLignes[1].couleur).toBe('VERT');
    expect(lesDernieresLignes.slice(2, 4).every((l) => l.couleur === 'BLEU')).toBe(
      true
    );
    expect(lesDernieresLignes.slice(5).every((l) => l.couleur === 'JAUNE')).toBe(
      true
    );
  });
});
