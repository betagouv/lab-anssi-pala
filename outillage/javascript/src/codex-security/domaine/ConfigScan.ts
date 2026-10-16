export class ConfigScan {
  readonly modele: string;
  readonly fournisseur: string;

  private constructor(modele: string, fournisseur: string) {
    this.modele = modele;
    this.fournisseur = fournisseur;
  }

  static depuisYaml(yaml: string): ConfigScan {
    const premiereValeur = (cle: string) =>
      yaml.match(new RegExp(`^\\s*${cle}:\\s*(\\S*)`, 'm'))?.[1] ?? '';
    return new ConfigScan(premiereValeur('model'), premiereValeur('model_provider'));
  }
}
