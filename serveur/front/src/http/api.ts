import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/browser';
import type { Enveloppe } from '../enrolement/enveloppe.ts';

type ApiEnrolement = {
  demandeOptionsEnregistrement: (
    nom: string
  ) => Promise<PublicKeyCredentialCreationOptionsJSON>;
  confirmeEnregistrement: (reponse: RegistrationResponseJSON) => Promise<unknown>;
  demandeOptionsAuthentification: () => Promise<PublicKeyCredentialRequestOptionsJSON>;
  finaliseEnrolement: (corps: {
    reponseAuthentification: AuthenticationResponseJSON;
    enveloppe: Enveloppe;
  }) => Promise<unknown>;
};

const enrolement = {
  confirmeEnregistrement(reponse: RegistrationResponseJSON): Promise<unknown> {
    return posteJson('/enrolement/enregistrement/finalisation', { reponse });
  },
  async demandeOptionsAuthentification(): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const { options } = await posteJson<{
      options: PublicKeyCredentialRequestOptionsJSON;
    }>('/enrolement/authentification/demarrage', {});
    return options;
  },
  async demandeOptionsEnregistrement(
    nom: string
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const { options } = await posteJson<{
      options: PublicKeyCredentialCreationOptionsJSON;
    }>('/enrolement/enregistrement/demarrage', { nom });
    return options;
  },
  finaliseEnrolement(corps: {
    reponseAuthentification: AuthenticationResponseJSON;
    enveloppe: Enveloppe;
  }): Promise<unknown> {
    return posteJson('/enrolement/finalisation', corps);
  },
};

export const api = {
  enrolement: (): ApiEnrolement => enrolement,
};

const posteJson = async <T>(url: string, corps: unknown): Promise<T> => {
  const reponse = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(corps),
  });
  if (!reponse.ok) {
    const detail = (await reponse.json().catch(() => ({}))) as { erreur?: string };
    throw new Error(
      detail.erreur ?? `Échec de la requête ${url} (${reponse.status}).`
    );
  }
  return reponse.json() as Promise<T>;
};
