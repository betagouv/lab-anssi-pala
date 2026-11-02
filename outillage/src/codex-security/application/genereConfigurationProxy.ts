import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { environnement } from '../../noyau/environnement.ts';
import { ConfigurationProxyLiteLLM } from '../domaine/ConfigurationProxyLiteLLM.ts';
import { CHEMIN_CONFIG_PROXY_GENERE } from '../domaine/cheminConfig.ts';

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

  execute(): string {
    environnement.verifiePresenceVariablesRacine(this.#systemeDeFichier);
    const parametres = environnement.modeleProxy();
    this.#verifieCout(
      'FOURNISSEUR_COUT_ENTREE_PAR_TOKEN',
      parametres.coutEntreeParToken
    );
    this.#verifieCout(
      'FOURNISSEUR_COUT_SORTIE_PAR_TOKEN',
      parametres.coutSortieParToken
    );
    const config = new ConfigurationProxyLiteLLM(parametres);
    this.#systemeDeFichier.ecritFichier(
      CHEMIN_CONFIG_PROXY_GENERE,
      config.versYaml()
    );
    this.#console.aLaLigne(`Généré: ${CHEMIN_CONFIG_PROXY_GENERE}`, 'VERT');
    return CHEMIN_CONFIG_PROXY_GENERE;
  }

  #verifieCout(nom: string, valeur: number): void {
    if (!Number.isFinite(valeur)) {
      throw new Error(
        `Erreur: ${nom} manquant ou non numérique dans le .env racine`
      );
    }
  }
}
