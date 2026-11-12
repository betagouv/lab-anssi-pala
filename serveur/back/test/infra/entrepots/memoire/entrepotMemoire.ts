import { type Entrepot } from '../../../../../../noyau-partage/src/entrepots/entrepots.ts';

export class EntrepotMemoire<T> implements Entrepot<T> {
  protected entites = new Map<string, T>();

  async lis(identifiant: string): Promise<T | undefined> {
    return this.entites.get(identifiant) ?? undefined;
  }

  async persiste(element: T): Promise<void> {
    const entite = element as Record<string, unknown> & { id: string };
    this.entites.set(entite.id, element);
  }
}
