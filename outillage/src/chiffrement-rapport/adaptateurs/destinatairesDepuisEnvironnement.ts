import type { Destinataire } from '../../../../noyau-partage/src/chiffrement/domaine/documentPartage.ts';

const erreurDeFormat = (detail: string) =>
  new Error(
    `Erreur: RAPPORT_DESTINATAIRES ${detail} (attendu : [{ "keyId": "...", "clePublique": "<base64url>" }])`
  );

const estUneChaine = (valeur: unknown): valeur is string =>
  typeof valeur === 'string' && valeur.length > 0;

const parseLaListe = (json: string): unknown => {
  try {
    return JSON.parse(json);
  } catch {
    throw erreurDeFormat('doit contenir du JSON');
  }
};

export const destinatairesDepuisJson = (json: string): Destinataire[] => {
  const liste = parseLaListe(json);
  if (!Array.isArray(liste)) throw erreurDeFormat('doit être une liste');

  return liste.map((element: { keyId?: unknown; clePublique?: unknown }) => {
    if (!estUneChaine(element?.keyId) || !estUneChaine(element?.clePublique))
      throw erreurDeFormat(
        'doit fournir un keyId et une clePublique par destinataire'
      );
    return {
      keyId: element.keyId,
      clePublique: new Uint8Array(Buffer.from(element.clePublique, 'base64url')),
    };
  });
};
