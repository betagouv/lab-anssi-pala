import type { IdentiteCryptographique } from '../domaine/identiteCryptographique.ts';
import type { DerivationDeCle } from '../ports/DerivationDeCle.ts';
import type { PaireDeClesAsymetriques } from '../ports/PaireDeClesAsymetriques.ts';
import type { ProtectionDeCle } from '../ports/ProtectionDeCle.ts';
import type { SecretPrf } from '../ports/SecretPrf.ts';
import {
  infoProtectionClePrivee,
  VERSION_PRF,
} from '../domaine/profilEncapsulationChiffrementUtilisateur.ts';

export type Dependances = {
  secretPrf: SecretPrf;
  derivation: DerivationDeCle;
  paire: PaireDeClesAsymetriques;
  protection: ProtectionDeCle;
};

export type CommandeEnrolement = {
  credentialId: Uint8Array;
};

export class EnroleUtilisateur {
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
    credentialId,
  }: CommandeEnrolement): Promise<IdentiteCryptographique> {
    const keyId = globalThis.crypto.randomUUID();
    const prfSalt = globalThis.crypto.getRandomValues(new Uint8Array(32));
    const hkdfSalt = globalThis.crypto.getRandomValues(new Uint8Array(32));

    const secret = await this.#secretPrf.fournitSecret(credentialId, prfSalt);
    const kek = await this.#derivation.deriveKek(
      secret,
      hkdfSalt,
      infoProtectionClePrivee(keyId)
    );

    const paire = await this.#paire.genere();
    const clePublique = await this.#paire.exportePublique(paire.publicKey);
    const octetsClePrivee = await this.#paire.exportePrivee(paire.privateKey);
    const clePriveeChiffree = await this.#protection.protege(octetsClePrivee, kek);

    return {
      keyId,
      clePublique,
      clePriveeChiffree,
      prf: { salt: prfSalt, hkdfSalt, version: VERSION_PRF },
    };
  }
}
