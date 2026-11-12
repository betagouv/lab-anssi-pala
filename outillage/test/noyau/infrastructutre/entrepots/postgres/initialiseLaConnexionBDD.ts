import Knex from 'knex';
import ClientPgLite from 'knex-pglite';

export const initialiseLaConnexionBDD = async (knex: Knex.Knex) => {
  knex = Knex({
    client: ClientPgLite,
    dialect: 'postgres',
    connection: {},
    migrations: { directory: './noyau-partage/src/knex/migrations' },
  });
  await knex.migrate.latest();
  return knex;
};
