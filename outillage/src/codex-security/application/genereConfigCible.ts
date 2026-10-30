import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { environnement } from '../../noyau/environnement.ts';
import { Cible } from '../../environnement/domaine/Cible.ts';
import { ConfigurationCible } from '../domaine/ConfigurationCible.ts';
import { cheminConfigCible } from '../domaine/cheminConfig.ts';
import { join } from 'path';
import type { Git } from '../../bootstrap/ports/Git.ts';
import type { Scan } from '../../noyau/partage/scan.ts';
import type { Entrepot } from '../../noyau/persistance/entrepots.ts';

export type Dependances = {
  systemeDeFichier: SystemeDeFichier;
  console: Console;
  git: Git;
  entrepot: Entrepot<Scan>;
};

export class GenereConfigCible {
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #console: Console;
  readonly #git: Git;
  #entrepot: Entrepot<Scan>;

  constructor({ systemeDeFichier, console, git, entrepot }: Dependances) {
    this.#systemeDeFichier = systemeDeFichier;
    this.#console = console;
    this.#git = git;
    this.#entrepot = entrepot;
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
    const modifications = this.#git.fichiersModifiesDepuis(
      cible.copieDeTravail,
      nombreDeJours
    );
    const fichiersModifies = modifications.liste.filter((f) =>
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

    this.#entrepot.persiste({
      [nomCible]: {
        ...(modifications.premierCommit && {
          premierCommit: modifications.premierCommit.long,
        }),
        ...(modifications.dernierCommit && {
          dernierCommit: modifications.dernierCommit.long,
        }),
        dureeHistorique: nombreDeJours,
        nombreDeFichiers: nombreDeFichiersModifies,
      },
    });

    this.#console.aLaLigne(`Généré: ${cheminConfig}`, 'VERT');
    this.#console.aLaLigne(
      `  Périmètre ciblé pour le fournisseur : ${fournisseur.nom} ` +
        `(${nombreDeFichiersModifies} fichier${nombreDeFichiersModifies > 1 ? 's' : ''})`,
      'VERT'
    );
    this.#console.aLaLigne(
      `  Informations d’historique Git : ${nombreDeJours} derniers jours ` +
        `(premier commit : ${modifications.premierCommit?.court}, dernier commit : ${modifications.dernierCommit?.court})`,
      'VERT'
    );

    return cheminConfig;
  }
}
