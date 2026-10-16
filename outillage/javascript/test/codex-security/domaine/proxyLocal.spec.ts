import { describe, expect, it } from 'vitest';
import { proxyEstLocal } from '../../../src/codex-security/domaine/proxyLocal.ts';

describe('proxyEstLocal', () => {
  it('considère une URL vide comme un proxy local (démarrage par défaut)', () => {
    expect(proxyEstLocal('')).toBe(true);
  });

  it('reconnaît les hôtes de boucle locale comme locaux', () => {
    expect(proxyEstLocal('http://127.0.0.1:4000')).toBe(true);
    expect(proxyEstLocal('http://localhost:4000')).toBe(true);
    expect(proxyEstLocal('http://[::1]:4000')).toBe(true);
  });

  it('considère un hôte distant comme non local', () => {
    expect(proxyEstLocal('https://pala-litellm.example.com')).toBe(false);
  });
});
