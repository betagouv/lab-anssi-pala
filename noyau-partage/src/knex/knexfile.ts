import Knex from 'knex';
import configurationKnex from './configurationKnex';

export const knexPALA = Knex(configurationKnex);
