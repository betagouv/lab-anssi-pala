// Configuration de projet Codex Security (YAML). Seuls le modèle et son fournisseur intéressent
// l'outillage, pour estimer le coût d'un scan.
export class ConfigScan {
  readonly modele: string;
  readonly fournisseur: string;

  private constructor(modele: string, fournisseur: string) {
    this.modele = modele;
    this.fournisseur = fournisseur;
  }

  // Même lecture que `grep -E '^[[:space:]]*model:' | head -1 | awk '{print $2}'` dans run-scan.sh :
  // première occurrence de la clé, premier mot de sa valeur.
  static depuisYaml(yaml: string): ConfigScan {
    const premiereValeur = (cle: string) => yaml.match(new RegExp(`^\\s*${cle}:\\s*(\\S*)`, "m"))?.[1] ?? "";
    return new ConfigScan(premiereValeur("model"), premiereValeur("model_provider"));
  }
}
