// Fournisseurs servis via une description pi du modèle (outils/shannon/configs/models.<nom>.json).
const DESCRIPTIONS_PI: Record<string, string> = { albert: "models.albert.json", scaleway: "models.scaleway.json" };

// Modèle utilisé par Shannon, sous la forme « fournisseur:modèle » (valeur de SHANNON_AI_MODEL).
export class SpecModele {
  static readonly PAR_DEFAUT = "anthropic:claude-sonnet-4-6";

  readonly valeur: string;

  constructor(valeur: string) {
    this.valeur = valeur;
  }

  // Modèle imposé au lancement, sinon configuré (shannon.env), sinon celui de Shannon par défaut.
  static choisie(imposee?: string, configuree?: string): SpecModele {
    return new SpecModele(imposee || configuree || SpecModele.PAR_DEFAUT);
  }

  get fournisseur(): string {
    return this.valeur.split(":")[0];
  }

  // Nom du fichier de description pi, pour les fournisseurs qui en ont besoin.
  get descriptionPi(): string | undefined {
    return DESCRIPTIONS_PI[this.fournisseur];
  }
}
