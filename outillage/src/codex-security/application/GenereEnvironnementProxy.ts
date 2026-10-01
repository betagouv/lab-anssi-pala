// Génère l'environnement du proxy LiteLLM à partir du .env racine. Portage TS de generate-env.sh.
import { parseEnv } from "node:util";
import type { Console } from "../../noyau/ports/Console.ts";
import type { Environnement } from "../../noyau/ports/Environnement.ts";
import type { SystemeDeFichier } from "../../noyau/ports/SystemeDeFichier.ts";
import { EnvironnementProxy } from "../domaine/EnvironnementProxy.ts";
import type { GenerateurDeJeton } from "../ports/GenerateurDeJeton.ts";

export type Dependances = {
  systemeDeFichier: SystemeDeFichier;
  generateurDeJeton: GenerateurDeJeton;
  environnement: Environnement;
  console: Console;
};

export class GenereEnvironnementProxy {
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #generateurDeJeton: GenerateurDeJeton;
  readonly #environnement: Environnement;
  readonly #console: Console;

  constructor({ systemeDeFichier, generateurDeJeton, environnement, console }: Dependances) {
    this.#systemeDeFichier = systemeDeFichier;
    this.#generateurDeJeton = generateurDeJeton;
    this.#environnement = environnement;
    this.#console = console;
  }

  execute(): void {
    const environnement = EnvironnementProxy.depuis(this.#variablesDeLaRacine(), this.#jetonLocal());
    this.#systemeDeFichier.ecritFichierPrive(EnvironnementProxy.CHEMIN, environnement.contenu);
    this.#console.affiche(`Généré: ${EnvironnementProxy.CHEMIN}`, 'VERT');
    this.#console.affiche(`  Fournisseurs configurés pour le proxy : ${environnement.fournisseurs}`, 'BLEU');
  }

  // Comme `set -a; source .env` : le .env racine complète et surcharge l'environnement du shell.
  #variablesDeLaRacine(): Record<string, string | undefined> {
    if (!this.#systemeDeFichier.existe(".env")) {
      throw new Error("Erreur: fichier .env introuvable à la racine du dépôt (depuis .env.example)");
    }
    return { ...this.#environnement.variables(), ...parseEnv(this.#systemeDeFichier.lit(".env")) };
  }

  // Le jeton existant est conservé pour ne pas invalider un proxy en marche.
  #jetonLocal(): string {
    return this.#jetonExistant() ?? this.#generateurDeJeton.jetonLocal();
  }

  #jetonExistant(): string | undefined {
    if (!this.#systemeDeFichier.existe(EnvironnementProxy.CHEMIN)) return undefined;
    const jeton = parseEnv(this.#systemeDeFichier.lit(EnvironnementProxy.CHEMIN)).LITELLM_MASTER_KEY;
    return jeton?.startsWith("sk-") ? jeton : undefined;
  }
}
