import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import type { ParametresEnrolement } from '../infra/environnement.ts';
import type {
  PrepareAuthentification,
  PrepareEnregistrement,
  VerifieAuthentification,
  VerifieFinalisationEnregistrement,
} from '../enrolement/etapesEnrolement.ts';

export type OperationsWebAuthn = {
  prepareEnregistrement: PrepareEnregistrement;
  verifieEnregistrement: VerifieFinalisationEnregistrement;
  prepareAuthentification: PrepareAuthentification;
  verifieAuthentification: VerifieAuthentification;
};

export const creeOperationsWebAuthn = (
  parametres: ParametresEnrolement
): OperationsWebAuthn => {
  const prepareEnregistrement: PrepareEnregistrement = async ({
    identifiantUtilisateur,
    nom,
  }) => {
    const options = await generateRegistrationOptions({
      rpName: parametres.nomDuService,
      rpID: parametres.domaine,
      userName: nom,
      userID: isoBase64URL.toBuffer(identifiantUtilisateur),
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'required',
        residentKey: 'discouraged',
      },
    });

    return {
      options: { ...options, extensions: { ...options.extensions, prf: {} } },
      defi: options.challenge,
    };
  };

  const verifieEnregistrement: VerifieFinalisationEnregistrement = async ({
    reponse,
    defiAttendu,
  }) => {
    const verification = await verifyRegistrationResponse({
      response: reponse as RegistrationResponseJSON,
      expectedChallenge: defiAttendu,
      expectedOrigin: parametres.origine,
      expectedRPID: parametres.domaine,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error("Échec de la vérification de l'enregistrement de l'appareil.");
    }

    const { credential } = verification.registrationInfo;
    return {
      identifiant: credential.id,
      clePublique: isoBase64URL.fromBuffer(credential.publicKey),
      compteur: credential.counter,
    };
  };

  const prepareAuthentification: PrepareAuthentification = async ({
    identifiantAppareil,
  }) => {
    const options = await generateAuthenticationOptions({
      rpID: parametres.domaine,
      allowCredentials: [{ id: identifiantAppareil }],
      userVerification: 'required',
    });

    return { options, defi: options.challenge };
  };

  const verifieAuthentification: VerifieAuthentification = async ({
    reponse,
    defiAttendu,
    appareil,
  }) => {
    const verification = await verifyAuthenticationResponse({
      response: reponse as AuthenticationResponseJSON,
      expectedChallenge: defiAttendu,
      expectedOrigin: parametres.origine,
      expectedRPID: parametres.domaine,
      requireUserVerification: true,
      credential: {
        id: appareil.identifiant,
        publicKey: isoBase64URL.toBuffer(appareil.clePublique),
        counter: appareil.compteur,
      },
    });

    if (!verification.verified) {
      throw new Error("Échec de la vérification de l'authentification.");
    }

    return { compteur: verification.authenticationInfo.newCounter };
  };

  return {
    prepareEnregistrement,
    verifieEnregistrement,
    prepareAuthentification,
    verifieAuthentification,
  };
};
