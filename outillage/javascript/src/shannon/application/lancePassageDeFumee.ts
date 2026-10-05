// Passage de vérification de Shannon contre une cible locale triviale, avant de dépenser un vrai
// pentest. Portage TS de run-smoke.sh, rendu agnostique du fournisseur : le modèle et sa
// description pi viennent de shannon.env.
import { join } from 'node:path';
import type { Console } from '../../noyau/ports/Console.ts';
import type { Environnement } from '../../noyau/ports/Environnement.ts';
import type { Horloge } from '../../noyau/ports/Horloge.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { SpecModele } from '../domaine/SpecModele.ts';
import type { ServeurCibleFumee } from '../ports/ServeurCibleFumee.ts';
import type { Shannon } from '../ports/Shannon.ts';
import { InstallationShannon } from './installationShannon.ts';

export type Dependances = {
  // Racine absolue du dépôt d'audit.
  racine: string;
  shannon: Shannon;
  serveur: ServeurCibleFumee;
  systemeDeFichier: SystemeDeFichier;
  horloge: Horloge;
  environnement: Environnement;
  console: Console;
};

export class LancePassageDeFumee {
  readonly #racine: string;
  readonly #shannon: Shannon;
  readonly #serveur: ServeurCibleFumee;
  readonly #installation: InstallationShannon;
  readonly #horloge: Horloge;

  constructor({
    racine,
    shannon,
    serveur,
    systemeDeFichier,
    horloge,
    environnement,
  }: Dependances) {
    this.#racine = racine;
    this.#shannon = shannon;
    this.#serveur = serveur;
    this.#installation = new InstallationShannon({
      systemeDeFichier,
      environnement,
    });
    this.#horloge = horloge;
  }

  async execute(): Promise<number> {
    this.#installation.verifieEnvironnementRenseigne();
    this.#installation.verifieCliConstruite();
    const environnement = this.#installation.environnement();
    const modele = SpecModele.exigee(environnement.SHANNON_AI_MODEL);
    const port = Number(environnement.SMOKE_PORT || '8080');
    await this.#serveur.demarre(port);
    try {
      return await this.#shannon.demarre({
        url: `http://host.docker.internal:${port}`,
        depot: join(this.#racine, 'outils/shannon/smoke-target'),
        modelsConfig: modele.descriptionPiDans(
          join(this.#racine, 'outils/shannon/configs')
        ),
        // Un même nom reprend le workspace existant au lieu d'en créer un neuf : horodaté par défaut.
        // SMOKE_WORKSPACE force la reprise d'un workspace précis (ne rejoue que la partie en échec).
        workspace:
          environnement.SMOKE_WORKSPACE ||
          `${modele.fournisseur}-smoke-${Math.floor(this.#horloge.maintenant().getTime() / 1000)}`,
        pipelineTesting: environnement.SMOKE_REAL !== '1',
        environnement,
      });
    } finally {
      await this.#serveur.arrete();
    }
  }
}
