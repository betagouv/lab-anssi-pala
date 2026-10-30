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
import { EntrepotDeScanPostgres } from '../../../../../src/noyau/infrastructure/entrepots/postgres/entrepotDeScanPostgres.ts';
import { randomUUID } from 'node:crypto';
import { knexPALA } from '../../../../../../noyau-partage/src/knex/knexfile.ts';

describe('L’entrepôt de Scan postgres', () => {
  let knex: Knex.Knex;
  let trx: Knex.Knex.Transaction;
  let entrepot: EntrepotDeScanPostgres;

  beforeAll(async () => {
    knex = knexPALA;
  });

  beforeEach(async () => {
    trx = await knex.transaction();
    entrepot = new EntrepotDeScanPostgres(trx);
  });

  afterEach(async () => {
    await trx.rollback();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('persiste un Scan', async () => {
    const id = randomUUID();
    await entrepot.persiste({
      id,
      date: new Date('2026-10-09T14:34:00'),
      cible: 'ma-cible',
      informationsDeCommits: {
        premierCommit: 'abcdef',
        dernierCommit: 'ghijkl',
        dureeHistorique: 7,
        fichiers: ['1', '2', '3'],
      },
    });

    const scanRecu = await entrepot.lis(id);

    expect(scanRecu).toStrictEqual({
      id,
      date: new Date('2026-10-09T14:34:00'),
      cible: 'ma-cible',
      informationsDeCommits: {
        premierCommit: 'abcdef',
        dernierCommit: 'ghijkl',
        dureeHistorique: 7,
        fichiers: ['1', '2', '3'],
      },
    });
  });

  it('met à jour un Scan', async () => {
    const id = randomUUID();
    const unScan = {
      id,
      date: new Date('2026-10-09T14:34:00'),
      cible: 'ma-cible',
      informationsDeCommits: {
        premierCommit: 'abcdef',
        dernierCommit: 'ghijkl',
        dureeHistorique: 7,
        fichiers: ['1', '2', '3'],
      },
    };
    await entrepot.persiste(unScan);
    await entrepot.persiste({
      ...unScan,
      informationsDeCommits: {
        ...unScan.informationsDeCommits,
        dureeHistorique: 10,
      },
    });

    const scanRecu = await entrepot.lis(id);

    expect(scanRecu).toStrictEqual({
      id,
      date: new Date('2026-10-09T14:34:00'),
      cible: 'ma-cible',
      informationsDeCommits: {
        premierCommit: 'abcdef',
        dernierCommit: 'ghijkl',
        dureeHistorique: 10,
        fichiers: ['1', '2', '3'],
      },
    });
  });

  it('récupère le dernier scan effectué pour une cible donnée', async () => {
    const id = randomUUID();
    const unScan = {
      id,
      date: new Date('2026-10-09T14:34:00'),
      cible: 'ma-cible',
      informationsDeCommits: {
        premierCommit: 'abcdef',
        dernierCommit: 'ghijkl',
        dureeHistorique: 7,
        fichiers: ['1', '2', '3'],
      },
    };
    const unDeuxiemScan = {
      ...unScan,
      date: new Date('2026-10-09T15:34:00'),
      informationsDeCommits: {
        ...unScan.informationsDeCommits,
        premierCommit: 'zyxwvu',
        dernierCommit: 'tsrqpo',
      },
    };
    await entrepot.persiste(unScan);
    await entrepot.persiste(unDeuxiemScan);

    const scanRecu = await entrepot.dernierScanPourLaCible('ma-cible');

    expect(scanRecu).toStrictEqual({
      id,
      date: new Date('2026-10-09T15:34:00'),
      cible: 'ma-cible',
      informationsDeCommits: {
        premierCommit: 'zyxwvu',
        dernierCommit: 'tsrqpo',
        dureeHistorique: 7,
        fichiers: ['1', '2', '3'],
      },
    });
  });

  it('persiste le rapport', async () => {
    const id = randomUUID();
    const unScan = {
      id,
      date: new Date('2026-10-09T14:34:00'),
      cible: 'ma-cible',
      informationsDeCommits: {
        premierCommit: 'abcdef',
        dernierCommit: 'ghijkl',
        dureeHistorique: 7,
        fichiers: ['1', '2', '3'],
      },
      rapport: 'un rapport',
    };
    await entrepot.persiste(unScan);

    const resultat = await trx.select().from('scans').where('id', id).first();

    expect(resultat.rapport).instanceOf(Buffer);
    expect(resultat.rapport.toString('utf-8')).toBe('un rapport');
  });
});
