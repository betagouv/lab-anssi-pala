// Lance (ou relance) le proxy LiteLLM qui traduit l'API Responses (Codex) vers l'API Chat
// Completions d'Albert et Scaleway. Portage TS de start-proxy.sh.
import type { Attente } from "../../noyau/ports/Attente.ts";
import type { Console } from "../../noyau/ports/Console.ts";
import type { Environnement } from "../../noyau/ports/Environnement.ts";
import type { Reseau } from "../../noyau/ports/Reseau.ts";
import type { ConfigurationProxy, ConteneurProxy } from "../ports/ConteneurProxy.ts";

// Génération de l'environnement du proxy (voir GenereEnvironnementProxy).
export interface GenerationEnvironnement {
  execute(): void;
}

// Image figée par digest (main-stable du 23/09/2026) : le pont Responses -> Chat évolue vite.
const IMAGE_PAR_DEFAUT =
  "ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02";

export type Dependances = {
  generation: GenerationEnvironnement;
  conteneur: ConteneurProxy;
  reseau: Reseau;
  attente: Attente;
  environnement: Environnement;
  console: Console;
};

export class DemarreProxy {
  readonly #generation: GenerationEnvironnement;
  readonly #conteneur: ConteneurProxy;
  readonly #reseau: Reseau;
  readonly #attente: Attente;
  readonly #environnement: Environnement;
  readonly #console: Console;

  constructor({ generation, conteneur, reseau, attente, environnement, console }: Dependances) {
    this.#generation = generation;
    this.#conteneur = conteneur;
    this.#reseau = reseau;
    this.#attente = attente;
    this.#environnement = environnement;
    this.#console = console;
  }

  async execute(): Promise<void> {
    const configuration = this.#configuration();
    this.#generation.execute();
    this.#annonceBudget(configuration);
    await this.#remplaceConteneur(configuration);
    await this.#attendsLeProxy(configuration.port);
  }

  #configuration(): ConfigurationProxy {
    const variables = this.#environnement.variables();
    const baseDeDonnees = variables.LITELLM_DATABASE_URL;
    return {
      port: variables.LITELLM_PORT || "4000",
      image: variables.LITELLM_IMAGE || IMAGE_PAR_DEFAUT,
      ...(baseDeDonnees && { baseDeDonnees }),
    };
  }

  // LiteLLM n'applique le plafond de budget (litellm/config.yaml) qu'avec une base de données.
  #annonceBudget({ baseDeDonnees }: ConfigurationProxy): void {
    this.#console.affiche(
      baseDeDonnees
        ? "Budget : enforcement actif (DATABASE_URL fournie)."
        : "Budget : suivi seul (pas de DATABASE_URL) — le plafond n'est pas bloquant. Voir le README.", 'ORANGE'
    );
  }

  async #remplaceConteneur(configuration: ConfigurationProxy): Promise<void> {
    await this.#conteneur.supprime();
    await this.#conteneur.demarre(configuration);
  }

  // Jusqu'à 60 tentatives espacées de 2 s (environ 2 minutes).
  async #attendsLeProxy(port: string): Promise<void> {
    this.#console.ecrit("Attente du proxy LiteLLM", 'GRIS');
    for (let tentative = 1; tentative <= 60; tentative++) {
      if (await this.#reseau.repond(`http://127.0.0.1:${port}/health/liveliness`)) {
        this.#console.affiche(` : prêt sur http://127.0.0.1:${port}/v1`, 'VERT');
        return;
      }
      this.#console.ecrit(".", 'GRIS');
      await this.#attente.attends(2000);
    }
    this.#console.affiche("");
    throw new Error("Erreur: le proxy ne répond pas — voir docker logs codex-security-litellm");
  }
}
