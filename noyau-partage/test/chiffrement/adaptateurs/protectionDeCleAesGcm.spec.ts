import { describe, expect, it } from 'vitest';
import { ProtectionDeCleAesGcm } from '../../../src/chiffrement/adaptateurs/protectionDeCleAesGcm.ts';
import { DerivationDeCleHkdf } from '../../../src/chiffrement/adaptateurs/derivationDeCleHkdf.ts';
import { PaireDeClesX25519Hpke } from '../../../src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';

const hkdf = new DerivationDeCleHkdf();
const sel = new Uint8Array(32).fill(2);
const uneKek = (graine: number) =>
  hkdf.deriveKek(new Uint8Array(32).fill(graine), sel, 'kek:v1');

describe('Protection de la clé privée', () => {
  it('protège puis révèle les octets de la clé privée à l’identique', async () => {
    const protection = new ProtectionDeCleAesGcm();
    const kek = await uneKek(9);
    const paire = await new PaireDeClesX25519Hpke().genere();
    const clePrivee = await new PaireDeClesX25519Hpke().exportePrivee(
      paire.privateKey
    );

    const protegee = await protection.protege(clePrivee, kek);
    const revelee = await protection.revele(protegee, kek);

    expect(Array.from(revelee)).toEqual(Array.from(clePrivee));
  });

  it('échoue à révéler avec une mauvaise KEK', async () => {
    const protection = new ProtectionDeCleAesGcm();
    const bonneKek = await uneKek(9);
    const mauvaiseKek = await uneKek(8);
    const paire = await new PaireDeClesX25519Hpke().genere();
    const clePrivee = await new PaireDeClesX25519Hpke().exportePrivee(
      paire.privateKey
    );

    const protegee = await protection.protege(clePrivee, bonneKek);

    await expect(protection.revele(protegee, mauvaiseKek)).rejects.toThrow();
  });
});
