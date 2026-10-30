import { type Entrepot } from '../entrepots.ts';
import { type Knex } from 'knex';

export abstract class EntrepotPosgres<T> implements Entrepot<T> {
  protected knex: Knex;
  protected table: string;

  protected constructor(knex: Knex, table: string) {
    this.knex = knex;
    this.table = table;
  }

  async persiste(entite: T): Promise<void> {
    const entiteDTO = this.mappe(entite).dto();
    await this.knex.insert(entiteDTO).into(this.table).onConflict('id').merge();
  }

  async lis(identifiant: string): Promise<T> {
    const resultat = await this.knex
      .select()
      .from(this.table)
      .where('id', identifiant)
      .first();
    return this.mappe(resultat).entite();
  }

  protected abstract mappe(resultat: unknown): {
    dto: () => unknown;
    entite: () => T;
  };
}
