import { describe, expect, it } from 'vitest';
import { ConfigScan } from '../../../src/codex-security/domaine/ConfigScan.ts';
import { ConfigurationCible } from '../../../src/codex-security/domaine/ConfigurationCible.ts';

const configCiblee = (chemins: string[]) =>
  new ConfigurationCible({
    modele: 'deepseek-v4-flash-0731',
    fournisseur: 'albert',
    urlProxy: 'http://127.0.0.1:4000',
    chemins,
  }).versYaml();

// Config par défaut (pnpm scan) : pas de scan.scope, le dépôt entier est scanné.
const CONFIG_SANS_SCOPE =
  'auth: api-key\nscan:\n  mode: standard\ncodex:\n  model: glm-5.2\n  model_provider: scaleway\n';

describe('Config Scan', () => {
  it('lit le modèle et le fournisseur du bloc codex', () => {
    const config = ConfigScan.depuisYaml(CONFIG_SANS_SCOPE);

    expect(config.modele).toBe('glm-5.2');
    expect(config.fournisseur).toBe('scaleway');
  });

  it('porte un périmètre non vide quand des chemins sont listés', () => {
    const config = ConfigScan.depuisYaml(configCiblee(['src/noyau']));

    expect(config.perimetre.estVide()).toBe(false);
  });

  it('porte un périmètre vide quand scan.scope.paths est présent mais vide', () => {
    const config = ConfigScan.depuisYaml(configCiblee([]));

    expect(config.perimetre.estVide()).toBe(true);
  });

  it('porte un périmètre non contraignant quand scan.scope.paths est absent', () => {
    const config = ConfigScan.depuisYaml(CONFIG_SANS_SCOPE);

    expect(config.perimetre.estVide()).toBe(false);
  });

  it('expose une config inconnue, non contraignante, quand elle n’a pu être lue', () => {
    const config = ConfigScan.inconnue();

    expect(config.perimetre.estVide()).toBe(false);
    expect(config.modele).toBe('');
    expect(config.fournisseur).toBe('');
  });
});
