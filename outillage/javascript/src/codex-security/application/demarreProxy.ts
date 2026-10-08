// Lance (ou relance) le proxy LiteLLM qui traduit l'API Responses (Codex) vers l'API Chat
// Completions d'Albert et Scaleway. Portage TS de start-proxy.sh.
import type { Attente } from '../../noyau/ports/Attente.ts';
import type { Console } from '../../noyau/ports/Console.ts';
import type { Reseau } from '../../noyau/ports/Reseau.ts';
import type { ConfigurationProxy, ConteneurProxy } from '../ports/ConteneurProxy.ts';
import { environnement } from '../../noyau/environnement.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';

// Image figée par digest (main-stable du 23/09/2026) : le pont Responses -> Chat évolue vite.
export type Dependances = {
  conteneur: ConteneurProxy;
  reseau: Reseau;
  attente: Attente;
  console: Console;
  systemeDeFichier: SystemeDeFichier;
};

export class DemarreProxy {
  readonly #conteneur: ConteneurProxy;
  readonly #reseau: Reseau;
  readonly #attente: Attente;
  readonly #console: Console;
  readonly #sytemeDeFichier: SystemeDeFichier;

  constructor({
    conteneur,
    reseau,
    attente,
    console,
    systemeDeFichier,
  }: Dependances) {
    this.#conteneur = conteneur;
    this.#reseau = reseau;
    this.#attente = attente;
    this.#console = console;
    this.#sytemeDeFichier = systemeDeFichier;
  }

  async execute(): Promise<void> {
    const configuration = this.#configuration();
    this.#annonceBudget(configuration);
    await this.#remplaceConteneur(configuration);
    await this.#attendsLeProxy(configuration.port);
  }

  #configuration(): ConfigurationProxy {
    const baseDeDonnees = environnement
      .pourCodexSecurity()
      .proxy(this.#sytemeDeFichier).urlBaseDeDonnees;
    return {
      port: environnement.pourCodexSecurity().proxy(this.#sytemeDeFichier)
        .portLiteLLM,
      image: environnement.pourCodexSecurity().proxy(this.#sytemeDeFichier).image,
      ...(baseDeDonnees && { baseDeDonnees }),
    };
  }

  // LiteLLM n'applique le plafond de budget (litellm/config.yaml) qu'avec une base de données.
  #annonceBudget({ baseDeDonnees }: ConfigurationProxy): void {
    this.#console.aLaLigne(
      baseDeDonnees
        ? 'Budget : enforcement actif (DATABASE_URL fournie).'
        : "Budget : suivi seul (pas de DATABASE_URL) — le plafond n'est pas bloquant. Voir le README.",
      'ORANGE'
    );
  }

  async #remplaceConteneur(configuration: ConfigurationProxy): Promise<void> {
    await this.#conteneur.supprime();
    await this.#conteneur.demarre(configuration);
  }

  // Jusqu'à 60 tentatives espacées de 2 s (environ 2 minutes).
  async #attendsLeProxy(port: number): Promise<void> {
    this.#console.sureUneSeuleLigne('Attente du proxy LiteLLM', 'GRIS');
    for (let tentative = 1; tentative <= 60; tentative++) {
      if (await this.#reseau.repond(`http://127.0.0.1:${port}/health/liveliness`)) {
        this.#console.aLaLigne(` : prêt sur http://127.0.0.1:${port}/v1`, 'VERT');
        return;
      }
      this.#console.sureUneSeuleLigne('.', 'GRIS');
      await this.#attente.attends(2000);
    }
    this.#console.aLaLigne('');
    throw new Error(
      'Erreur: le proxy ne répond pas — voir docker logs codex-security-litellm'
    );
  }
}
