import Knex from 'knex';
import configurationKnex from './configurationKnex.ts';

export const knexPALA = Knex(configurationKnex);
