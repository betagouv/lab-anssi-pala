import type { Scan } from '../partage/scan.ts';

export interface Entrepot<T> {
  persiste: (element: T) => void;
}

class EntrepotMemoire<T> implements Entrepot<T> {
  tousLesElements: T[] = [];

  persiste(element: T): void {
    this.tousLesElements.push(element);
  }
}

export class EntrepotDeScanMemoire
  extends EntrepotMemoire<Scan>
  implements Entrepot<Scan> {}
