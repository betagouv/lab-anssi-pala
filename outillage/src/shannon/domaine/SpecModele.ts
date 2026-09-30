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

  // Modèle désigné sans repli : aucun fournisseur n'est privilégié par défaut.
  static exigee(designee?: string): SpecModele {
    if (!designee) {
      throw new Error(
        "Erreur : SHANNON_AI_MODEL non renseigné (outils/shannon/shannon.env), ex. albert:openai/gpt-oss-120b",
      );
    }
    return new SpecModele(designee);
  }

  get fournisseur(): string {
    return this.valeur.split(":")[0];
  }

  // Chemin de la description pi dans le dossier des configs Shannon, pour les fournisseurs qui en
  // ont besoin ; aucun pour un modèle que Shannon connaît nativement.
  descriptionPiDans(dossierConfigs: string): string | undefined {
    const fichier = DESCRIPTIONS_PI[this.fournisseur];
    return fichier && `${dossierConfigs}/${fichier}`;
  }
}
