// Dépôt à auditer, cloné dans sa copie de travail. Concept partagé de l'environnement PALA :
// Codex Security et Shannon s'appuient sur cette copie de travail, identifiée par le seul nom.
export class Cible {
  readonly nom: string;

  constructor({ nom }: { nom: string }) {
    this.nom = nom;
  }

  get copieDeTravail(): string {
    return `cible/copies/${this.nom}`;
  }
}
