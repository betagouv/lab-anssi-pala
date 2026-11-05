import { describe, expect, it } from 'vitest';
import { EnroleUtilisateur } from '../../src/chiffrement/application/EnroleUtilisateur.ts';
import { DeverrouilleClePrivee } from '../../src/chiffrement/application/DeverrouilleClePrivee.ts';
import { ChiffreDocument } from '../../src/chiffrement/application/ChiffreDocument.ts';
import { DechiffreDocument } from '../../src/chiffrement/application/DechiffreDocument.ts';
import { ProtectionDeCleAesGcm } from '../../src/chiffrement/adaptateurs/protectionDeCleAesGcm.ts';
import { SecretPrfSimule } from './doubles/SecretPrfSimule.ts';
import type { IdentiteCryptographique } from '../../src/chiffrement/domaine/identiteCryptographique.ts';
import { ChiffrementAesGcmWeb } from '../../src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';
import { DerivationDeCleHkdf } from '../../src/chiffrement/adaptateurs/derivationDeCleHkdf.ts';
import { PaireDeClesX25519Hpke } from '../../src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { EncapsulationHpke } from '../../src/chiffrement/adaptateurs/encapsulationHpke.ts';

const briquesDeChiffrement = () => ({
  secretPrf: new SecretPrfSimule(),
  derivation: new DerivationDeCleHkdf(),
  paire: new PaireDeClesX25519Hpke(),
  protection: new ProtectionDeCleAesGcm(),
  chiffrement: new ChiffrementAesGcmWeb(),
  hpke: new EncapsulationHpke(),
});

const CONTENU = 'Rapport de scan — constats confidentiels.';
const DOCUMENT_ID = 'doc-poc-001';

const destinataire = (identite: IdentiteCryptographique) => ({
  keyId: identite.keyId,
  clePublique: identite.clePublique,
});

describe('Scénario POC : chiffrement par enveloppe multi-destinataires', () => {
  it('Alice déchiffre le document que l’administrateur a chiffré pour elle et Bob', async () => {
    const lesBriques = briquesDeChiffrement();
    const credentialAlice = new TextEncoder().encode('yubikey-alice');
    const credentialBob = new TextEncoder().encode('yubikey-bob');

    const alice = await new EnroleUtilisateur(lesBriques).execute({
      credentialId: credentialAlice,
    });
    const bob = await new EnroleUtilisateur(lesBriques).execute({
      credentialId: credentialBob,
    });

    const partage = await new ChiffreDocument(lesBriques).execute({
      documentId: DOCUMENT_ID,
      contenu: new TextEncoder().encode(CONTENU),
      destinataires: [destinataire(alice), destinataire(bob)],
    });

    const clePriveeAlice = await new DeverrouilleClePrivee(lesBriques).execute({
      identite: alice,
      credentialId: credentialAlice,
    });
    const enveloppeAlice = partage.enveloppes.find((e) => e.keyId === alice.keyId)!;
    const contenu = await new DechiffreDocument(lesBriques).execute({
      documentId: partage.documentId,
      document: partage.document,
      enveloppe: enveloppeAlice,
      clePrivee: clePriveeAlice,
    });

    expect(new TextDecoder().decode(contenu)).toBe(CONTENU);
  });

  it('Alice ne peut pas ouvrir l’enveloppe destinée à Bob', async () => {
    const d = briquesDeChiffrement();
    const credentialAlice = new TextEncoder().encode('yubikey-alice');
    const credentialBob = new TextEncoder().encode('yubikey-bob');
    const alice = await new EnroleUtilisateur(d).execute({
      credentialId: credentialAlice,
    });
    const bob = await new EnroleUtilisateur(d).execute({
      credentialId: credentialBob,
    });
    const partage = await new ChiffreDocument(d).execute({
      documentId: DOCUMENT_ID,
      contenu: new TextEncoder().encode(CONTENU),
      destinataires: [destinataire(alice), destinataire(bob)],
    });
    const clePriveeAlice = await new DeverrouilleClePrivee(d).execute({
      identite: alice,
      credentialId: credentialAlice,
    });
    const enveloppeBob = partage.enveloppes.find((e) => e.keyId === bob.keyId)!;

    await expect(
      new DechiffreDocument(d).execute({
        documentId: partage.documentId,
        document: partage.document,
        enveloppe: enveloppeBob,
        clePrivee: clePriveeAlice,
      })
    ).rejects.toThrow();
  });

  it('refuse un document dont le contenu chiffré a été altéré', async () => {
    const d = briquesDeChiffrement();
    const credentialAlice = new TextEncoder().encode('yubikey-alice');
    const alice = await new EnroleUtilisateur(d).execute({
      credentialId: credentialAlice,
    });
    const partage = await new ChiffreDocument(d).execute({
      documentId: DOCUMENT_ID,
      contenu: new TextEncoder().encode(CONTENU),
      destinataires: [destinataire(alice)],
    });
    const clePriveeAlice = await new DeverrouilleClePrivee(d).execute({
      identite: alice,
      credentialId: credentialAlice,
    });

    partage.document.ciphertext[0] ^= 0xff;

    await expect(
      new DechiffreDocument(d).execute({
        documentId: partage.documentId,
        document: partage.document,
        enveloppe: partage.enveloppes[0]!,
        clePrivee: clePriveeAlice,
      })
    ).rejects.toThrow();
  });
});
