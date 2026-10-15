import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { ConfigurationCible } from '../../../src/codex-security/domaine/ConfigurationCible.ts';

const yamlParse = (config: ConfigurationCible) => parse(config.versYaml());

describe('Configuration Cible', () => {
  it('porte le modèle et le fournisseur donnés', () => {
    const lu = yamlParse(
      new ConfigurationCible({
        modele: 'deepseek-v4-flash-0731',
        fournisseur: 'albert',
        portProxy: 4000,
        chemins: ['src'],
      })
    );

    expect(lu.codex.model).toBe('deepseek-v4-flash-0731');
    expect(lu.codex.model_provider).toBe('albert');
  });

  it('rend le périmètre à scanner dans scan.scope.paths', () => {
    const lu = yamlParse(
      new ConfigurationCible({
        modele: 'deepseek-v4-flash-0731',
        fournisseur: 'albert',
        portProxy: 4000,
        chemins: ['src/noyau', 'src/codex-security'],
      })
    );

    expect(lu.scan.scope.paths).toEqual(['src/noyau', 'src/codex-security']);
  });

  it('déclare le fournisseur, pointé vers le proxy LiteLLM local', () => {
    const lu = yamlParse(
      new ConfigurationCible({
        modele: 'deepseek-v4-flash-0731',
        fournisseur: 'albert',
        portProxy: 4010,
        chemins: ['src'],
      })
    );

    expect(lu.codex.model_providers.albert).toEqual({
      name: 'albert via LiteLLM',
      base_url: 'http://127.0.0.1:4010/v1',
      env_key: 'LITELLM_API_KEY',
      wire_api: 'responses',
    });
  });

  it('rend une configuration de projet Codex complète et valide', () => {
    const lu = yamlParse(
      new ConfigurationCible({
        modele: 'deepseek-v4-flash-0731',
        fournisseur: 'albert',
        portProxy: 4000,
        chemins: ['src'],
      })
    );

    expect(lu).toEqual({
      auth: 'api-key',
      scan: { mode: 'standard', scope: { paths: ['src'] } },
      codex: {
        model: 'deepseek-v4-flash-0731',
        model_provider: 'albert',
        model_reasoning_effort: 'high',
        model_reasoning_summary: 'none',
        model_context_window: 131072,
        approval_policy: 'never',
        analytics: { enabled: false },
        model_providers: {
          albert: {
            name: 'albert via LiteLLM',
            base_url: 'http://127.0.0.1:4000/v1',
            env_key: 'LITELLM_API_KEY',
            wire_api: 'responses',
          },
        },
      },
    });
  });

  it('porte l’en-tête de schéma pour la validation dans l’éditeur', () => {
    const yaml = new ConfigurationCible({
      modele: 'deepseek-v4-flash-0731',
      fournisseur: 'albert',
      portProxy: 4000,
      chemins: ['src'],
    }).versYaml();

    expect(yaml).toContain('# yaml-language-server: $schema=');
  });
});
