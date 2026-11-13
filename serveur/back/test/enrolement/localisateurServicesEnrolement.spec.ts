import { LocalisateurServicesEnrolement } from '../../src/enrolement/localisateurServicesEnrolement.ts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DemarreAuthentification,
  DemarreEnregistrement,
  FinaliseEnregistrement,
  FinaliseEnrolement,
} from '../../src/enrolement/etapesEnrolement.ts';
import { EntrepotUtilisateursEnMemoire } from '../infra/entrepots/memoire/entrepotUtilisateursEnMemoire.ts';
import { operationsWebAuthn } from '../../src/adaptateurs/adaptateurWebAuthn.ts';
import { adaptateurEnvironnement } from '../../src/adaptateurs/adaptateurEnvironnement.ts';

describe('Le localisateur de services d‘enrôlement', () => {
  beforeEach(() => {
    operationsWebAuthn.cree = () => {
      return {
        prepareEnregistrement: async () => ({ options: {}, defi: '' }),
        verifieEnregistrement: async () => ({
          identifiant: '',
          clePublique: '',
          compteur: 1,
        }),
        prepareAuthentification: async () => ({ options: {}, defi: '' }),
        verifieAuthentification: async () => ({ compteur: 2 }),
      };
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retourne les services d‘enrôlement', () => {
    vi.spyOn(adaptateurEnvironnement, 'enrolement').mockReturnValue({
      nomDuService: 'PALA-TEST',
      domaine: 'domaine',
      origine: 'origine',
      secretDeSession: 'secret',
    });
    const entrepot = new EntrepotUtilisateursEnMemoire();

    const services = new LocalisateurServicesEnrolement(entrepot).localise();

    expect(services).toEqual({
      demarreEnregistrement: expect.any(DemarreEnregistrement),
      finaliseEnregistrement: expect.any(FinaliseEnregistrement),
      demarreAuthentification: expect.any(DemarreAuthentification),
      finaliseEnrolement: expect.any(FinaliseEnrolement),
    });
  });
});
