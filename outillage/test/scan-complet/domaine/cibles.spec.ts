import { describe, expect, it } from 'vitest';
import {
  ciblesDepuisJson,
  ciblesEnLigne,
  nomDepuisUrl,
} from '../../../src/scan-complet/domaine/cibles.ts';

describe('Cibles du scan complet', () => {
  describe('nomDepuisUrl', () => {
    it('dérive le nom du dépôt depuis une URL https avec .git', () => {
      expect(nomDepuisUrl('https://github.com/betagouv/mon-depot.git')).toBe(
        'mon-depot'
      );
    });

    it('dérive le nom sans suffixe .git', () => {
      expect(nomDepuisUrl('https://github.com/betagouv/mon-depot')).toBe(
        'mon-depot'
      );
    });

    it('ignore un slash final', () => {
      expect(nomDepuisUrl('https://github.com/betagouv/mon-depot/')).toBe(
        'mon-depot'
      );
    });

    it('gère la forme SSH', () => {
      expect(nomDepuisUrl('git@github.com:betagouv/mon-depot.git')).toBe(
        'mon-depot'
      );
    });

    it('rejette une URL sans nom de dépôt exploitable', () => {
      expect(() => nomDepuisUrl('   ')).toThrow();
    });
  });

  describe('ciblesEnLigne', () => {
    it('construit une cible par URL, nom dérivé et branche globale', () => {
      expect(ciblesEnLigne(['https://github.com/org/a.git'], 'main')).toEqual([
        { nom: 'a', url: 'https://github.com/org/a.git', branche: 'main' },
      ]);
    });

    it('rejette deux URLs dont les noms dérivés entrent en collision', () => {
      expect(() =>
        ciblesEnLigne([
          'https://github.com/org1/a.git',
          'https://github.com/org2/a.git',
        ])
      ).toThrow();
    });

    it('rejette une liste vide', () => {
      expect(() => ciblesEnLigne([])).toThrow();
    });
  });

  describe('ciblesDepuisJson', () => {
    it('parse un tableau d’URLs', () => {
      expect(
        ciblesDepuisJson(
          '["https://github.com/org/a.git", "https://github.com/org/b.git"]'
        )
      ).toEqual([
        { nom: 'a', url: 'https://github.com/org/a.git' },
        { nom: 'b', url: 'https://github.com/org/b.git' },
      ]);
    });

    it('applique la branche globale à toutes les cibles', () => {
      expect(
        ciblesDepuisJson('["https://github.com/org/a.git"]', 'develop')
      ).toEqual([
        { nom: 'a', url: 'https://github.com/org/a.git', branche: 'develop' },
      ]);
    });

    it('rejette un JSON invalide', () => {
      expect(() => ciblesDepuisJson('{pas du json')).toThrow();
    });

    it('rejette un JSON qui n’est pas un tableau', () => {
      expect(() => ciblesDepuisJson('{"url": "x"}')).toThrow();
    });

    it('rejette un tableau vide', () => {
      expect(() => ciblesDepuisJson('[]')).toThrow();
    });

    it('rejette une entrée non textuelle', () => {
      expect(() => ciblesDepuisJson('[123]')).toThrow();
    });
  });
});
