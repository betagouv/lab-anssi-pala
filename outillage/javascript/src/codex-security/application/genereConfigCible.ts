import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { environnement } from '../../noyau/environnement.ts';
import { Cible } from '../../environnement/domaine/Cible.ts';
import { ConfigurationCible } from '../domaine/ConfigurationCible.ts';
import { cheminConfigCible } from '../domaine/cheminConfig.ts';
import { join } from 'path';
import type { Git } from '../../bootstrap/ports/Git.ts';

export type Dependances = {
  systemeDeFichier: SystemeDeFichier;
  console: Console;
  git: Git;
};

export class GenereConfigCible {
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #console: Console;
  readonly #git: Git;

  constructor({ systemeDeFichier, console, git }: Dependances) {
    this.#systemeDeFichier = systemeDeFichier;
    this.#console = console;
    this.#git = git;
  }

  execute(nomCible: string, nombreDeJours: number): string {
    environnement.verifiePresenceVariablesRacine(this.#systemeDeFichier);
    const fournisseur = environnement.fournisseur();
    const cible = new Cible({ nom: nomCible });
    this.#git.metAJour(cible.copieDeTravail);
    this.#console.aLaLigne(
      `Mise à jour de la copie de travail : ${cible.copieDeTravail}`,
      'VERT'
    );
    const fichiersModifies = this.#git
      .fichiersModifiesDepuis(cible.copieDeTravail, nombreDeJours)
      .liste.filter((f) =>
        this.#systemeDeFichier.existe(`${join(cible.copieDeTravail, f)}`)
      );

    const config = new ConfigurationCible({
      modele: fournisseur.modele,
      fournisseur: fournisseur.nom,
      urlProxy: environnement.urlLiteLLMConfiguree(),
      chemins: fichiersModifies,
    });

    const cheminConfig = cheminConfigCible(nomCible);
    this.#systemeDeFichier.ecritFichier(cheminConfig, config.versYaml());

    const nombreDeFichiersModifies = fichiersModifies.length;
    this.#console.aLaLigne(`Généré: ${cheminConfig}`, 'VERT');
    this.#console.aLaLigne(
      `  Périmètre ciblé pour le fournisseur : ${fournisseur.nom} ` +
        `(${nombreDeFichiersModifies} fichier${nombreDeFichiersModifies > 1 ? 's' : ''})`,
      'VERT'
    );

    return cheminConfig;
  }
}
