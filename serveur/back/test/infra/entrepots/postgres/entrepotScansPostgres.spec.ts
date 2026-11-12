import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import Knex from 'knex';
import { knexPALA } from '../../../../../../noyau-partage/src/knex/knexfile.js';
import { randomUUID } from 'node:crypto';
import { EntrepotScansPostgres } from '../../../../src/infra/entrepots/postgres/entrepotScansPostgres.ts';

describe('L’entrepôt de scans postgres', () => {
  let knex: Knex.Knex;
  let trx: Knex.Knex.Transaction;
  let entrepot: EntrepotScansPostgres;

  const insereUnScan = async (rapport?: string) => {
    const id = randomUUID();
    await trx
      .insert({
        id,
        cible: 'ma-cible',
        date_scan: new Date('2026-10-09T14:34:00'),
        duree_historique: 7,
        fichiers: { liste: [] },
        ...(rapport && { rapport: Buffer.from(rapport) }),
      })
      .into('scans');
    return id;
  };

  beforeAll(async () => {
    knex = knexPALA;
  });

  beforeEach(async () => {
    trx = await knex.transaction();
    entrepot = new EntrepotScansPostgres(trx);
  });

  afterEach(async () => {
    await trx.rollback();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('lit un scan avec son rapport', async () => {
    const id = await insereUnScan('{"documentId":"un-document"}');

    const scan = await entrepot.lis(id);

    expect(scan).toStrictEqual({
      id,
      cible: 'ma-cible',
      date: new Date('2026-10-09T14:34:00'),
      rapport: '{"documentId":"un-document"}',
    });
  });

  it('ne trouve pas un scan inconnu', async () => {
    const scan = await entrepot.lis(randomUUID());

    expect(scan).toBeUndefined();
  });

  it('ne trouve pas un scan sans rapport', async () => {
    const id = await insereUnScan();

    const scan = await entrepot.lis(id);

    expect(scan?.rapport).toBeUndefined();
  });
});
