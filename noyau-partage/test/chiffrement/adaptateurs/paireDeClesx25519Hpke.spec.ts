import { describe, expect, it } from 'vitest';
import { PaireDeClesX25519Hpke } from '../../../src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';

describe('Paire de clés X25519 (via le KEM HPKE)', () => {
  it('exporte une clé publique de 32 octets', async () => {
    const x25519 = new PaireDeClesX25519Hpke();
    const paire = await x25519.genere();

    const publique = await x25519.exportePublique(paire.publicKey);

    expect(publique.length).toBe(32);
  });

  it('réimporte une clé privée exportée à l’identique', async () => {
    const x25519 = new PaireDeClesX25519Hpke();
    const paire = await x25519.genere();

    const privee = await x25519.exportePrivee(paire.privateKey);
    const reimportee = await x25519.importePrivee(privee);
    const reexportee = await x25519.exportePrivee(reimportee);

    expect(Array.from(reexportee)).toEqual(Array.from(privee));
  });
});
