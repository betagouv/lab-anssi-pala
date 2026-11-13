import { beforeEach, describe, expect, it } from 'vitest';
import { BusEvenementsPALA } from '../../src/noyau/infrastructure/busEvenementsPALA.ts';
import {
  type ScanTermine,
  unScanTermine,
} from '../../src/codex-security/domaine/scanTermine.ts';
import { abonneNotificationScan } from '../../src/composition/notificationScan.ts';
import type {
  Message,
  MessagerieInstantanee,
} from '../../src/messagerie/domaine/messagerieInstantanee.ts';
import { unScanNonEffectue } from '../../src/codex-security/domaine/scanNonEffectue.ts';
import {
  EntrepotDeScanMemoire,
  EntrepotDestinataireMemoire,
} from '../noyau/infrastructutre/entrepots/memoire/entrepotsMemoire.ts';
import { randomUUID, type UUID } from 'node:crypto';
import {
  ServiceDeChiffrementDeTest,
  unServiceDeChiffrementDeTest,
} from '../../../noyau-partage/test/chiffrement/doubles/chiffrementDeTest.ts';
import { type Entrepots } from '../../src/noyau/entrepots.js';
import { type EntrepotDestinataire } from '../../src/scan/entrepotDestinataire.js';

class MessagerieDeTest implements MessagerieInstantanee {
  messages: Message[] = [];
  async envoyer(message: Message): Promise<void> {
    this.messages.push(message);
  }
}

describe('Les abonnés à la notification du scan', () => {
  let bus: BusEvenementsPALA;
  let entrepots: Entrepots;
  let entrepotScan: EntrepotDeScanMemoire;
  let entrepotDestinataire: EntrepotDestinataire;
  let serviceDeChiffrement: ServiceDeChiffrementDeTest;
  let identifiantDuScan: UUID;

  beforeEach(() => {
    bus = new BusEvenementsPALA();
    entrepotScan = new EntrepotDeScanMemoire();
    entrepotDestinataire = new EntrepotDestinataireMemoire();
    entrepots = { scan: entrepotScan, destinataire: entrepotDestinataire };
    serviceDeChiffrement = unServiceDeChiffrementDeTest();
    identifiantDuScan = randomUUID();
    entrepotScan.persiste({
      id: identifiantDuScan,
      cible: 'projet',
      date: new Date(),
      informationsDeCommits: {
        dernierCommit: 'abcde',
        premierCommit: 'fghij',
        dureeHistorique: 777,
        fichiers: ['1', '2'],
      },
    });
  });

  describe('En ce qui concerne le scan terminé ', () => {
    const scanTermine: ScanTermine = {
      nom: 'SCAN_TERMINÉ',
      cible: 'projet',
      resultat: 'Succès',
      cout: { type: 'gratuit' },
      constats: [
        {
          titre: 'Un titre',
          confiance: 'low',
          severite: 'low',
          cwe: [],
          emplacements: [],
        },
      ],
      rapport: 'contenu sensible du rapport',
    };

    it('envoie le message de constat', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepots, serviceDeChiffrement);
      await bus.publie(unScanTermine(scanTermine));

      expect(messagerieDeTest.messages).toHaveLength(1);
    });

    it('envoie le message de constat avec les hashs de commit et le nombre de jours', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepots, serviceDeChiffrement);
      await bus.publie(unScanTermine(scanTermine));

      expect(messagerieDeTest.messages[0].contenu).toContain(
        '**Interval de commits :** [fghij, abcde]'
      );
      expect(messagerieDeTest.messages[0].contenu).toContain(
        '**Historique git sur :** 777 jours'
      );
    });

    it('ne rajoute pas les hashs de commit et le nombre de jours si le scan n’est pas trouvé', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepots, serviceDeChiffrement);
      await bus.publie(unScanTermine({ ...scanTermine, cible: 'cible-inconnue' }));

      expect(messagerieDeTest.messages[0].contenu).not.toContain(
        '**Interval de commits :** [fghij, abcde]'
      );
      expect(messagerieDeTest.messages[0].contenu).not.toContain(
        '**Historique git sur :** 777 jours'
      );
    });

    it('persiste le rapport chiffré dans le scan', async () => {
      await entrepotDestinataire.persiste({
        clePublique: new Uint8Array([10, 20]),
        keyId: 'destinataire-1',
      });
      await entrepotDestinataire.persiste({
        clePublique: new Uint8Array([20, 21]),
        keyId: 'destinataire-2',
      });
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepots, serviceDeChiffrement);
      await bus.publie(unScanTermine(scanTermine));

      expect(entrepotScan.tousLesElements[0].rapport).toBe(
        `rapport chiffré du scan ${identifiantDuScan} pour 2 destinataires`
      );
    });

    it('chiffre le rapport du scan trouvé pour la cible', async () => {
      const premierDestinataire = {
        clePublique: new Uint8Array([10, 20]),
        keyId: 'destinataire-1',
      };
      await entrepotDestinataire.persiste(premierDestinataire);
      const secondDestinataire = {
        clePublique: new Uint8Array([20, 21]),
        keyId: 'destinataire-2',
      };
      await entrepotDestinataire.persiste(secondDestinataire);
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepots, serviceDeChiffrement);
      await bus.publie(unScanTermine(scanTermine));

      expect(serviceDeChiffrement.contenusRecus).toEqual([
        {
          identifiantDocument: identifiantDuScan,
          contenu: 'contenu sensible du rapport',
          destinataires: [premierDestinataire, secondDestinataire],
        },
      ]);
    });

    it('ne chiffre pas le rapport du scan si aucun destinataire', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepots, serviceDeChiffrement);
      await bus.publie(unScanTermine(scanTermine));

      expect(entrepotScan.tousLesElements.filter((s) => !!s.rapport)).toHaveLength(
        0
      );
      expect(serviceDeChiffrement.contenusRecus).toEqual([]);
    });

    it('ne persiste jamais le rapport en clair', async () => {
      await entrepotDestinataire.persiste({
        clePublique: new Uint8Array([10, 20]),
        keyId: 'destinataire-1',
      });
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepots, serviceDeChiffrement);
      await bus.publie(unScanTermine(scanTermine));

      expect(entrepotScan.tousLesElements[0].rapport).not.toContain(
        'contenu sensible'
      );
    });

    it('n’envoie pas le rapport dans le message de constat', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepots, serviceDeChiffrement);
      await bus.publie(unScanTermine(scanTermine));

      expect(messagerieDeTest.messages[0].contenu).not.toContain('contenu sensible');
    });

    it('ne chiffre rien si le scan n’est pas trouvé', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepots, serviceDeChiffrement);
      await bus.publie(unScanTermine({ ...scanTermine, cible: 'cible-inconnue' }));

      expect(serviceDeChiffrement.contenusRecus).toHaveLength(0);
    });
  });

  describe('En ce qui concerne le scan non effectué ', async () => {
    it('envoie le message de constat avec les hashs de commit et le nombre de jours', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepots, serviceDeChiffrement);
      await bus.publie(unScanNonEffectue({ cible: 'projet' }));

      expect(messagerieDeTest.messages[0].contenu).toContain(
        '**Interval de commits :** [fghij, abcde]'
      );
      expect(messagerieDeTest.messages[0].contenu).toContain(
        '**Historique git sur :** 777 jours'
      );
    });
  });
});
