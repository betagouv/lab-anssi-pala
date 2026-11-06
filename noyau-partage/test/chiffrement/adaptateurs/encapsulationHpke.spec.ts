import { describe, expect, it } from 'vitest';
import { EncapsulationHpke } from '../../../src/chiffrement/adaptateurs/encapsulationHpke.ts';
import { PaireDeClesX25519Hpke } from '../../../src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';

const octets = (texte: string) => new TextEncoder().encode(texte);

describe('Encapsulation HPKE', () => {
  it('encapsule puis récupère le contenu avec la bonne clé privée', async () => {
    const hpke = new EncapsulationHpke();
    const paire = await new PaireDeClesX25519Hpke().genere();

    const enveloppe = await hpke.seal(paire.publicKey, octets('dek'), 'doc:v1');
    const ouvert = await hpke.open(paire.privateKey, enveloppe, 'doc:v1');

    expect(new TextDecoder().decode(ouvert)).toBe('dek');
  });

  it('échoue à ouvrir avec une autre clé privée', async () => {
    const hpke = new EncapsulationHpke();
    const x25519 = new PaireDeClesX25519Hpke();
    const destinataire = await x25519.genere();
    const intrus = await x25519.genere();

    const enveloppe = await hpke.seal(
      destinataire.publicKey,
      octets('dek'),
      'doc:v1'
    );

    await expect(
      hpke.open(intrus.privateKey, enveloppe, 'doc:v1')
    ).rejects.toThrow();
  });
});
