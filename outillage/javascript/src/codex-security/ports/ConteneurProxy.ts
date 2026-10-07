export type ConfigurationProxy = {
  port: number;
  image: string;
  baseDeDonnees?: string;
};

// Conteneur du proxy LiteLLM (Responses -> Chat Completions), exposé sur 127.0.0.1 uniquement.
export interface ConteneurProxy {
  // Sans effet si aucun conteneur n'existe.
  supprime(): Promise<void>;
  demarre(configuration: ConfigurationProxy): Promise<void>;
}
