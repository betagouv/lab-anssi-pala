import { get, writable } from 'svelte/store';
import { encodeEnBase64, type Enveloppe } from './enveloppe.ts';
import { api } from '../http/api.ts';
import { etapesEnrolement } from './etapesEnrolement.ts';

export type Statut = 'pret' | 'en-cours' | 'ok' | 'erreur';

export type EtatEnrolement = {
  statut: Statut;
  message: string;
  enveloppe: Enveloppe | null;
};

const etatInitial: EtatEnrolement = {
  statut: 'pret',
  message: '',
  enveloppe: null,
};

const { subscribe, set } = writable<EtatEnrolement>();
set(etatInitial);

const enrole = async (nom: string): Promise<void> => {
  const etatEnrolement = get(storeEnrolement);
  if (etatEnrolement.statut === 'en-cours' || nom.trim() === '') {
    set(etatInitial);
    return;
  }
  set({
    statut: 'en-cours',
    message: 'Touchez votre YubiKey lorsqu’elle clignote…',
    enveloppe: null,
  });

  try {
    const identifiantAppareil = await etapesEnrolement.enregistreAppareil(nom);
    const { identite, reponseAuthentification } =
      await etapesEnrolement.genereIdentiteCryptographique(identifiantAppareil);

    await api.enrolement().finaliseEnrolement({
      reponseAuthentification,
      enveloppe: encodeEnBase64(identite),
    });

    set({
      statut: 'ok',
      message: `Identité enrôlée (keyId ${identite.keyId}).`,
      enveloppe: encodeEnBase64(identite),
    });
  } catch (erreur) {
    set({
      statut: 'erreur',
      message: erreur instanceof Error ? erreur.message : String(erreur),
      enveloppe: null,
    });
    console.error('[PALA] Échec de l’enrôlement', erreur);
  }
};

export const storeEnrolement = { subscribe, enrole };
