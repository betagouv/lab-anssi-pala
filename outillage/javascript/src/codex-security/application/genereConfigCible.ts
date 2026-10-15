import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { environnement } from '../../noyau/environnement.ts';
import { Cible } from '../../environnement/domaine/Cible.ts';
import { ConfigurationCible } from '../domaine/ConfigurationCible.ts';
import { cheminConfigCible } from '../domaine/cheminConfig.ts';
import { NOMBRE_DE_JOURS_PAR_DEFAUT } from '../domaine/fenetreDeModification.ts';
import type { DepotGit } from '../ports/DepotGit.ts';

export type Dependances = {
  systemeDeFichier: SystemeDeFichier;
  console: Console;
  depotGit: DepotGit;
};

export class GenereConfigCible {
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #console: Console;
  readonly #depotGit: DepotGit;

  constructor({ systemeDeFichier, console, depotGit }: Dependances) {
    this.#systemeDeFichier = systemeDeFichier;
    this.#console = console;
    this.#depotGit = depotGit;
  }

  execute(nomCible: string): string {
    environnement.verifiePresenceFichierRacine(this.#systemeDeFichier);
    const fournisseur = environnement.fournisseur();
    const proxy = environnement.pourCodexSecurity().proxy(this.#systemeDeFichier);
    const cible = new Cible({ nom: nomCible });
    const chemins = this.#depotGit.fichiersModifiesDepuis(
      cible.copieDeTravail,
      NOMBRE_DE_JOURS_PAR_DEFAUT
    );

    const config = new ConfigurationCible({
      modele: fournisseur.modele,
      fournisseur: fournisseur.nom,
      portProxy: proxy.portLiteLLM,
      chemins,
    });

    const cheminConfig = cheminConfigCible(nomCible);
    this.#systemeDeFichier.ecritFichier(cheminConfig, config.versYaml());

    const nombreDeChemins = chemins.length;
    this.#console.aLaLigne(`Généré: ${cheminConfig}`, 'VERT');
    this.#console.aLaLigne(
      `  Périmètre ciblé pour le fournisseur : ${fournisseur.nom} ` +
        `(${nombreDeChemins} chemin${nombreDeChemins > 1 ? 's' : ''})`,
      'VERT'
    );

    return cheminConfig;
  }
}
