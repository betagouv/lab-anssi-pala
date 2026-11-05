import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import {
  ConfigurationProxyLiteLLM,
  type EnvironnementProxyLiteLLM,
} from '../../../src/codex-security/domaine/ConfigurationProxyLiteLLM.ts';
import { environnement } from '../../../src/noyau/environnement.ts';

const yamlParse = (config: ConfigurationProxyLiteLLM) => parse(config.versYaml());

const unEnvironnemenProxyLiteLLM = (
  double: Partial<ReturnType<typeof environnement.pourProxyLiteLLM>> = {}
): EnvironnementProxyLiteLLM => ({
  cellar: () => ({
    credentials: { accessKeyId: 'access-key', secretAccessKey: 'secret-key' },
    nomDuBucket: 'nom-du-bucket',
    region: 'region',
    url: 'url',
  }),
  cheminFichierDeConfiguration: '/chemin/config.yaml',
  configuration: () => ({
    modele: 'deepseek-v4-flash-0731',
    coutEntreeParToken: 0.0000004,
    coutSortieParToken: 0.0000008,
    ...(double?.configuration && { ...double.configuration() }),
  }),
  ...(double?.cheminFichierDeConfiguration && {
    cheminFichierDeConfiguration: double.cheminFichierDeConfiguration,
  }),
});

describe('Configuration Proxy LiteLLM', () => {
  it('rend un model_list d’une seule entrée, nommée par le modèle donné', () => {
    const lu = yamlParse(
      new ConfigurationProxyLiteLLM(
        unEnvironnemenProxyLiteLLM({
          configuration: () => ({
            modele: 'deepseek-v4-flash-0731',
            coutEntreeParToken: 0.0000004,
            coutSortieParToken: 0.0000008,
          }),
        })
      )
    );

    expect(lu.model_list).toHaveLength(1);
    expect(lu.model_list[0].model_name).toBe('deepseek-v4-flash-0731');
  });

  it('préfixe le modèle amont par hosted_vllm/ (envoyé tel quel au fournisseur)', () => {
    const lu = yamlParse(
      new ConfigurationProxyLiteLLM(
        unEnvironnemenProxyLiteLLM({
          configuration: () => ({
            modele: 'openai/gpt-oss-120b',
            coutEntreeParToken: 0,
            coutSortieParToken: 0,
          }),
        })
      )
    );

    expect(lu.model_list[0].litellm_params.model).toBe(
      'hosted_vllm/openai/gpt-oss-120b'
    );
  });

  it('renseigne les constantes du proxy : api_base/api_key via os.environ, chat completions, timeout', () => {
    const lu = yamlParse(
      new ConfigurationProxyLiteLLM(
        unEnvironnemenProxyLiteLLM({
          configuration: () => ({
            modele: 'openai/gpt-oss-120b',
            coutEntreeParToken: 0,
            coutSortieParToken: 0,
          }),
        })
      )
    );

    const params = lu.model_list[0].litellm_params;
    expect(params.api_base).toBe('os.environ/FOURNISSEUR_BASE_URL');
    expect(params.api_key).toBe('os.environ/FOURNISSEUR_API_KEY');
    expect(params.use_chat_completions_api).toBe(true);
    expect(params.timeout).toBe(600);
  });

  it('porte les coûts par token du fournisseur (pour le budget)', () => {
    const lu = yamlParse(
      new ConfigurationProxyLiteLLM(
        unEnvironnemenProxyLiteLLM({
          configuration: () => ({
            modele: 'deepseek-v4-flash-0731',
            coutEntreeParToken: 0.0000004,
            coutSortieParToken: 0.0000008,
          }),
        })
      )
    );

    const params = lu.model_list[0].litellm_params;
    expect(params.input_cost_per_token).toBe(0.0000004);
    expect(params.output_cost_per_token).toBe(0.0000008);
  });

  it('conserve litellm_settings tel quel (callback, budget)', () => {
    const lu = yamlParse(
      new ConfigurationProxyLiteLLM(
        unEnvironnemenProxyLiteLLM({
          configuration: () => ({
            modele: 'deepseek-v4-flash-0731',
            coutEntreeParToken: 0,
            coutSortieParToken: 0,
          }),
        })
      )
    );

    expect(lu.litellm_settings).toEqual({
      callbacks: 'json_schema_to_object.json_schema_vers_objet',
      max_budget: 10,
      budget_duration: '30d',
    });
  });

  it('émet les paramètres d’échantillonnage et tool_choice quand ils sont fournis', () => {
    const lu = yamlParse(
      new ConfigurationProxyLiteLLM(
        unEnvironnemenProxyLiteLLM({
          configuration: () => ({
            modele: 'deepseek-v4-flash-0731',
            coutEntreeParToken: 0,
            coutSortieParToken: 0,
            maxTokens: 16384,
            temperature: 1,
            topP: 1,
            presencePenalty: 0,
            toolChoice: 'auto',
          }),
        })
      )
    );

    const params = lu.model_list[0].litellm_params;
    expect(params.max_tokens).toBe(16384);
    expect(params.temperature).toBe(1);
    expect(params.top_p).toBe(1);
    expect(params.presence_penalty).toBe(0);
    expect(params.tool_choice).toBe('auto');
  });

  it('omet les clés optionnelles absentes', () => {
    const lu = yamlParse(
      new ConfigurationProxyLiteLLM(
        unEnvironnemenProxyLiteLLM({
          configuration: () => ({
            modele: 'deepseek-v4-flash-0731',
            coutEntreeParToken: 0,
            coutSortieParToken: 0,
          }),
        })
      )
    );

    const params = lu.model_list[0].litellm_params;
    expect(params).not.toHaveProperty('max_tokens');
    expect(params).not.toHaveProperty('temperature');
    expect(params).not.toHaveProperty('top_p');
    expect(params).not.toHaveProperty('presence_penalty');
    expect(params).not.toHaveProperty('tool_choice');
  });

  it('porte un en-tête annonçant un fichier généré', () => {
    const yaml = new ConfigurationProxyLiteLLM(
      unEnvironnemenProxyLiteLLM({
        configuration: () => ({
          modele: 'deepseek-v4-flash-0731',
          coutEntreeParToken: 0,
          coutSortieParToken: 0,
        }),
      })
    ).versYaml();

    expect(yaml).toMatch(/généré/i);
    expect(yaml).toMatch(/ne pas éditer/i);
  });
});
