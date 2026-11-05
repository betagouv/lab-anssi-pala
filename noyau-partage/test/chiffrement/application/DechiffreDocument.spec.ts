import { describe, expect, it } from 'vitest';
import { ChiffreDocument } from '../../../src/chiffrement/application/ChiffreDocument.ts';
import { DechiffreDocument } from '../../../src/chiffrement/application/DechiffreDocument.ts';
import { ChiffrementAesGcmWeb } from '../../../src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';
import { PaireDeClesX25519Hpke } from '../../../src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { EncapsulationHpke } from '../../../src/chiffrement/adaptateurs/encapsulationHpke.ts';

const briques = () => ({
  chiffrement: new ChiffrementAesGcmWeb(),
  paire: new PaireDeClesX25519Hpke(),
  hpke: new EncapsulationHpke(),
});

describe('Déchiffrement d’un document par un destinataire', () => {
  it('restitue le contenu d’origine avec la clé privée du destinataire', async () => {
    const d = briques();
    const paire = await d.paire.genere();
    const destinataire = {
      keyId: 'alice-key',
      clePublique: await d.paire.exportePublique(paire.publicKey),
    };

    const partage = await new ChiffreDocument(d).execute({
      documentId: 'doc-123',
      contenu: new TextEncoder().encode('contenu confidentiel'),
      destinataires: [destinataire],
    });

    const contenu = await new DechiffreDocument(d).execute({
      documentId: partage.documentId,
      document: partage.document,
      enveloppe: partage.enveloppes[0]!,
      clePrivee: paire.privateKey,
    });

    expect(new TextDecoder().decode(contenu)).toBe('contenu confidentiel');
  });
});
