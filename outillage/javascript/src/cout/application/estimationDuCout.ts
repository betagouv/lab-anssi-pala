import type { Console } from '../../noyau/ports/Console.ts';
import { type ConsommationDeTokens } from '../domaine/consommationDeTokens.ts';
import { estGratuit, type Tarif, TARIFS } from '../domaine/Tarifs.ts';

export type Dependances = { console: Console };

const milliers = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ' ');

export class EstimationDuCout {
  readonly #console: Console;

  constructor({ console }: Dependances) {
    this.#console = console;
  }

  rapporte(releve: ConsommationDeTokens | null): void {
    this.#console.aLaLigne('--- Coût estimé ---', 'GRIS');
    if (!releve) {
      this.#console.aLaLigne(
        '  tokens indisponibles (run non terminé ?) : coût non calculable',
        'ORANGE'
      );
      return;
    }

    const entreeTotale = releve.entree + releve.cache;
    const coutAu = (tarif: Tarif) =>
      (entreeTotale * tarif.entree) / 1e6 + (releve.sortie * tarif.sortie) / 1e6;

    const fournisseur = releve.fournisseur;
    const modele = releve.modele;
    this.#console.aLaLigne(
      `  Modèle    : ${modele} (fournisseur ${fournisseur})`,
      'BLEU'
    );
    this.#console.aLaLigne(
      `  Tokens    : ${milliers(entreeTotale)} entrée (dont ${milliers(releve.cache)} en cache), ${milliers(releve.sortie)} sortie`,
      'VIOLET'
    );
    if (estGratuit(fournisseur)) {
      this.#console.aLaLigne(
        '  Coût      : 0 € — Albert (DINUM), service gratuit',
        'VERT'
      );
      this.#console.aLaLigne(
        '  Note      : Albert sous-estime les tokens de sortie (raisonnement/outils non comptés).',
        'GRIS'
      );
      return;
    }
    const tarif = TARIFS[modele];
    if (!tarif) {
      this.#console.aLaLigne(
        `  Coût      : tarif inconnu pour « ${modele} » — compléter TARIFS dans outillage/src/cout/domaine/Tarifs.ts`,
        'ROUGE'
      );
      return;
    }
    const cout = coutAu(tarif);
    this.#console.aLaLigne(
      `  Coût      : ~${cout.toFixed(2)} € (${tarif.note} : ${tarif.entree} €/M entrée, ${tarif.sortie} €/M sortie)`,
      cout > 10 ? 'ROUGE' : 'VERT'
    );
    this.#console.aLaLigne(
      "  Note      : estimation haute (cache compté au tarif d'entrée) ; à confronter au relevé du fournisseur.",
      'ORANGE'
    );
  }
}
