import { describe, expect, it } from 'vitest';
import { EnroleUtilisateur } from 'pala-noyau-partage/src/chiffrement/application/EnroleUtilisateur.ts';
import { ServiceDeChiffrementParEnveloppe } from 'pala-noyau-partage/src/chiffrement/application/serviceDeChiffrementParEnveloppe.ts';
import { ChiffrementAesGcmWeb } from 'pala-noyau-partage/src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';
import { DerivationDeCleHkdf } from 'pala-noyau-partage/src/chiffrement/adaptateurs/derivationDeCleHkdf.ts';
import { EncapsulationHpke } from 'pala-noyau-partage/src/chiffrement/adaptateurs/encapsulationHpke.ts';
import { PaireDeClesX25519Hpke } from 'pala-noyau-partage/src/chiffrement/adaptateurs/paireDeClesX25519Hpke.ts';
import { ProtectionDeCleAesGcm } from 'pala-noyau-partage/src/chiffrement/adaptateurs/protectionDeCleAesGcm.ts';
import { encodeEnBase64 } from '../../src/enrolement/enveloppe.ts';
import { etapesDechiffrement } from '../../src/rapport/etapesDechiffrement.ts';
import type { Scan } from '../../src/rapport/scan.ts';

const CONTENU = 'Rapport de scan — constats confidentiels.';

const unSecret = (graine: number) => new Uint8Array(32).fill(graine);

const unDestinataireEnrole = async (nom: string, secret: Uint8Array) => {
  const identite = await new EnroleUtilisateur({
    secretPrf: { fournitSecret: async () => secret },
    derivation: new DerivationDeCleHkdf(),
    paire: new PaireDeClesX25519Hpke(),
    protection: new ProtectionDeCleAesGcm(),
  }).execute({ credentialId: new Uint8Array() });
  return {
    identite,
    destinataire: {
      identifiantAppareil: `appareil-${nom}`,
      enveloppe: encodeEnBase64(identite),
    },
  };
};

const unScanChiffrePour = async (
  ...lecteurs: Awaited<ReturnType<typeof unDestinataireEnrole>>[]
): Promise<Scan> => {
  const rapport = await new ServiceDeChiffrementParEnveloppe({
    chiffrement: new ChiffrementAesGcmWeb(),
    paireDeClesAsymetriques: new PaireDeClesX25519Hpke(),
    encapsulationCleDeChiffrement: new EncapsulationHpke(),
  }).chiffre(
    'scan-1',
    CONTENU,
    lecteurs.map(({ identite }) => ({
      keyId: identite.keyId,
      clePublique: identite.clePublique,
    }))
  );
  return {
    id: 'scan-1',
    cible: 'mon-service-securise',
    date: '2026-11-12T10:00:00.000Z',
    rapport: JSON.parse(rapport),
    destinataires: lecteurs.map(({ destinataire }) => destinataire),
  };
};

describe('Le déchiffrement d’un rapport', () => {
  it('restitue le contenu du rapport au destinataire dont la clé a répondu', async () => {
    const alice = await unDestinataireEnrole('alice', unSecret(1));
    const bob = await unDestinataireEnrole('bob', unSecret(2));
    const scan = await unScanChiffrePour(alice, bob);

    const contenu = await etapesDechiffrement.dechiffreRapport(scan, {
      identifiantAppareil: 'appareil-bob',
      secret: unSecret(2),
    });

    expect(contenu).toBe(CONTENU);
  });

  it('refuse une clé qui n’est pas celle d’un destinataire du rapport', async () => {
    const alice = await unDestinataireEnrole('alice', unSecret(1));
    const scan = await unScanChiffrePour(alice);

    await expect(
      etapesDechiffrement.dechiffreRapport(scan, {
        identifiantAppareil: 'appareil-inconnu',
        secret: unSecret(3),
      })
    ).rejects.toThrow('Cette clé n’est pas celle d’un destinataire du rapport.');
  });
});
