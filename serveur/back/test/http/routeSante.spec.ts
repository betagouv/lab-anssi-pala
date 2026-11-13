import { beforeEach, describe, expect, it } from 'vitest';
import { testeurPALA } from '../testeurPALA.ts';
import { adaptateurEnvironnement } from '../../src/adaptateurs/adaptateurEnvironnement.ts';

describe('La route de santé', () => {
  const testeur = testeurPALA();

  beforeEach(() => {
    adaptateurEnvironnement.verifieLesVariablesNecessaires = () => {};
    testeur.initialise();
  });

  it('répond 200 sans authentification', async () => {
    const reponse = await testeur.get('/sante');

    expect(reponse.status).toBe(200);
    expect(reponse.body).toEqual({ statut: 'ok' });
  });
});
