import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { environnement } from '../../noyau/environnement.ts';
import { ConfigurationProxyLiteLLM } from '../domaine/ConfigurationProxyLiteLLM.ts';

export type Dependances = {
  systemeDeFichier: SystemeDeFichier;
  console: Console;
};

export class GenereConfigurationProxy {
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #console: Console;

  constructor({ systemeDeFichier, console }: Dependances) {
    this.#systemeDeFichier = systemeDeFichier;
    this.#console = console;
  }

  async execute(): Promise<void> {
    const parametres = environnement.pourProxyLiteLLM();
    this.#verifieCout(
      'FOURNISSEUR_COUT_ENTREE_PAR_TOKEN',
      parametres.configuration().coutEntreeParToken
    );
    this.#verifieCout(
      'FOURNISSEUR_COUT_SORTIE_PAR_TOKEN',
      parametres.configuration().coutSortieParToken
    );
    const config = new ConfigurationProxyLiteLLM(parametres);
    await this.#systemeDeFichier.ecritFichier(
      environnement.pourProxyLiteLLM().cheminFichierDeConfiguration,
      config.versYaml()
    );
    this.#console.aLaLigne(
      `Généré: ${environnement.pourProxyLiteLLM().cheminFichierDeConfiguration}`,
      'VERT'
    );
  }

  #verifieCout(nom: string, valeur: number): void {
    if (!Number.isFinite(valeur)) {
      throw new Error(
        `Erreur: ${nom} manquant ou non numérique dans le .env racine`
      );
    }
  }
}
