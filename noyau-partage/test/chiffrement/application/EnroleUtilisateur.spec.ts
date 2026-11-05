import { describe, expect, it } from 'vitest';
import { EnroleUtilisateur } from '../../../src/chiffrement/application/EnroleUtilisateur.ts';
import { SecretPrfSimule } from '../doubles/SecretPrfSimule.ts';
import { ProtectionDeCleAesGcm } from '../../../src/chiffrement/adaptateurs/protectionDeCleAesGcm.ts';
import { DerivationDeCleHkdf } from '../../../src/chiffrement/adaptateurs/derivationDeCleHkdf.ts';
import { PaireDeClesX25519Hpke } from '../../../src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';

const unEnrolement = () =>
  new EnroleUtilisateur({
    secretPrf: new SecretPrfSimule(),
    derivation: new DerivationDeCleHkdf(),
    paire: new PaireDeClesX25519Hpke(),
    protection: new ProtectionDeCleAesGcm(),
  });

const credentialId = new TextEncoder().encode('credential-alice');

describe('Enrôlement d’un utilisateur', () => {
  it('produit une identité avec une clé publique de 32 octets et un keyId', async () => {
    const identite = await unEnrolement().execute({ credentialId });

    expect(identite.keyId).toBeTruthy();
    expect(identite.clePublique.length).toBe(32);
    expect(identite.prf.version).toBe(1);
  });
});
