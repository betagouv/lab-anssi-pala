// Passage de vérification de Shannon contre une cible locale triviale, avant de dépenser un vrai
// pentest. Portage TS de run-smoke.sh, rendu agnostique du fournisseur : le modèle et sa
// description pi viennent de shannon.env.
import { join } from 'node:path';
import type { Console } from '../../noyau/ports/Console.ts';
import type { Horloge } from '../../noyau/ports/Horloge.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { SpecModele } from '../domaine/SpecModele.ts';
import type { ServeurCibleFumee } from '../ports/ServeurCibleFumee.ts';
import type { Shannon } from '../ports/Shannon.ts';
import { InstallationShannon } from './installationShannon.ts';
import { environnement } from '../../noyau/environnement.ts';

export type Dependances = {
  // Racine absolue du dépôt d'audit.
  racine: string;
  shannon: Shannon;
  serveur: ServeurCibleFumee;
  systemeDeFichier: SystemeDeFichier;
  horloge: Horloge;
  console: Console;
};

export class LancePassageDeFumee {
  readonly #racine: string;
  readonly #shannon: Shannon;
  readonly #serveur: ServeurCibleFumee;
  readonly #installation: InstallationShannon;
  readonly #horloge: Horloge;

  constructor({ racine, shannon, serveur, systemeDeFichier, horloge }: Dependances) {
    this.#racine = racine;
    this.#shannon = shannon;
    this.#serveur = serveur;
    this.#installation = new InstallationShannon({
      systemeDeFichier,
    });
    this.#horloge = horloge;
  }

  async execute(): Promise<number> {
    this.#installation.verifieEnvironnementRenseigne();
    this.#installation.verifieCliConstruite();
    const modele = SpecModele.exigee(environnement.pourShannon().model);
    const port = environnement.pourShannon().portTestDeFumee;
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
        // TODO : SMOKE_WORKSPACE non utilisée car non provisionnée OSEF le commentaire au dessus
        workspace:
          environnement.pourShannon().espaceDeTravail ||
          `${modele.fournisseur}-smoke-${Math.floor(this.#horloge.maintenant().getTime() / 1000)}`,
        pipelineTesting: !environnement.pourShannon().testPipelineActive,
        environnement: {
          SHANNON_AI_MODEL: environnement.pourShannon().model,
          SHANNON_AI_API_KEY: environnement.pourShannon().apiKey,
          PATH: environnement.path,
        },
      });
    } finally {
      await this.#serveur.arrete();
    }
  }
}
