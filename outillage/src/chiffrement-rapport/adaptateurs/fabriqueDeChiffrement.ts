import { ChiffrementAesGcmWeb } from '../../../../noyau-partage/src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';
import { PaireDeClesX25519Hpke } from '../../../../noyau-partage/src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { EncapsulationHpke } from '../../../../noyau-partage/src/chiffrement/adaptateurs/encapsulationHpke.ts';
import { ServiceDeChiffrementParEnveloppe } from '../../../../noyau-partage/src/chiffrement/application/serviceDeChiffrementParEnveloppe.ts';
import type { ServiceDeChiffrement } from '../../../../noyau-partage/src/chiffrement/application/serviceDeChiffrement.ts';

export const fabriqueDeChiffrement = (): ServiceDeChiffrement =>
  new ServiceDeChiffrementParEnveloppe({
    chiffrement: new ChiffrementAesGcmWeb(),
    paireDeClesAsymetriques: new PaireDeClesX25519Hpke(),
    encapsulationCleDeChiffrement: new EncapsulationHpke(),
  });
