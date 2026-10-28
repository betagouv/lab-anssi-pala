// Prépare l'environnement d'audit : sous-modules des outils, copie de travail de la cible,
// préparation propre à chaque outil.
//
// Idempotent : peut être relancé sans effet de bord (copie déjà présente = conservée).
import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import type { CibleBootstrap } from '../domaine/CibleBootstrap.ts';
import type { PreparationOutil } from '../domaine/PreparationOutil.ts';
import type { Git } from '../ports/Git.ts';

export type Dependances = {
  git: Git;
  systemeDeFichier: SystemeDeFichier;
  console: Console;
  outils: PreparationOutil[];
};

const OUTILS = ['outils/codex-security/source/.git', 'outils/shannon/source/.git'];

export class PrepareEnvironnement {
  readonly #git: Git;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #console: Console;
  readonly #outils: PreparationOutil[];

  constructor({ git, systemeDeFichier, console, outils }: Dependances) {
    this.#git = git;
    this.#systemeDeFichier = systemeDeFichier;
    this.#console = console;
    this.#outils = outils;
  }

  async execute({ cible }: { cible?: CibleBootstrap }): Promise<void> {
    await this.#initialiseSousModules();
    await this.#prepareCopiesDeScan(cible);
    await this.#prepareOutils();
    this.#recapituleFichiersEnvironnement();
    if (cible) this.#rappelleCommentCibler(cible);
  }

  async #initialiseSousModules(): Promise<void> {
    if (OUTILS.some((o) => !this.#systemeDeFichier.existe(o))) {
      this.#console.aLaLigne(
        '==> Sous-modules des outils : pas de dépôt git ici (ex. déploiement) — sources supposées déjà présentes, étape ignorée',
        'GRIS'
      );
      return;
    }
    this.#console.aLaLigne('==> Initialisation des sous-modules des outils');
    await this.#git.initialiseSousModules();
  }

  async #prepareCopiesDeScan(cible?: CibleBootstrap): Promise<void> {
    this.#console.aLaLigne(
      '==> Copies de scan (cible/copies/, non versionnées)',
      'GRIS'
    );
    this.#systemeDeFichier.creeDossier('cible/copies');
    if (!cible) {
      this.#console.aLaLigne(
        '    (aucune cible demandée : passer --project <nom> --url <git-url> pour en cloner une)',
        'ROUGE'
      );
      return;
    }
    if (this.#systemeDeFichier.existe(cible.copieDeTravail)) {
      this.#console.aLaLigne(
        `    conservé : ${cible.copieDeTravail} (déjà présent)`,
        'VERT'
      );
      return;
    }
    const branche = cible.branche ? ` (branche ${cible.branche})` : '';
    this.#console.aLaLigne(
      `    clone de la cible « ${cible.nom} » depuis ${cible.url}${branche}`,
      'GRIS'
    );
    await this.#git.cloneCible(cible);
    this.#console.aLaLigne(`    créé : ${cible.copieDeTravail}`, 'VERT');
  }

  async #prepareOutils(): Promise<void> {
    for (const outil of this.#outils) {
      this.#console.aLaLigne(`==> Préparation de ${outil.nom}`, 'GRIS');
      await outil.prepare();
    }
  }

  #recapituleFichiersEnvironnement(): void {
    this.#console.aLaLigne(
      "==> Terminé. Fichiers d'environnement à renseigner (non versionnés) :",
      'ORANGE'
    );
    this.#console.aLaLigne(
      '    .env                             (depuis .env.template)',
      'BLEU'
    );
    for (const { fichierEnvironnement: fichier } of this.#outils) {
      if (!fichier) continue;
      const etat = this.#systemeDeFichier.existe(fichier) ? 'présent' : 'à créer';
      const modele = `${fichier.split('/').at(-1)}.template`;
      this.#console.aLaLigne(
        `    ${fichier.padEnd(32)} (depuis ${modele} — ${etat})`,
        'BLEU'
      );
    }
    this.#console.aLaLigne(
      '    ainsi que les configs Shannon remplies, depuis outils/shannon/configs/*.template.yaml.',
      'BLEU'
    );
  }

  #rappelleCommentCibler(cible: CibleBootstrap): void {
    const variableCible = `CIBLE="$PWD/${cible.copieDeTravail}"`;
    this.#console.aLaLigne('');
    this.#console.aLaLigne(`==> Cible prête : ${cible.copieDeTravail}`, 'VERT');
    this.#console.aLaLigne(`    Codex Security :`, 'BLEU');
    this.#console.aLaLigne(
      `       Pour un scan par défaut : ${variableCible} pnpm scan`,
      'BLEU'
    );
    this.#console.aLaLigne(
      `       Pour un scan avec configuration : ${variableCible} CONFIG="$PWD/outils/codex-security/configs/<fichier_config>.yaml" pnpm scan`,
      'BLEU'
    );
    this.#console.aLaLigne(
      `    Shannon        : pnpm shannon --project ${cible.nom} --url <url-app> --config <fichier>`,
      'JAUNE'
    );
  }
}
