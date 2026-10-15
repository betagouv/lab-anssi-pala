import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { environnement } from '../../noyau/environnement.ts';
import { ConfigurationCible } from '../domaine/ConfigurationCible.ts';
import {
  CHEMINS_A_SCANNER_PAR_DEFAUT,
  cheminConfigCible,
} from '../domaine/cheminConfig.ts';

export type Dependances = {
  systemeDeFichier: SystemeDeFichier;
  console: Console;
};

export class GenereConfigCible {
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #console: Console;

  constructor({ systemeDeFichier, console }: Dependances) {
    this.#systemeDeFichier = systemeDeFichier;
    this.#console = console;
  }

  execute(nomCible: string): string {
    environnement.verifiePresenceFichierRacine(this.#systemeDeFichier);
    const fournisseur = environnement.fournisseur();
    const proxy = environnement.pourCodexSecurity().proxy(this.#systemeDeFichier);

    const config = new ConfigurationCible({
      modele: fournisseur.modele,
      fournisseur: fournisseur.nom,
      portProxy: proxy.portLiteLLM,
      chemins: CHEMINS_A_SCANNER_PAR_DEFAUT,
    });

    const cheminConfig = cheminConfigCible(nomCible);
    this.#systemeDeFichier.ecritFichier(cheminConfig, config.versYaml());

    const nombreDeChemins = CHEMINS_A_SCANNER_PAR_DEFAUT.length;
    this.#console.aLaLigne(`Généré: ${cheminConfig}`, 'VERT');
    this.#console.aLaLigne(
      `  Périmètre ciblé pour le fournisseur : ${fournisseur.nom} ` +
        `(${nombreDeChemins} chemin${nombreDeChemins > 1 ? 's' : ''})`,
      'VERT'
    );

    return cheminConfig;
  }
}
