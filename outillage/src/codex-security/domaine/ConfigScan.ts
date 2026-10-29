import { parse } from 'yaml';
import { Perimetre } from './Perimetre.ts';

export class ConfigScan {
  readonly modele: string;
  readonly fournisseur: string;
  readonly perimetre: Perimetre;

  private constructor(modele: string, fournisseur: string, perimetre: Perimetre) {
    this.modele = modele;
    this.fournisseur = fournisseur;
    this.perimetre = perimetre;
  }

  static depuisYaml(yaml: string): ConfigScan {
    const config = parse(yaml);
    const paths = config?.scan?.scope?.paths;
    return new ConfigScan(
      config?.codex?.model ?? '',
      config?.codex?.model_provider ?? '',
      Array.isArray(paths) ? Perimetre.deChemins(paths) : Perimetre.nonContraignant()
    );
  }

  static inconnue(): ConfigScan {
    return new ConfigScan('', '', Perimetre.nonContraignant());
  }
}
