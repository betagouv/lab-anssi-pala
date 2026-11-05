import { describe, expect, it } from 'vitest';
import { EnroleUtilisateur } from '../../../src/chiffrement/application/EnroleUtilisateur.ts';
import { SecretPrfSimule } from '../doubles/SecretPrfSimule.ts';
import { ProtectionDeCleAesGcm } from '../../../src/chiffrement/adaptateurs/protectionDeCleAesGcm.ts';
import { DerivationDeCleHkdf } from '../../../src/chiffrement/adaptateurs/derivationDeCleHkdf.ts';
import { PaireDeClesX25519Hpke } from '../../../src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { EncapsulationHpke } from '../../../src/chiffrement/adaptateurs/encapsulationHpke.ts';
import { DeverrouilleClePrivee } from '../../../src/chiffrement/application/DeverrouilleClePrivee.ts';

const briques = () => ({
  secretPrf: new SecretPrfSimule(),
  derivation: new DerivationDeCleHkdf(),
  paire: new PaireDeClesX25519Hpke(),
  protection: new ProtectionDeCleAesGcm(),
});

const credentialId = new TextEncoder().encode('credential-alice');

describe('Déverrouillage de la clé privée', () => {
  it('restaure une clé privée capable d’ouvrir une enveloppe scellée vers l’identité', async () => {
    const d = briques();
    const identite = await new EnroleUtilisateur(d).execute({ credentialId });

    const clePrivee = await new DeverrouilleClePrivee(d).execute({
      identite,
      credentialId,
    });

    const hpke = new EncapsulationHpke();
    const clePublique = await d.paire.importePublique(identite.clePublique);
    const enveloppe = await hpke.seal(
      clePublique,
      new TextEncoder().encode('dek'),
      'doc:v1'
    );
    const ouvert = await hpke.open(clePrivee, enveloppe, 'doc:v1');

    expect(new TextDecoder().decode(ouvert)).toBe('dek');
  });

  it('échoue si le credential ne correspond pas à l’identité', async () => {
    const d = briques();
    const identite = await new EnroleUtilisateur(d).execute({ credentialId });

    await expect(
      new DeverrouilleClePrivee(d).execute({
        identite,
        credentialId: new TextEncoder().encode('credential-intrus'),
      })
    ).rejects.toThrow();
  });
});
