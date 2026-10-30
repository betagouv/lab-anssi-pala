import { describe, expect, it } from 'vitest';
import { BusEvenementsPALA } from '../../../src/noyau/infrastructure/busEvenementsPALA.ts';
import type { Evenement } from '../../../src/noyau/ports/BusEvenements.ts';

type EvenementDeTest = Evenement & {
  readonly nom: 'ÉVÉNEMENT_DE_TEST';
  charge: string;
};

const unEvenementDeTest = (charge: string): EvenementDeTest => ({
  nom: 'ÉVÉNEMENT_DE_TEST',
  charge,
});

describe("Bus d'événements en mémoire", () => {
  it("délivre un événement publié à l'abonné de ce nom", () => {
    const bus = new BusEvenementsPALA();
    const recus: EvenementDeTest[] = [];
    bus.sabonne<EvenementDeTest>('ÉVÉNEMENT_DE_TEST', (evenement) => {
      recus.push(evenement);
    });

    bus.publie(unEvenementDeTest('bonjour'));

    expect(recus).toEqual([unEvenementDeTest('bonjour')]);
  });

  it('délivre un événement à tous les abonnés de ce nom', () => {
    const bus = new BusEvenementsPALA();
    const recusParLePremier: EvenementDeTest[] = [];
    const recusParLeSecond: EvenementDeTest[] = [];
    bus.sabonne<EvenementDeTest>('ÉVÉNEMENT_DE_TEST', (e) => {
      recusParLePremier.push(e);
    });
    bus.sabonne<EvenementDeTest>('ÉVÉNEMENT_DE_TEST', (e) => {
      recusParLeSecond.push(e);
    });

    bus.publie(unEvenementDeTest('bonjour'));

    expect(recusParLePremier).toEqual([unEvenementDeTest('bonjour')]);
    expect(recusParLeSecond).toEqual([unEvenementDeTest('bonjour')]);
  });

  it("n'alerte pas les abonnés d'un autre nom d'événement", () => {
    const bus = new BusEvenementsPALA();
    const recus: Evenement[] = [];
    bus.sabonne('UN_AUTRE_ÉVÉNEMENT', (e) => {
      recus.push(e);
    });

    bus.publie(unEvenementDeTest('bonjour'));

    expect(recus).toEqual([]);
  });

  it("ne fait rien quand aucun abonné n'écoute l'événement publié", () => {
    const bus = new BusEvenementsPALA();

    expect(() => bus.publie(unEvenementDeTest('bonjour'))).not.toThrow();
  });
});
