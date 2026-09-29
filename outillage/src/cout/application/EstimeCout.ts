// Estime le coût d'un run (scan Codex Security ou pentest Shannon) à partir des tokens consommés.
// Portage TS de scripts/estimer-cout.py : même rapport, ligne pour ligne.
import type { Console } from "../../noyau/ports/Console.ts";
import type { SystemeDeFichier } from "../../noyau/ports/SystemeDeFichier.ts";
import { ReleveDeTokens } from "../domaine/ReleveDeTokens.ts";
import { estGratuit, TARIFS } from "../domaine/Tarifs.ts";

type Dependances = { systemeDeFichier: SystemeDeFichier; console: Console };

// Séparateur de milliers « , » quelle que soit la locale, comme le format Python « {:,} ».
const milliers = (n: number) => n.toLocaleString("en-US");

export class EstimeCout {
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #console: Console;

  constructor({ systemeDeFichier, console }: Dependances) {
    this.#systemeDeFichier = systemeDeFichier;
    this.#console = console;
  }

  surLogCodex({ log, fournisseur, modele }: { log: string; fournisseur: string; modele: string }): void {
    this.#rapporte(ReleveDeTokens.depuisLogCodex(this.#systemeDeFichier.lit(log)), fournisseur, modele);
  }

  // specModele : valeur de SHANNON_AI_MODEL, « fournisseur:modèle ».
  surSessionShannon({ session, specModele }: { session: string; specModele: string }): void {
    const [fournisseur, ...modele] = specModele.split(":");
    this.#rapporte(ReleveDeTokens.depuisSessionShannon(this.#systemeDeFichier.lit(session)), fournisseur, modele.join(":"));
  }

  #rapporte(releve: ReleveDeTokens | null, fournisseur: string, modele: string): void {
    this.#console.affiche("--- Coût estimé ---");
    if (!releve) {
      this.#console.affiche("  tokens indisponibles (run non terminé ?) : coût non calculable");
      return;
    }
    this.#console.affiche(`  Modèle    : ${modele} (fournisseur ${fournisseur})`);
    this.#console.affiche(
      `  Tokens    : ${milliers(releve.entreeTotale)} entrée (dont ${milliers(releve.cache)} en cache), ${milliers(releve.sortie)} sortie`,
    );
    if (estGratuit(fournisseur)) {
      this.#console.affiche("  Coût      : 0 € — Albert (DINUM), service gratuit");
      this.#console.affiche("  Note      : Albert sous-estime les tokens de sortie (raisonnement/outils non comptés).");
      return;
    }
    const tarif = TARIFS[modele];
    if (!tarif) {
      this.#console.affiche(
        `  Coût      : tarif inconnu pour « ${modele} » — compléter TARIFS dans outillage/src/cout/domaine/Tarifs.ts`,
      );
      return;
    }
    const cout = releve.coutAu(tarif);
    this.#console.affiche(
      `  Coût      : ~${cout.toFixed(2)} € (${tarif.note} : ${tarif.entree} €/M entrée, ${tarif.sortie} €/M sortie)`,
    );
    this.#console.affiche(
      "  Note      : estimation haute (cache compté au tarif d'entrée) ; à confronter au relevé du fournisseur.",
    );
  }
}
