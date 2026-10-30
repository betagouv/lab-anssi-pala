import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('scans', (fabriqueDeTable) => {
    fabriqueDeTable.uuid('id');
    fabriqueDeTable.primary(['id']);
    fabriqueDeTable.string('cible').notNullable();
    fabriqueDeTable.dateTime('date_scan').notNullable();
    fabriqueDeTable.string('premier_commit').nullable();
    fabriqueDeTable.string('dernier_commit').nullable();
    fabriqueDeTable.integer('duree_historique').notNullable();
    fabriqueDeTable.jsonb('fichiers').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('scans');
}
