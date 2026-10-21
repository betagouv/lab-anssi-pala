import type { Scan } from '../partage/scan.ts';

export interface Entrepot<T> {
  persiste: (element: T) => void;
  lis: (identifiant: string) => T;
}

class EntrepotMemoire<T> implements Entrepot<T> {
  tousLesElements: T[] = [];

  persiste(element: T): void {
    this.tousLesElements.push(element);
  }
  lis(identifiant: string): T {
    const elementsTrouves = this.tousLesElements.filter(
      (element) => identifiant in (element as object)
    );
    if (elementsTrouves.length === 0)
      throw new Error(`Aucun élément trouvé avec l'identifiant ${identifiant}`);
    return elementsTrouves[0];
  }
}

export class EntrepotDeScanMemoire
  extends EntrepotMemoire<Scan>
  implements Entrepot<Scan> {}
