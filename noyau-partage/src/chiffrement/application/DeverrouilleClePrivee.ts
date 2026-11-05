import type { IdentiteCryptographique } from '../domaine/identiteCryptographique.ts';
import { infoProtectionClePrivee } from '../domaine/profilEncapsulationChiffrementUtilisateur.ts';
import type { DerivationDeCle } from '../ports/DerivationDeCle.ts';
import type { PaireDeClesAsymetriques } from '../ports/PaireDeClesAsymetriques.ts';
import type { ProtectionDeCle } from '../ports/ProtectionDeCle.ts';
import type { SecretPrf } from '../ports/SecretPrf.ts';

export type Dependances = {
  secretPrf: SecretPrf;
  derivation: DerivationDeCle;
  paire: PaireDeClesAsymetriques;
  protection: ProtectionDeCle;
};

export type CommandeDeverrouillage = {
  identite: IdentiteCryptographique;
  credentialId: Uint8Array;
};

export class DeverrouilleClePrivee {
  readonly #secretPrf: SecretPrf;
  readonly #derivation: DerivationDeCle;
  readonly #paire: PaireDeClesAsymetriques;
  readonly #protection: ProtectionDeCle;

  constructor(dependances: Dependances) {
    this.#secretPrf = dependances.secretPrf;
    this.#derivation = dependances.derivation;
    this.#paire = dependances.paire;
    this.#protection = dependances.protection;
  }

  async execute({
    identite,
    credentialId,
  }: CommandeDeverrouillage): Promise<CryptoKey> {
    const secret = await this.#secretPrf.fournitSecret(
      credentialId,
      identite.prf.salt
    );
    const kek = await this.#derivation.deriveKek(
      secret,
      identite.prf.hkdfSalt,
      infoProtectionClePrivee(identite.keyId)
    );
    const octetsClePrivee = await this.#protection.revele(
      identite.clePriveeChiffree,
      kek
    );
    return this.#paire.importePrivee(octetsClePrivee);
  }
}
