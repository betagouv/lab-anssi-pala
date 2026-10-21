import { beforeEach, describe, expect, it } from 'vitest';
import { BusEvenementsPALA } from '../../src/noyau/adaptateurs/node/busEvenementsPALA.ts';
import {
  type ScanTermine,
  unScanTermine,
} from '../../src/codex-security/domaine/scanTermine.ts';
import { abonneNotificationScan } from '../../src/composition/notificationScan.ts';
import type {
  Message,
  MessagerieInstantanee,
} from '../../src/messagerie/domaine/messagerieInstantanee.ts';

class MessagerieDeTest implements MessagerieInstantanee {
  messages: Message[] = [];
  async envoyer(message: Message): Promise<void> {
    this.messages.push(message);
  }
}

describe('Les abonnés à la notification du scan', () => {
  let bus: BusEvenementsPALA;
  beforeEach(() => {
    bus = new BusEvenementsPALA();
  });

  describe('En ce qui concernce le scan terminé ', () => {
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
    };
    it('envoie le message de constat', async () => {
      const messagerieDeTest = new MessagerieDeTest();

      abonneNotificationScan(bus, messagerieDeTest);
      bus.publie(unScanTermine(scanTermine));

      expect(messagerieDeTest.messages).toHaveLength(1);
    });
  });
});
