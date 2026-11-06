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
import { EntrepotUtilisateursPostgres } from '../../../../src/infra/entrepots/postgres/entrepotUtilisateursPostgres.ts';

describe('L’Entrepôt d’utilisateurs postgres', () => {
  let knex: Knex.Knex;
  let trx: Knex.Knex.Transaction;
  let entrepot: EntrepotUtilisateursPostgres;

  beforeAll(async () => {
    knex = knexPALA;
  });

  beforeEach(async () => {
    trx = await knex.transaction();
    entrepot = new EntrepotUtilisateursPostgres(trx);
  });

  afterEach(async () => {
    await trx.rollback();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('persiste un utilisateur', async () => {
    const id = randomUUID();
    await entrepot.persiste({
      id,
      appareil: {
        clePublique: 'cle-publique',
        compteur: 1,
        identifiant: 'identifiant',
      },
      enveloppe: {
        clePriveeChiffree: { ciphertext: 'text', iv: 'iv' },
        clePublique: 'clé-publique',
        keyId: 'key-id',
        prf: { hkdfSalt: 'hdk-sel', salt: 'sel', version: 1 },
      },
      nom: '',
    });

    const utilisateurRecu = await entrepot.lis(id);

    expect(utilisateurRecu).toStrictEqual({
      id,
      appareil: {
        clePublique: 'cle-publique',
        compteur: 1,
        identifiant: 'identifiant',
      },
      enveloppe: {
        clePriveeChiffree: { ciphertext: 'text', iv: 'iv' },
        clePublique: 'clé-publique',
        keyId: 'key-id',
        prf: { hkdfSalt: 'hdk-sel', salt: 'sel', version: 1 },
      },
      nom: '',
    });
  });
});
