import { describe, expect, it } from 'vitest';
import { calculeCout } from '../../../src/cout/domaine/cout.ts';
import type { ConsommationDeTokens } from '../../../src/cout/domaine/consommationDeTokens.ts';

const unReleve = (
  details: Partial<ConsommationDeTokens> = {}
): ConsommationDeTokens => ({
  entree: 777_656,
  cache: 348_672,
  sortie: 31_639,
  fournisseur: 'scaleway',
  modele: 'deepseek-v4-flash-0731',
  ...details,
});

describe('Coût', () => {
  it("estime le coût en euros d'un modèle payant tarifé (cache compté au tarif d'entrée)", () => {
    const cout = calculeCout(unReleve());

    expect(cout).toEqual({
      type: 'estimé',
      montantEnEuros: ((777_656 + 348_672) * 0.4) / 1e6 + (31_639 * 0.8) / 1e6,
    });
  });

  it('annonce un coût gratuit pour Albert, service gratuit de la DINUM', () => {
    const cout = calculeCout(unReleve({ fournisseur: 'albert' }));

    expect(cout).toEqual({ type: 'gratuit' });
  });

  it('signale un tarif inconnu pour un modèle payant absent de la table des tarifs', () => {
    const cout = calculeCout(unReleve({ modele: 'modele-inconnu' }));

    expect(cout).toEqual({ type: 'tarifInconnu' });
  });

  it('signale un coût indisponible quand le relevé de tokens est absent (run non terminé)', () => {
    const cout = calculeCout(null);

    expect(cout).toEqual({ type: 'indisponible' });
  });
});
