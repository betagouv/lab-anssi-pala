import type { DocumentPartage } from '../../../../noyau-partage/src/chiffrement/domaine/documentPartage.ts';

type OctetsEnBase64Url = string;

type DocumentPartageJson = {
  documentId: string;
  document: { iv: OctetsEnBase64Url; ciphertext: OctetsEnBase64Url };
  enveloppes: {
    keyId: string;
    enc: OctetsEnBase64Url;
    ciphertext: OctetsEnBase64Url;
  }[];
};

const enBase64Url = (octets: Uint8Array): OctetsEnBase64Url =>
  Buffer.from(octets).toString('base64url');

const enOctets = (texte: OctetsEnBase64Url): Uint8Array =>
  new Uint8Array(Buffer.from(texte, 'base64url'));

export const documentPartageVersJson = (partage: DocumentPartage): string => {
  const json: DocumentPartageJson = {
    documentId: partage.documentId,
    document: {
      iv: enBase64Url(partage.document.iv),
      ciphertext: enBase64Url(partage.document.ciphertext),
    },
    enveloppes: partage.enveloppes.map((enveloppe) => ({
      keyId: enveloppe.keyId,
      enc: enBase64Url(enveloppe.enc),
      ciphertext: enBase64Url(enveloppe.ciphertext),
    })),
  };
  return JSON.stringify(json);
};

export const documentPartageDepuisJson = (texte: string): DocumentPartage => {
  const json: DocumentPartageJson = JSON.parse(texte);
  return {
    documentId: json.documentId,
    document: {
      iv: enOctets(json.document.iv),
      ciphertext: enOctets(json.document.ciphertext),
    },
    enveloppes: json.enveloppes.map((enveloppe) => ({
      keyId: enveloppe.keyId,
      enc: enOctets(enveloppe.enc),
      ciphertext: enOctets(enveloppe.ciphertext),
    })),
  };
};
