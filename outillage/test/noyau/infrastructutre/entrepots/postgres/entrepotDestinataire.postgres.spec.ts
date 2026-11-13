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
import { randomUUID } from 'node:crypto';
import { EntrepotDestinatairePostgres } from '../../../../../src/noyau/infrastructure/entrepots/postgres/entrepotDestinatairePostgres.ts';
import { initialiseLaConnexionBDD } from './initialiseLaConnexionBDD.ts';

describe('L’entrepôt des destinataires postgres', () => {
  let knex: Knex.Knex;
  let trx: Knex.Knex.Transaction;
  let entrepot: EntrepotDestinatairePostgres;

  beforeAll(async () => {
    knex = await initialiseLaConnexionBDD(knex);
  });

  beforeEach(async () => {
    trx = await knex.transaction();
    entrepot = new EntrepotDestinatairePostgres(trx);
  });

  afterEach(async () => {
    await trx.rollback();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('restitue les octets de la clé publique encodée en base64 à l’enrôlement', async () => {
    const octetsDeLaClePublique = Uint8Array.from({ length: 32 }, (_, i) => i);
    await trx
      .insert({
        id: randomUUID(),
        appareil: {
          clePublique: 'cle-publique',
          compteur: 1,
          identifiant: 'identifiant',
        },
        enveloppe: {
          clePriveeChiffree: { ciphertext: 'text', iv: 'iv' },
          clePublique: Buffer.from(octetsDeLaClePublique).toString('base64'),
          keyId: 'key-id',
          prf: { hkdfSalt: 'hdk-sel', salt: 'sel', version: 1 },
        },
        nom: '',
      })
      .into('utilisateurs');

    const destinataires = await entrepot.tous();

    expect(destinataires).toStrictEqual([
      { keyId: 'key-id', clePublique: octetsDeLaClePublique },
    ]);
  });
});
