import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('utilisateurs', (fabriqueDeTable) => {
    fabriqueDeTable.uuid('id');
    fabriqueDeTable.primary(['id']);
    fabriqueDeTable.string('nom').notNullable();
    fabriqueDeTable.jsonb('appareil').notNullable();
    fabriqueDeTable.jsonb('enveloppe').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('utilisateurs');
}
