import type { ChiffrementDuRapport } from '../ports/ChiffrementDuRapport.ts';
import { ChiffrementDuRapportHpke } from './ChiffrementDuRapportHpke.ts';
import { destinatairesDepuisJson } from './destinatairesDepuisEnvironnement.ts';
import { environnement } from '../../noyau/environnement.ts';
import { ChiffreDocument } from '../../../../noyau-partage/src/chiffrement/application/ChiffreDocument.ts';
import { ChiffrementAesGcmWeb } from '../../../../noyau-partage/src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';
import { PaireDeClesX25519Hpke } from '../../../../noyau-partage/src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { EncapsulationHpke } from '../../../../noyau-partage/src/chiffrement/adaptateurs/encapsulationHpke.ts';

export const fabriqueChiffrementDuRapport = (): ChiffrementDuRapport =>
  new ChiffrementDuRapportHpke({
    chiffreDocument: new ChiffreDocument({
      chiffrement: new ChiffrementAesGcmWeb(),
      paire: new PaireDeClesX25519Hpke(),
      hpke: new EncapsulationHpke(),
    }),
    destinataires: destinatairesDepuisJson(
      environnement.chiffrementDuRapport().destinataires
    ),
  });
