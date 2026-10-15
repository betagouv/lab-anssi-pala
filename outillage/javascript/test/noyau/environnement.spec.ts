import { describe, expect, it } from 'vitest';
import { SystemeDeFichierEnMemoire } from '../doubles/SystemeDeFichierEnMemoire.ts';
import { environnement } from '../../src/noyau/environnement.ts';
import { CHEMIN_FICHIER_ENV_CODEX } from '../../src/codex-security/domaine/cheminEnvironnement.ts';

const codexEnv = (contenu: string) =>
  new SystemeDeFichierEnMemoire({ [CHEMIN_FICHIER_ENV_CODEX]: contenu });

describe('environnement — proxy LiteLLM', () => {
  it('par défaut, cible le proxy local sur le port LiteLLM', () => {
    const proxy = environnement
      .pourCodexSecurity()
      .proxy(codexEnv('LITELLM_API_KEY=sk-x\nPORT_LITE_LLM=4010\n'));

    expect(proxy.urlLiteLLM).toBe('http://127.0.0.1:4010');
  });

  it('cible le proxy distant quand LITELLM_BASE_URL est défini (sans slash final)', () => {
    const proxy = environnement
      .pourCodexSecurity()
      .proxy(codexEnv('LITELLM_BASE_URL=https://litellm.local/\n'));

    expect(proxy.urlLiteLLM).toBe('https://litellm.local');
  });
});
