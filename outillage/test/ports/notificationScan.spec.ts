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
import { EntrepotDeScanMemoire } from '../noyau/infrastructutre/entrepots/memoire/entrepotScanMemoire.ts';
import { randomUUID } from 'node:crypto';

class MessagerieDeTest implements MessagerieInstantanee {
  messages: Message[] = [];
  async envoyer(message: Message): Promise<void> {
    this.messages.push(message);
  }
}

describe('Les abonnés à la notification du scan', () => {
  let bus: BusEvenementsPALA;
  let entrepot: EntrepotDeScanMemoire;
  beforeEach(() => {
    bus = new BusEvenementsPALA();
    entrepot = new EntrepotDeScanMemoire();
    entrepot.persiste({
      id: randomUUID(),
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
      rapport: 'le rapport',
    };

    it('envoie le message de constat', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepot);
      await bus.publie(unScanTermine(scanTermine));

      expect(messagerieDeTest.messages).toHaveLength(1);
    });

    it('envoie le message de constat avec les hashs de commit et le nombre de jours', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepot);
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

      abonneNotificationScan(bus, messagerieDeTest, entrepot);
      await bus.publie(unScanTermine({ ...scanTermine, cible: 'cible-inconnue' }));

      expect(messagerieDeTest.messages[0].contenu).not.toContain(
        '**Interval de commits :** [fghij, abcde]'
      );
      expect(messagerieDeTest.messages[0].contenu).not.toContain(
        '**Historique git sur :** 777 jours'
      );
    });

    it('persiste le rapport dans le scan', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepot);
      await bus.publie(unScanTermine({ ...scanTermine, rapport: 'le rapport' }));

      expect(entrepot.tousLesElements[0].rapport).toBe('le rapport');
    });
  });

  describe('En ce qui concerne le scan non effectué ', async () => {
    it('envoie le message de constat avec les hashs de commit et le nombre de jours', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest, entrepot);
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
