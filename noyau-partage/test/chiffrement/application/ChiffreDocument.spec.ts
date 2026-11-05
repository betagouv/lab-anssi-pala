import { describe, expect, it } from 'vitest';
import { ChiffreDocument } from '../../../src/chiffrement/application/ChiffreDocument.ts';
import { ChiffrementAesGcmWeb } from '../../../src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';
import { PaireDeClesX25519Hpke } from '../../../src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { EncapsulationHpke } from '../../../src/chiffrement/adaptateurs/encapsulationHpke.ts';

const unChiffrement = () =>
  new ChiffreDocument({
    chiffrement: new ChiffrementAesGcmWeb(),
    paire: new PaireDeClesX25519Hpke(),
    hpke: new EncapsulationHpke(),
  });

const unDestinataire = async (keyId: string) => {
  const x25519 = new PaireDeClesX25519Hpke();
  const paire = await x25519.genere();
  return { keyId, clePublique: await x25519.exportePublique(paire.publicKey) };
};

describe('Chiffrement d’un document pour plusieurs destinataires', () => {
  it('produit un contenu chiffré et une enveloppe par destinataire', async () => {
    const alice = await unDestinataire('alice-key');
    const bob = await unDestinataire('bob-key');

    const partage = await unChiffrement().execute({
      documentId: 'doc-123',
      contenu: new TextEncoder().encode('contenu confidentiel'),
      destinataires: [alice, bob],
    });

    expect(partage.documentId).toBe('doc-123');
    expect(partage.document.ciphertext.length).toBeGreaterThan(0);
    expect(partage.enveloppes.map((e) => e.keyId)).toEqual(['alice-key', 'bob-key']);
  });
});
