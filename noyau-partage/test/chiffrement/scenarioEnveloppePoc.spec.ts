import { describe, expect, it } from 'vitest';
import { EnroleUtilisateur } from '../../src/chiffrement/application/EnroleUtilisateur.ts';
import { DeverrouilleClePrivee } from '../../src/chiffrement/application/DeverrouilleClePrivee.ts';
import { DechiffreDocument } from '../../src/chiffrement/application/DechiffreDocument.ts';
import type { IdentiteCryptographique } from '../../src/chiffrement/domaine/identiteCryptographique.ts';
import { ServiceDeChiffrementParEnveloppe } from '../../src/chiffrement/application/serviceDeChiffrementParEnveloppe.ts';
import {
  lesOutilsPourChiffrer,
  lesOutilsPourDechiffrer,
  lesOutilsPourDeverouillerUneClePrivee,
  lesOutilsPourEnrolerUnUtilisateur,
} from './outilsDeChiffrement.ts';
import { documentPartageDepuisJson } from '../../../outillage/src/chiffrement-rapport/adaptateurs/documentPartageJson.ts';

const CONTENU = 'Rapport de scan — constats confidentiels.';
const DOCUMENT_ID = 'doc-poc-001';

const destinataire = (identite: IdentiteCryptographique) => ({
  keyId: identite.keyId,
  clePublique: identite.clePublique,
});

describe('Scénario POC : chiffrement par enveloppe multi-destinataires', () => {
  it('Alice déchiffre le document que l’administrateur a chiffré pour elle et Bob', async () => {
    const outilsPourEnroler = lesOutilsPourEnrolerUnUtilisateur();
    const credentialAlice = new TextEncoder().encode('yubikey-alice');
    const credentialBob = new TextEncoder().encode('yubikey-bob');

    const alice = await new EnroleUtilisateur(outilsPourEnroler).execute({
      credentialId: credentialAlice,
    });
    const bob = await new EnroleUtilisateur(outilsPourEnroler).execute({
      credentialId: credentialBob,
    });
    const resultat = await new ServiceDeChiffrementParEnveloppe(
      lesOutilsPourChiffrer()
    ).chiffre(DOCUMENT_ID, CONTENU, [destinataire(alice), destinataire(bob)]);
    const partage = documentPartageDepuisJson(resultat);
    const clePriveeAlice = await new DeverrouilleClePrivee(
      lesOutilsPourDeverouillerUneClePrivee()
    ).execute({
      identite: alice,
      credentialId: credentialAlice,
    });

    const enveloppeAlice = partage.enveloppes.find((e) => e.keyId === alice.keyId)!;
    const contenu = await new DechiffreDocument(lesOutilsPourDechiffrer()).execute({
      documentId: partage.documentId,
      document: partage.document,
      enveloppe: enveloppeAlice,
      clePrivee: clePriveeAlice,
    });

    expect(new TextDecoder().decode(contenu)).toBe(CONTENU);
  });

  it('Alice ne peut pas ouvrir l’enveloppe destinée à Bob', async () => {
    const outilsPourEnroler = lesOutilsPourEnrolerUnUtilisateur();
    const credentialAlice = new TextEncoder().encode('yubikey-alice');
    const credentialBob = new TextEncoder().encode('yubikey-bob');
    const alice = await new EnroleUtilisateur(outilsPourEnroler).execute({
      credentialId: credentialAlice,
    });
    const bob = await new EnroleUtilisateur(outilsPourEnroler).execute({
      credentialId: credentialBob,
    });
    const resultat = await new ServiceDeChiffrementParEnveloppe(
      lesOutilsPourChiffrer()
    ).chiffre(DOCUMENT_ID, CONTENU, [destinataire(alice), destinataire(bob)]);

    const clePriveeAlice = await new DeverrouilleClePrivee(
      lesOutilsPourDeverouillerUneClePrivee()
    ).execute({
      identite: alice,
      credentialId: credentialAlice,
    });
    const partage = documentPartageDepuisJson(resultat);
    const enveloppeBob = partage.enveloppes.find((e) => e.keyId === bob.keyId)!;

    await expect(
      new DechiffreDocument(lesOutilsPourDechiffrer()).execute({
        documentId: partage.documentId,
        document: partage.document,
        enveloppe: enveloppeBob,
        clePrivee: clePriveeAlice,
      })
    ).rejects.toThrow();
  });

  it('refuse un document dont le contenu chiffré a été altéré', async () => {
    const credentialAlice = new TextEncoder().encode('yubikey-alice');
    const alice = await new EnroleUtilisateur(
      lesOutilsPourEnrolerUnUtilisateur()
    ).execute({
      credentialId: credentialAlice,
    });
    const resultat = await new ServiceDeChiffrementParEnveloppe(
      lesOutilsPourChiffrer()
    ).chiffre(DOCUMENT_ID, CONTENU, [destinataire(alice)]);
    const clePriveeAlice = await new DeverrouilleClePrivee(
      lesOutilsPourDeverouillerUneClePrivee()
    ).execute({
      identite: alice,
      credentialId: credentialAlice,
    });

    const partage = documentPartageDepuisJson(resultat);
    partage.document.ciphertext[0] ^= 0xff;

    await expect(
      new DechiffreDocument(lesOutilsPourDechiffrer()).execute({
        documentId: partage.documentId,
        document: partage.document,
        enveloppe: partage.enveloppes[0]!,
        clePrivee: clePriveeAlice,
      })
    ).rejects.toThrow();
  });
});
