import { describe, expect, test } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import {
  type Dependances,
  EstimationDuCout,
} from '../../../src/cout/application/estimationDuCout.ts';
import { unReleveDeConsommationDeTokensCodex } from '../../../src/cout/domaine/consommationDeTokens.ts';
import type { Console } from '../../../src/noyau/ports/Console.ts';

const RELEVE_CODEX =
  '  TOKENS   777,656 uncached input, 348,672 cache reads, 0 cache writes, 31,639 output, 1,157,967 total';

const lesDependances = (console: Console): Dependances => ({
  console,
});

describe('EstimeCout', () => {
  test("estime le coût d'un scan Codex sur un modèle Scaleway, cache compté au tarif d'entrée", () => {
    const sortie = new ConsoleEnMemoire();

    new EstimationDuCout(lesDependances(sortie)).rapporte(
      unReleveDeConsommationDeTokensCodex(
        RELEVE_CODEX,
        'scaleway_deepseek',
        'deepseek-v4-flash-0731'
      )
    );

    expect(sortie.lignes.map((l) => l.message)).toEqual([
      '--- Coût estimé ---',
      '  Modèle    : deepseek-v4-flash-0731 (fournisseur scaleway_deepseek)',
      '  Tokens    : 1 126 328 entrée (dont 348 672 en cache), 31 639 sortie',
      '  Coût      : ~0.48 € (tarif Scaleway : 0.4 €/M entrée, 0.8 €/M sortie)',
      "  Note      : estimation haute (cache compté au tarif d'entrée) ; à confronter au relevé du fournisseur.",
    ]);
  });

  test('annonce un coût nul pour Albert, service gratuit de la DINUM', () => {
    const sortie = new ConsoleEnMemoire();

    new EstimationDuCout(lesDependances(sortie)).rapporte(
      unReleveDeConsommationDeTokensCodex(RELEVE_CODEX, 'albert', 'modèle')
    );

    expect(sortie.lignes.map((l) => l.message).slice(3)).toEqual([
      '  Coût      : 0 € — Albert (DINUM), service gratuit',
      '  Note      : Albert sous-estime les tokens de sortie (raisonnement/outils non comptés).',
    ]);
  });

  test('invite à compléter la table des tarifs pour un modèle payant inconnu', () => {
    const sortie = new ConsoleEnMemoire();

    new EstimationDuCout(lesDependances(sortie)).rapporte(
      unReleveDeConsommationDeTokensCodex(
        RELEVE_CODEX,
        'fournisseur',
        'modele-inconnu'
      )
    );

    expect(sortie.lignes.map((l) => l.message).slice(3)).toEqual([
      '  Coût      : tarif inconnu pour « modele-inconnu » — compléter TARIFS dans outillage/src/cout/domaine/Tarifs.ts',
    ]);
  });

  test("signale un coût non calculable quand le scan n'a pas publié son relevé (run non terminé)", () => {
    const sortie = new ConsoleEnMemoire();

    new EstimationDuCout(lesDependances(sortie)).rapporte(
      unReleveDeConsommationDeTokensCodex(
        'Scan en cours…\n',
        'fournisseur',
        'modèle'
      )
    );

    expect(sortie.lignes.map((l) => l.message)).toEqual([
      '--- Coût estimé ---',
      '  tokens indisponibles (run non terminé ?) : coût non calculable',
    ]);
  });

  test('signale un coût non calculable quand le relevé de tokens est incomplet', () => {
    const sortie = new ConsoleEnMemoire();

    new EstimationDuCout(lesDependances(sortie)).rapporte(
      unReleveDeConsommationDeTokensCodex(
        '  TOKENS   12 uncached input, 3 output',
        'fournisseur',
        'modèle'
      )
    );

    expect(sortie.lignes.map((l) => l.message).at(-1)).toBe(
      '  tokens indisponibles (run non terminé ?) : coût non calculable'
    );
  });

  test('retient le dernier relevé complet, même si « TOKENS » est mentionné ensuite', () => {
    const sortie = new ConsoleEnMemoire();

    new EstimationDuCout(lesDependances(sortie)).rapporte(
      unReleveDeConsommationDeTokensCodex(
        `${RELEVE_CODEX}\nPlafond TOKENS atteint\n`,
        'fournisseur',
        'modèle'
      )
    );

    expect(sortie.lignes.map((l) => l.message)[2]).toBe(
      '  Tokens    : 1 126 328 entrée (dont 348 672 en cache), 31 639 sortie'
    );
  });

  test("estime le coût d'un pentest Shannon en sommant les tokens de tous ses agents", () => {
    const sortie = new ConsoleEnMemoire();

    new EstimationDuCout(lesDependances(sortie)).rapporte({
      entree: 1_000_000,
      cache: 0,
      sortie: 100_000,
      fournisseur: 'scaleway',
      modele: 'glm-5.2',
    });

    expect(sortie.lignes.map((l) => l.message)).toEqual([
      '--- Coût estimé ---',
      '  Modèle    : glm-5.2 (fournisseur scaleway)',
      '  Tokens    : 1 000 000 entrée (dont 0 en cache), 100 000 sortie',
      '  Coût      : ~2.35 € (tarif Scaleway : 1.8 €/M entrée, 5.5 €/M sortie)',
      "  Note      : estimation haute (cache compté au tarif d'entrée) ; à confronter au relevé du fournisseur.",
    ]);
  });
});
