import { describe, expect, it } from 'vitest';
import { destinatairesDepuisJson } from '../../../src/chiffrement-rapport/adaptateurs/destinatairesDepuisEnvironnement.ts';

const enBase64Url = (octets: number[]) => Buffer.from(octets).toString('base64url');

describe('La lecture des destinataires du rapport depuis l’environnement', () => {
  it('décode la clé publique en base64url de chaque destinataire', () => {
    const json = JSON.stringify([
      { keyId: 'alice-key', clePublique: enBase64Url([1, 2, 3]) },
      { keyId: 'bob-key', clePublique: enBase64Url([250, 251, 252]) },
    ]);

    const destinataires = destinatairesDepuisJson(json);

    expect(destinataires).toEqual([
      { keyId: 'alice-key', clePublique: new Uint8Array([1, 2, 3]) },
      { keyId: 'bob-key', clePublique: new Uint8Array([250, 251, 252]) },
    ]);
  });

  it.each([
    ['absente', ''],
    ['qui n’est pas du JSON', 'pas du json'],
    ['qui n’est pas une liste', JSON.stringify({ keyId: 'a', clePublique: 'AQID' })],
    [
      'dont un destinataire n’a pas de keyId',
      JSON.stringify([{ clePublique: 'AQID' }]),
    ],
    [
      'dont un destinataire n’a pas de clé publique',
      JSON.stringify([{ keyId: 'a' }]),
    ],
  ])('refuse une variable RAPPORT_DESTINATAIRES %s', (_cas, json) => {
    expect(() => destinatairesDepuisJson(json)).toThrow('RAPPORT_DESTINATAIRES');
  });
});
