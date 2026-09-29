// Prépare l'environnement d'audit : sous-modules des outils, copie de travail de la cible,
// préparation propre à chaque outil. Portage TS de scripts/bootstrap.sh.
//
// Idempotent : peut être relancé sans effet de bord (copie déjà présente = conservée).
import type { Console } from "../../noyau/ports/Console.ts";
import type { SystemeDeFichier } from "../../noyau/ports/SystemeDeFichier.ts";
import type { Cible } from "../domaine/Cible.ts";
import type { PreparationOutil } from "../domaine/PreparationOutil.ts";
import type { Git } from "../ports/Git.ts";

export type Dependances = {
  git: Git;
  systemeDeFichier: SystemeDeFichier;
  console: Console;
  outils: PreparationOutil[];
};

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

  async execute({ cible }: { cible?: Cible }): Promise<void> {
    await this.#initialiseSousModules();
    await this.#prepareCopiesDeScan(cible);
    await this.#prepareOutils();
    this.#recapituleFichiersEnvironnement();
    if (cible) this.#rappelleCommentCibler(cible);
  }

  async #initialiseSousModules(): Promise<void> {
    this.#console.affiche("==> Initialisation des sous-modules des outils");
    await this.#git.initialiseSousModules();
  }

  async #prepareCopiesDeScan(cible?: Cible): Promise<void> {
    this.#console.affiche("==> Copies de scan (cible/copies/, non versionnées)");
    this.#systemeDeFichier.creeDossier("cible/copies");
    if (!cible) {
      this.#console.affiche("    (aucune cible demandée : passer --project <nom> --url <git-url> pour en cloner une)");
      return;
    }
    if (this.#systemeDeFichier.existe(cible.copieDeTravail)) {
      this.#console.affiche(`    conservé : ${cible.copieDeTravail} (déjà présent)`);
      return;
    }
    const branche = cible.branche ? ` (branche ${cible.branche})` : "";
    this.#console.affiche(`    clone de la cible « ${cible.nom} » depuis ${cible.url}${branche}`);
    await this.#git.cloneCible(cible);
    this.#console.affiche(`    créé : ${cible.copieDeTravail}`);
  }

  async #prepareOutils(): Promise<void> {
    for (const outil of this.#outils) {
      this.#console.affiche(`==> Préparation de ${outil.nom}`);
      await outil.prepare();
    }
  }

  #recapituleFichiersEnvironnement(): void {
    this.#console.affiche("==> Terminé. Fichiers d'environnement à renseigner (non versionnés) :");
    this.#console.affiche("    .env                             (depuis .env.example — clé Albert commune)");
    for (const { fichierEnvironnement: fichier } of this.#outils) {
      const etat = this.#systemeDeFichier.existe(fichier) ? "présent" : "à créer";
      const modele = `${fichier.split("/").at(-1)}.template`;
      this.#console.affiche(`    ${fichier.padEnd(32)} (depuis ${modele} — ${etat})`);
    }
    this.#console.affiche("    ainsi que les configs Shannon remplies, depuis outils/shannon/configs/*.template.yaml.");
  }

  #rappelleCommentCibler(cible: Cible): void {
    const codexTarget = `CODEX_TARGET="$PWD/${cible.copieDeTravail}"`
    this.#console.affiche("");
    this.#console.affiche(`==> Cible prête : ${cible.copieDeTravail}`);
    this.#console.affiche(`    Codex Security :`);
    this.#console.affiche(`       Pour un scan par défaut : ${codexTarget} pnpm scan`);
    this.#console.affiche(`       Pour un scan avec configuration : ${codexTarget} CODEX_CONFIG="$PWD/outils/codex-security/configs/<fichier_config>.yaml" pnpm scan`);
    this.#console.affiche(`    Shannon        : pnpm shannon --project ${cible.nom} --url <url-app> --config <fichier>`);
  }
}
