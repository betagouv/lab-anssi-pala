import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> =>
  knex.schema.alterTable('scans', (table) => table.binary('rapport').nullable());

export const down = async (knex: Knex): Promise<void> =>
  knex.schema.alterTable('scans', (table) => table.dropColumn('rapport'));
