import { describe, expect, it } from 'vitest';
import { DechiffreDocument } from '../../../src/chiffrement/application/DechiffreDocument.ts';
import { ChiffrementAesGcmWeb } from '../../../src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';
import { PaireDeClesX25519Hpke } from '../../../src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { EncapsulationHpke } from '../../../src/chiffrement/adaptateurs/encapsulationHpke.ts';
import { ServiceDeChiffrementParEnveloppe } from '../../../src/chiffrement/application/serviceDeChiffrementParEnveloppe.ts';
import { documentPartageDepuisJson } from '../../../../outillage/src/chiffrement-rapport/adaptateurs/documentPartageJson.ts';

const briques = () => ({
  chiffrement: new ChiffrementAesGcmWeb(),
  paireDeClesAsymetriques: new PaireDeClesX25519Hpke(),
  encapsulationCleDeChiffrement: new EncapsulationHpke(),
});

describe('Déchiffrement d’un document par un destinataire', () => {
  it('restitue le contenu d’origine avec la clé privée du destinataire', async () => {
    const d = briques();
    const paire = await d.paireDeClesAsymetriques.genere();
    const destinataire = {
      keyId: 'alice-key',
      clePublique: await d.paireDeClesAsymetriques.exportePublique(paire.publicKey),
    };

    const resultat = await new ServiceDeChiffrementParEnveloppe(d).chiffre(
      'doc-123',
      'contenu confidentiel',
      [destinataire]
    );

    const partage = documentPartageDepuisJson(resultat);
    const contenu = await new DechiffreDocument({
      chiffrement: d.chiffrement,
      hpke: d.encapsulationCleDeChiffrement,
    }).execute({
      documentId: 'doc-123',
      document: partage.document,
      enveloppe: partage.enveloppes[0]!,
      clePrivee: paire.privateKey,
    });

    expect(new TextDecoder().decode(contenu)).toBe('contenu confidentiel');
  });
});
