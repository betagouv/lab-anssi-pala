import { describe, expect, it } from 'vitest';
import { cheminConfigCible } from '../../../src/codex-security/domaine/cheminConfig.ts';

describe('Chemin de config ciblée', () => {
  it('génère un chemin distinct par cible, sous le dossier des configs', () => {
    expect(cheminConfigCible('mon-projet')).toBe(
      'outils/codex-security/configs/config-mon-projet.yaml'
    );
    expect(cheminConfigCible('autre-projet')).toBe(
      'outils/codex-security/configs/config-autre-projet.yaml'
    );
  });
});
