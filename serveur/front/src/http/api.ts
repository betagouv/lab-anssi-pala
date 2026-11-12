import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/browser';
import type { Enveloppe } from '../enrolement/enveloppe.ts';
import type { Scan } from '../rapport/scan.ts';

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

type ApiScans = {
  recupere: (identifiant: string) => Promise<Scan>;
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

const scans: ApiScans = {
  recupere(identifiant: string): Promise<Scan> {
    return recupereJson(`/scans/${encodeURIComponent(identifiant)}`);
  },
};

export const api = {
  enrolement: (): ApiEnrolement => enrolement,
  scans: (): ApiScans => scans,
};

const reponseJson = async <T>(url: string, reponse: Response): Promise<T> => {
  if (!reponse.ok) {
    const detail = (await reponse.json().catch(() => ({}))) as { erreur?: string };
    throw new Error(
      detail.erreur ?? `Échec de la requête ${url} (${reponse.status}).`
    );
  }
  return reponse.json() as Promise<T>;
};

const recupereJson = async <T>(url: string): Promise<T> =>
  reponseJson(url, await fetch(url, { headers: { accept: 'application/json' } }));

const posteJson = async <T>(url: string, corps: unknown): Promise<T> =>
  reponseJson(
    url,
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(corps),
    })
  );
