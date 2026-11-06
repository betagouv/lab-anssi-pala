import type { SecretPrf } from '../../../src/chiffrement/ports/SecretPrf.ts';

// Simule le résultat WebAuthn PRF : un secret de 32 octets, déterministe et propre
// à chaque (credentialId, prfSalt), sans aucune YubiKey ni navigateur.
export class SecretPrfSimule implements SecretPrf {
  async fournitSecret(
    credentialId: Uint8Array,
    prfSalt: Uint8Array
  ): Promise<Uint8Array> {
    const graine = new Uint8Array(credentialId.length + prfSalt.length);
    graine.set(credentialId, 0);
    graine.set(prfSalt, credentialId.length);
    const empreinte = await globalThis.crypto.subtle.digest('SHA-256', graine);
    return new Uint8Array(empreinte);
  }
}
