import { describe, expect, it } from 'vitest';
import { ChiffrementDuRapportHpke } from '../../../src/chiffrement-rapport/adaptateurs/ChiffrementDuRapportHpke.ts';
import { documentPartageDepuisJson } from '../../../src/chiffrement-rapport/adaptateurs/documentPartageJson.ts';
import { ChiffreDocument } from '../../../../noyau-partage/src/chiffrement/application/ChiffreDocument.ts';
import { DechiffreDocument } from '../../../../noyau-partage/src/chiffrement/application/DechiffreDocument.ts';
import { ChiffrementAesGcmWeb } from '../../../../noyau-partage/src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';
import { PaireDeClesX25519Hpke } from '../../../../noyau-partage/src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { EncapsulationHpke } from '../../../../noyau-partage/src/chiffrement/adaptateurs/encapsulationHpke.ts';

const briques = () => ({
  chiffrement: new ChiffrementAesGcmWeb(),
  paire: new PaireDeClesX25519Hpke(),
  hpke: new EncapsulationHpke(),
});

const unDestinataire = async (keyId: string) => {
  const { paire } = briques();
  const clesDuDestinataire = await paire.genere();
  return {
    destinataire: {
      keyId,
      clePublique: await paire.exportePublique(clesDuDestinataire.publicKey),
    },
    clePrivee: clesDuDestinataire.privateKey,
  };
};

const unChiffrementPour = (
  destinataires: { keyId: string; clePublique: Uint8Array }[]
) =>
  new ChiffrementDuRapportHpke({
    chiffreDocument: new ChiffreDocument(briques()),
    destinataires,
  });

describe('Le chiffrement du rapport par enveloppe HPKE', () => {
  const rapport = 'Rapport confidentiel : injection SQL dans /api/utilisateurs';

  it('ne laisse pas le rapport en clair dans le résultat', async () => {
    const alice = await unDestinataire('alice-key');

    const resultat = await unChiffrementPour([alice.destinataire]).chiffre(
      'scan-123',
      rapport
    );

    expect(resultat).not.toContain('injection SQL');
  });

  it('produit une enveloppe par destinataire', async () => {
    const alice = await unDestinataire('alice-key');
    const bob = await unDestinataire('bob-key');

    const resultat = await unChiffrementPour([
      alice.destinataire,
      bob.destinataire,
    ]).chiffre('scan-123', rapport);

    const partage = documentPartageDepuisJson(resultat);
    expect(partage.documentId).toBe('scan-123');
    expect(partage.enveloppes.map((e) => e.keyId)).toEqual(['alice-key', 'bob-key']);
  });

  it('permet à chaque destinataire de retrouver le rapport avec sa clé privée', async () => {
    const alice = await unDestinataire('alice-key');
    const bob = await unDestinataire('bob-key');

    const resultat = await unChiffrementPour([
      alice.destinataire,
      bob.destinataire,
    ]).chiffre('scan-123', rapport);

    const partage = documentPartageDepuisJson(resultat);
    for (const [index, { clePrivee }] of [alice, bob].entries()) {
      const contenu = await new DechiffreDocument(briques()).execute({
        documentId: partage.documentId,
        document: partage.document,
        enveloppe: partage.enveloppes[index]!,
        clePrivee,
      });
      expect(new TextDecoder().decode(contenu)).toBe(rapport);
    }
  });

  it('produit un résultat différent à chaque chiffrement du même rapport', async () => {
    const alice = await unDestinataire('alice-key');
    const chiffrement = unChiffrementPour([alice.destinataire]);

    const premier = await chiffrement.chiffre('scan-123', rapport);
    const second = await chiffrement.chiffre('scan-123', rapport);

    expect(premier).not.toBe(second);
  });
});
