import type { Console } from '../../noyau/ports/Console.ts';
import { type ConsommationDeTokens } from '../domaine/consommationDeTokens.ts';
import { calculeCout } from '../domaine/cout.ts';
import { TARIFS } from '../domaine/Tarifs.ts';

export type Dependances = { console: Console };

const milliers = (n: number) => n.toLocaleString('fr-FR').replace(/\s/g, ' ');

export class EstimationDuCout {
  readonly #console: Console;

  constructor({ console }: Dependances) {
    this.#console = console;
  }

  rapporte(releve: ConsommationDeTokens | null): void {
    this.#console.aLaLigne('--- Coût estimé ---', 'GRIS');
    const cout = calculeCout(releve);
    if (cout.type === 'indisponible') {
      this.#console.aLaLigne(
        '  tokens indisponibles (run non terminé ?) : coût non calculable',
        'ORANGE'
      );
      return;
    }

    const { fournisseur, modele, entree, cache, sortie } = releve!;
    const entreeTotale = entree + cache;
    this.#console.aLaLigne(
      `  Modèle    : ${modele} (fournisseur ${fournisseur})`,
      'BLEU'
    );
    this.#console.aLaLigne(
      `  Tokens    : ${milliers(entreeTotale)} entrée (dont ${milliers(cache)} en cache), ${milliers(sortie)} sortie`,
      'VIOLET'
    );

    if (cout.type === 'gratuit') {
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

    if (cout.type === 'tarifInconnu') {
      this.#console.aLaLigne(
        `  Coût      : tarif inconnu pour « ${modele} » — compléter TARIFS dans outillage/src/cout/domaine/Tarifs.ts`,
        'ROUGE'
      );
      return;
    }

    const tarif = TARIFS[modele]!;
    this.#console.aLaLigne(
      `  Coût      : ~${cout.montantEnEuros.toFixed(2)} € (${tarif.note} : ${tarif.entree} €/M entrée, ${tarif.sortie} €/M sortie)`,
      cout.montantEnEuros > 10 ? 'ROUGE' : 'VERT'
    );
    this.#console.aLaLigne(
      "  Note      : estimation haute (cache compté au tarif d'entrée) ; à confronter au relevé du fournisseur.",
      'ORANGE'
    );
  }
}
