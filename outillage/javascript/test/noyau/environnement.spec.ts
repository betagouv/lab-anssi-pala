import { afterEach, describe, expect, it } from 'vitest';
import { environnement } from '../../src/noyau/environnement.ts';

const urlInitiale = process.env.LITELLM_BASE_URL;

afterEach(() => {
  if (urlInitiale === undefined) delete process.env.LITELLM_BASE_URL;
  else process.env.LITELLM_BASE_URL = urlInitiale;
});

describe('environnement — URL du proxy LiteLLM', () => {
  it('rend l’URL configurée dans le .env racine (LITELLM_BASE_URL)', () => {
    process.env.LITELLM_BASE_URL = 'https://litellm.local';

    expect(environnement.urlLiteLLMConfiguree()).toBe('https://litellm.local');
  });

  it('normalise le slash final', () => {
    process.env.LITELLM_BASE_URL = 'http://127.0.0.1:4000/';

    expect(environnement.urlLiteLLMConfiguree()).toBe('http://127.0.0.1:4000');
  });

  it('rend une chaîne vide quand LITELLM_BASE_URL est absente', () => {
    delete process.env.LITELLM_BASE_URL;

    expect(environnement.urlLiteLLMConfiguree()).toBe('');
  });
});
