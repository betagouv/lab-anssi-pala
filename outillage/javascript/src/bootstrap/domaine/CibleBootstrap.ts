import { Cible } from '../../environnement/domaine/Cible.ts';

// Cible telle que fournie au bootstrap : son URL git (obligatoire pour la cloner) et, au besoin,
// la branche à cloner. `url` et `branche` ne servent qu'ici (clone) ; ailleurs, la Cible de base suffit.
export class CibleBootstrap extends Cible {
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
    super({ nom });
    this.url = url;
    this.branche = branche;
  }
}
