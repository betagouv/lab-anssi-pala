import {
  type AuthenticationResponseJSON,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import { api } from '../http/api.ts';
import { base64urlVersOctets } from './encodage.ts';
import { versArrayBuffer } from 'pala-noyau-partage/src/chiffrement/adaptateurs/octets.ts';
import type { IdentiteCryptographique } from 'pala-noyau-partage/src/chiffrement/domaine/identiteCryptographique.ts';
import type { SecretPrf } from 'pala-noyau-partage/src/chiffrement/ports/SecretPrf.ts';
import { EnroleUtilisateur } from 'pala-noyau-partage/src/chiffrement/application/EnroleUtilisateur.ts';
import { DerivationDeCleHkdf } from 'pala-noyau-partage/src/chiffrement/adaptateurs/derivationDeCleHkdf.ts';
import { PaireDeClesX25519Hpke } from 'pala-noyau-partage/src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { ProtectionDeCleAesGcm } from 'pala-noyau-partage/src/chiffrement/adaptateurs/protectionDeCleAesGcm.ts';

type EtapesEnrolement = {
  enregistreAppareil: (nom: string) => Promise<Uint8Array>;
  recupereSecretAuthentification: (prfSalt: Uint8Array) => Promise<{
    secret: Uint8Array;
    reponseAuthentification: AuthenticationResponseJSON;
  }>;
  genereIdentiteCryptographique: (
    identifiantAppareil: Uint8Array
  ) => Promise<ResultatEnrolement>;
};

type ResultatsPrf = { prf?: { results?: { first?: ArrayBuffer } } };

export const enregistreAppareil = async (nom: string): Promise<Uint8Array> => {
  const options = await api.enrolement().demandeOptionsEnregistrement(nom);
  const reponse = await startRegistration({ optionsJSON: options });
  await api.enrolement().confirmeEnregistrement(reponse);
  return base64urlVersOctets(reponse.id);
};

export const recupereSecretAuthentification = async (
  prfSalt: Uint8Array
): Promise<{
  secret: Uint8Array;
  reponseAuthentification: AuthenticationResponseJSON;
}> => {
  const options = await api.enrolement().demandeOptionsAuthentification();
  const reponse = await startAuthentication({
    optionsJSON: {
      ...options,
      extensions: {
        ...options.extensions,
        prf: { eval: { first: versArrayBuffer(prfSalt) } },
      },
    },
  });

  const premier = (reponse.clientExtensionResults as ResultatsPrf).prf?.results
    ?.first;
  if (!premier) {
    throw new Error("Le secret PRF n'a pas été fourni par l'authentificateur.");
  }

  return {
    secret: new Uint8Array(premier),
    reponseAuthentification: { ...reponse, clientExtensionResults: {} },
  };
};

export type ResultatEnrolement = {
  identite: IdentiteCryptographique;
  reponseAuthentification: AuthenticationResponseJSON;
};

export const genereIdentiteCryptographique = async (
  identifiantAppareil: Uint8Array
): Promise<ResultatEnrolement> => {
  let reponseAuthentification: AuthenticationResponseJSON | null = null;
  const secretPrf: SecretPrf = {
    async fournitSecret(_credentialId, prfSalt) {
      const resultat = await recupereSecretAuthentification(prfSalt);
      reponseAuthentification = resultat.reponseAuthentification;
      return resultat.secret;
    },
  };

  const enrolement = new EnroleUtilisateur({
    secretPrf,
    derivation: new DerivationDeCleHkdf(),
    paire: new PaireDeClesX25519Hpke(),
    protection: new ProtectionDeCleAesGcm(),
  });
  const identite = await enrolement.execute({ credentialId: identifiantAppareil });

  if (!reponseAuthentification) {
    throw new Error(
      "La cérémonie WebAuthn n'a pas produit de réponse d'authentification."
    );
  }

  return { identite, reponseAuthentification };
};

export const etapesEnrolement: EtapesEnrolement = {
  enregistreAppareil,
  recupereSecretAuthentification,
  genereIdentiteCryptographique,
};
