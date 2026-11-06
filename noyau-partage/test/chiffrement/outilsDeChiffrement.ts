import { SecretPrfSimule } from './doubles/SecretPrfSimule.ts';
import { DerivationDeCleHkdf } from '../../src/chiffrement/adaptateurs/derivationDeCleHkdf.ts';
import { PaireDeClesX25519Hpke } from '../../src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { ProtectionDeCleAesGcm } from '../../src/chiffrement/adaptateurs/protectionDeCleAesGcm.ts';
import { ChiffrementAesGcmWeb } from '../../src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';
import { EncapsulationHpke } from '../../src/chiffrement/adaptateurs/encapsulationHpke.ts';

export const lesOutilsPourChiffrer = () => ({
  chiffrement: new ChiffrementAesGcmWeb(),
  paireDeClesAsymetriques: new PaireDeClesX25519Hpke(),
  encapsulationCleDeChiffrement: new EncapsulationHpke(),
});

export const lesOutilsPourEnrolerUnUtilisateur = () => ({
  secretPrf: new SecretPrfSimule(),
  derivation: new DerivationDeCleHkdf(),
  paire: new PaireDeClesX25519Hpke(),
  protection: new ProtectionDeCleAesGcm(),
});

export const lesOutilsPourDeverouillerUneClePrivee = () =>
  lesOutilsPourEnrolerUnUtilisateur();

export const lesOutilsPourDechiffrer = () => ({
  chiffrement: new ChiffrementAesGcmWeb(),
  hpke: new EncapsulationHpke(),
});
