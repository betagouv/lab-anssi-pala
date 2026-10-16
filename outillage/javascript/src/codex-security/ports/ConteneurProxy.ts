export type ConfigurationProxy = {
  url: string;
  image: string;
  baseDeDonnees?: string;
};

export interface ConteneurProxy {
  supprime(): Promise<void>;
  demarre(configuration: ConfigurationProxy): Promise<void>;
}
