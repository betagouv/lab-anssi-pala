import {
  bufferToBase64URLString,
  startAuthentication,
} from '@simplewebauthn/browser';
import { octetsDepuisBase64 } from 'pala-noyau-partage/src/chiffrement/adaptateurs/base64.ts';
import { versArrayBuffer } from 'pala-noyau-partage/src/chiffrement/adaptateurs/octets.ts';
import { DechiffreDocument } from 'pala-noyau-partage/src/chiffrement/application/DechiffreDocument.ts';
import { DeverrouilleClePrivee } from 'pala-noyau-partage/src/chiffrement/application/DeverrouilleClePrivee.ts';
import { ChiffrementAesGcmWeb } from 'pala-noyau-partage/src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';
import { DerivationDeCleHkdf } from 'pala-noyau-partage/src/chiffrement/adaptateurs/derivationDeCleHkdf.ts';
import { EncapsulationHpke } from 'pala-noyau-partage/src/chiffrement/adaptateurs/encapsulationHpke.ts';
import { PaireDeClesX25519Hpke } from 'pala-noyau-partage/src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { ProtectionDeCleAesGcm } from 'pala-noyau-partage/src/chiffrement/adaptateurs/protectionDeCleAesGcm.ts';
import { base64urlVersOctets } from '../enrolement/encodage.ts';
import { decodeDepuisBase64 } from '../enrolement/enveloppe.ts';
import type { Destinataire, Scan } from './scan.ts';

export type SecretDuLecteur = {
  identifiantAppareil: string;
  secret: Uint8Array;
};

type EtapesDechiffrement = {
  recupereSecretPrf: (destinataires: Destinataire[]) => Promise<SecretDuLecteur>;
  dechiffreRapport: (
    scan: Scan,
    secretDuLecteur: SecretDuLecteur
  ) => Promise<string>;
};

type ResultatsPrf = { prf?: { results?: { first?: ArrayBuffer } } };

export const recupereSecretPrf = async (
  destinataires: Destinataire[]
): Promise<SecretDuLecteur> => {
  const defi = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const selsParAppareil = Object.fromEntries(
    destinataires.map(({ identifiantAppareil, enveloppe }) => [
      identifiantAppareil,
      { first: versArrayBuffer(octetsDepuisBase64(enveloppe.prf.salt)) },
    ])
  );

  const reponse = await startAuthentication({
    optionsJSON: {
      challenge: bufferToBase64URLString(versArrayBuffer(defi)),
      allowCredentials: destinataires.map(({ identifiantAppareil }) => ({
        id: identifiantAppareil,
        type: 'public-key',
      })),
      userVerification: 'required',
      extensions: {
        prf: { evalByCredential: selsParAppareil },
      } as AuthenticationExtensionsClientInputs,
    },
  });

  const premier = (reponse.clientExtensionResults as ResultatsPrf).prf?.results
    ?.first;
  if (!premier) {
    throw new Error("Le secret PRF n'a pas été fourni par l'authentificateur.");
  }

  return { identifiantAppareil: reponse.id, secret: new Uint8Array(premier) };
};

export const dechiffreRapport = async (
  scan: Scan,
  { identifiantAppareil, secret }: SecretDuLecteur
): Promise<string> => {
  const destinataire = scan.destinataires.find(
    (d) => d.identifiantAppareil === identifiantAppareil
  );
  const enveloppe = scan.rapport.enveloppes.find(
    (e) => e.keyId === destinataire?.enveloppe.keyId
  );
  if (!destinataire || !enveloppe) {
    throw new Error('Cette clé n’est pas celle d’un destinataire du rapport.');
  }
  const identite = decodeDepuisBase64(destinataire.enveloppe);

  const clePrivee = await new DeverrouilleClePrivee({
    secretPrf: { fournitSecret: async () => secret },
    derivation: new DerivationDeCleHkdf(),
    paire: new PaireDeClesX25519Hpke(),
    protection: new ProtectionDeCleAesGcm(),
  }).execute({ identite, credentialId: base64urlVersOctets(identifiantAppareil) });

  const contenu = await new DechiffreDocument({
    chiffrement: new ChiffrementAesGcmWeb(),
    hpke: new EncapsulationHpke(),
  }).execute({
    documentId: scan.rapport.documentId,
    document: {
      iv: base64urlVersOctets(scan.rapport.document.iv),
      ciphertext: base64urlVersOctets(scan.rapport.document.ciphertext),
    },
    enveloppe: {
      keyId: enveloppe.keyId,
      enc: base64urlVersOctets(enveloppe.enc),
      ciphertext: base64urlVersOctets(enveloppe.ciphertext),
    },
    clePrivee,
  });

  return new TextDecoder().decode(contenu);
};

export const etapesDechiffrement: EtapesDechiffrement = {
  recupereSecretPrf,
  dechiffreRapport,
};
