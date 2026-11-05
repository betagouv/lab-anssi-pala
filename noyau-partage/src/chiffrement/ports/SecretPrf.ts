// Abstrait la source du secret WebAuthn PRF (32 octets).
// En production : cérémonie WebAuthn + YubiKey côté navigateur.
// En test : un double déterministe.
export interface SecretPrf {
  fournitSecret(credentialId: Uint8Array, prfSalt: Uint8Array): Promise<Uint8Array>;
}
