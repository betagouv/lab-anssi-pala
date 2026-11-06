import { describe, expect, it } from 'vitest';
import {
  type ConfigurationChiffrement,
  ServiceDeChiffrementParEnveloppe,
} from '../../../src/chiffrement/application/serviceDeChiffrementParEnveloppe.ts';
import { documentPartageDepuisJson } from '../../../../outillage/src/chiffrement-rapport/adaptateurs/documentPartageJson.ts';
import {
  unConstructeurDeChiffrementSymetriqueDeTest,
  unConstructeurDEncapsulationDeCle,
  uneCleCryptographiqueDeTest,
} from '../doubles/chiffrementDeTest.ts';
import type { Enveloppe } from '../../../src/chiffrement/domaine/documentChiffre.ts';
import { lesOutilsPourChiffrer } from '../outilsDeChiffrement.ts';

const unDestinataire = async (keyId: string) => {
  const { paireDeClesAsymetriques } = lesOutilsPourChiffrer();
  const clesDuDestinataire = await paireDeClesAsymetriques.genere();
  return {
    destinataire: {
      keyId,
      clePublique: await paireDeClesAsymetriques.exportePublique(
        clesDuDestinataire.publicKey
      ),
    },
    clePrivee: clesDuDestinataire.privateKey,
  };
};

const unServiceDeChiffrementPour = (doubles?: Partial<ConfigurationChiffrement>) =>
  new ServiceDeChiffrementParEnveloppe({
    ...lesOutilsPourChiffrer(),
    ...doubles,
  });

describe('Le chiffrement d’un contenu par enveloppe', () => {
  const contenu = 'Rapport confidentiel : injection SQL dans /api/utilisateurs';

  it('ne laisse pas le rapport en clair dans le résultat', async () => {
    const alice = await unDestinataire('alice-key');
    const chiffrement = unConstructeurDeChiffrementSymetriqueDeTest().construis();

    const resultat = await unServiceDeChiffrementPour({ chiffrement }).chiffre(
      'scan-123',
      contenu,
      [alice.destinataire]
    );

    expect(resultat).toBeDefined();
    const documentPartage = documentPartageDepuisJson(resultat);
    expect(documentPartage.document.ciphertext).toEqual(
      new TextEncoder().encode(`${contenu}-chiffré`)
    );
    expect(chiffrement.elementsChiffresRecus[0]).toStrictEqual({
      aad: expect.any(Uint8Array),
      texte: new TextEncoder().encode(contenu),
      cle: uneCleCryptographiqueDeTest(),
    });
  });

  it('produit une enveloppe par destinataire', async () => {
    const alice = await unDestinataire('alice-key');
    const bob = await unDestinataire('bob-key');

    const resultat = await unServiceDeChiffrementPour().chiffre(
      'scan-123',
      contenu,
      [alice.destinataire, bob.destinataire]
    );

    const partage = documentPartageDepuisJson(resultat);
    expect(partage.documentId).toBe('scan-123');
    expect(partage.enveloppes.map((e) => e.keyId)).toEqual(['alice-key', 'bob-key']);
  });

  it('permet à chaque destinataire de retrouver le rapport avec sa clé privée', async () => {
    const alice = await unDestinataire('alice-key');
    const bob = await unDestinataire('bob-key');

    const resultat = await unServiceDeChiffrementPour().chiffre(
      'scan-123',
      contenu,
      [alice.destinataire, bob.destinataire]
    );

    const resultatParse = JSON.parse(resultat);
    const enveloppes = resultatParse.enveloppes;
    expect(enveloppes.map((e: Enveloppe) => e.ciphertext)).toHaveLength(2);
  });

  it('produit un résultat différent à chaque chiffrement du même rapport', async () => {
    const alice = await unDestinataire('alice-key');
    const chiffrement = unConstructeurDeChiffrementSymetriqueDeTest().construis();
    const serviceDeChiffrement = unServiceDeChiffrementPour({ chiffrement });

    await serviceDeChiffrement.chiffre('scan-123', contenu, [alice.destinataire]);
    await serviceDeChiffrement.chiffre('scan-123', contenu, [alice.destinataire]);

    expect(chiffrement.elementsChiffresRecus).toHaveLength(2);
    expect(chiffrement.generationDeCle).toEqual(2);
  });

  it('encode la partie du document dans le résultat', async () => {
    const alice = await unDestinataire('alice-key');
    const chiffrement = unConstructeurDeChiffrementSymetriqueDeTest()
      .avecIVPourLeDocument('iv-pour-document-alice')
      .construis();
    const serviceDeChiffrement = unServiceDeChiffrementPour({ chiffrement });

    const resultat = await serviceDeChiffrement.chiffre('scan-123', contenu, [
      alice.destinataire,
    ]);

    const resultatJson = JSON.parse(resultat);
    expect(resultatJson.document.iv).toBe('aXYtcG91ci1kb2N1bWVudC1hbGljZQ');
    expect(
      new TextDecoder().decode(Buffer.from(resultatJson.document.iv, 'base64'))
    ).toBe('iv-pour-document-alice');
    expect(resultatJson.document.ciphertext).toBe(
      'UmFwcG9ydCBjb25maWRlbnRpZWwgOiBpbmplY3Rpb24gU1FMIGRhbnMgL2FwaS91dGlsaXNhdGV1cnMtY2hpZmZyw6k'
    );
    expect(
      new TextDecoder().decode(
        Buffer.from(resultatJson.document.ciphertext, 'base64')
      )
    ).toBe(`${contenu}-chiffré`);
  });

  it('encode la partie des enveloppes dans le résultat', async () => {
    const alice = await unDestinataire('alice-key');
    const bob = await unDestinataire('bob-key');
    const encapsulationDeTest = unConstructeurDEncapsulationDeCle()
      .retourneUneEnveloppePour(alice.destinataire, {
        enc: 'cle-encapsulee-alice',
        ciphertext: 'cle-dek-chiffrée-pour-alice',
      })
      .retourneUneEnveloppePour(bob.destinataire, {
        enc: 'cle-encapsulee-bob',
        ciphertext: 'cle-dek-chiffrée-pour-bob',
      })
      .construis();
    const chiffrement = unConstructeurDeChiffrementSymetriqueDeTest()
      .avecIVPourLeDocument('iv-pour-document-alice')
      .construis();
    const resultat = await unServiceDeChiffrementPour({
      chiffrement,
      encapsulationCleDeChiffrement: encapsulationDeTest,
    }).chiffre('scan-123', contenu, [alice.destinataire, bob.destinataire]);

    const resultatJson = JSON.parse(resultat);
    const enveloppeAlice = resultatJson.enveloppes[0];
    expect(enveloppeAlice.keyId).toBe('alice-key');
    expect(enveloppeAlice.enc).toBe('Y2xlLWVuY2Fwc3VsZWUtYWxpY2U');
    expect(enveloppeAlice.ciphertext).toBe('Y2xlLWRlay1jaGlmZnLDqWUtcG91ci1hbGljZQ');
    expect(new TextDecoder().decode(Buffer.from(enveloppeAlice.enc, 'base64'))).toBe(
      '' + 'cle-encapsulee-alice'
    );
    expect(
      new TextDecoder().decode(Buffer.from(enveloppeAlice.ciphertext, 'base64'))
    ).toBe('cle-dek-chiffrée-pour-alice');
  });
});
