// Fournisseurs servis via une description pi du modèle (outils/shannon/configs/models.<nom>.json).
const DESCRIPTIONS_PI: Record<string, string> = {
  albert: 'models.albert.json',
  scaleway: 'models.scaleway.json',
};

export class SpecModele {
  readonly valeur: string;

  constructor(valeur: string) {
    this.valeur = valeur;
  }

  static choisie(modele: string): SpecModele {
    return new SpecModele(modele);
  }

  static exigee(designee?: string): SpecModele {
    if (!designee) {
      throw new Error(
        'Erreur : SHANNON_AI_MODEL non renseigné (outils/shannon/shannon.env), ex. albert:openai/gpt-oss-120b'
      );
    }
    return new SpecModele(designee);
  }

  get fournisseur(): string {
    return this.valeur.split(':')[0];
  }

  get identifiant(): string {
    return this.valeur.split(':').slice(1).join(':');
  }

  descriptionPiDans(dossierConfigs: string): string | undefined {
    const fichier = DESCRIPTIONS_PI[this.fournisseur];
    return fichier && `${dossierConfigs}/${fichier}`;
  }
}
