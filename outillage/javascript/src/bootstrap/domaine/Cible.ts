// Dépôt à auditer, fourni au lancement (le dépôt d'audit est agnostique de la cible). Il est cloné
// dans sa copie de travail, qui sert à la fois Codex Security et Shannon.
export class Cible {
  readonly nom: string;
  readonly url: string;
  readonly branche?: string;

  constructor({
    nom,
    url,
    branche,
  }: {
    nom: string;
    url: string;
    branche?: string;
  }) {
    this.nom = nom;
    this.url = url;
    this.branche = branche;
  }

  get copieDeTravail(): string {
    return `cible/copies/${this.nom}`;
  }
}
