import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { testeurPALA } from './testeurPALA.ts';
import { adaptateurEnvironnement } from '../src/adaptateurs/adaptateurEnvironnement.ts';

describe('Serveur PALA', () => {
  const testeur = testeurPALA();

  beforeEach(() => {
    delete process.env.ENROLEMENT_DOMAINE;
    delete process.env.ENROLEMENT_ORIGINE;
    delete process.env.ENROLEMENT_SECRET_SESSION;
  });
  afterAll(() => {
    delete process.env.ENROLEMENT_DOMAINE;
    delete process.env.ENROLEMENT_ORIGINE;
    delete process.env.ENROLEMENT_SECRET_SESSION;
  });

  it('ne démarre pas tant que le domaine d’enrôlement n’est pas positionné', () => {
    process.env.ENROLEMENT_ORIGINE = 'origine';
    process.env.ENROLEMENT_SECRET_SESSION = 'session';
    expect(() => testeur.initialise()).toThrow(
      'Le paramètre ENROLEMENT_DOMAINE n’est pas positionné'
    );
  });

  it('ne démarre pas tant que l’origine de l’enrôlement n’est pas positionnée', () => {
    process.env.ENROLEMENT_DOMAINE = 'domaine';
    process.env.ENROLEMENT_SECRET_SESSION = 'session';
    expect(() => testeur.initialise()).toThrow(
      'Le paramètre ENROLEMENT_ORIGINE n’est pas positionné'
    );
  });

  it('ne démarre pas tant que le secret de session n’est pas positionné', () => {
    process.env.ENROLEMENT_DOMAINE = 'domaine';
    process.env.ENROLEMENT_ORIGINE = 'origine';
    expect(() => testeur.initialise()).toThrow(
      'Le paramètre ENROLEMENT_SECRET_SESSION n’est pas positionné'
    );
  });
  it('ne démarre pas tant que les paramètres d’environnement ne sont pas positionnés', () => {
    expect(() => testeur.initialise()).toThrow(
      'Les paramètres suivants ENROLEMENT_DOMAINE, ENROLEMENT_ORIGINE, ENROLEMENT_SECRET_SESSION ne sont pas positionnés'
    );
  });

  it('ne renvoie pas la page d’enrôlement si pas activé', async () => {
    adaptateurEnvironnement.verifieLesVariablesNecessaires = () => {};
    adaptateurEnvironnement.enrolement = () => ({
      domaine: '127.0.0.1',
      nomDuService: 'PALA-Test',
      origine: 'http://127.0.0.1',
      secretDeSession: 'un-secret',
      active: false,
    });
    testeur.initialise();
    const reponse = await testeur.get('/enrolement');

    expect(reponse.status).toBe(404);
  });
});
