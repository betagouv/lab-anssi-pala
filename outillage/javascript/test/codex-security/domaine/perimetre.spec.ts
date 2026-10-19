import { describe, expect, it } from 'vitest';
import { Perimetre } from '../../../src/codex-security/domaine/Perimetre.ts';

describe('Périmètre', () => {
  it("n'est pas vide quand des chemins sont à scanner", () => {
    expect(Perimetre.deChemins(['src/noyau', 'src/codex-security']).estVide()).toBe(
      false
    );
  });

  it('est vide quand le périmètre est défini mais ne contient aucun chemin', () => {
    expect(Perimetre.deChemins([]).estVide()).toBe(true);
  });

  it("n'est pas contraignant quand aucun périmètre n'est défini", () => {
    expect(Perimetre.nonContraignant().estVide()).toBe(false);
  });
});
