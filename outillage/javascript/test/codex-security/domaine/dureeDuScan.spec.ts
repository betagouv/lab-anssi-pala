import { describe, expect, it } from 'vitest';
import { extraitLaDuree } from '../../../src/codex-security/domaine/dureeDuScan.ts';

const unManifeste = (scan: Record<string, unknown>) =>
  JSON.stringify({ documentType: 'codex-security.scan-manifest', scan });

describe('Durée du scan', () => {
  it("est l'écart en millisecondes entre le début et la fin du scan du manifeste", () => {
    const manifeste = unManifeste({
      startedAt: '2026-10-13T08:27:07.699821Z',
      completedAt: '2026-10-13T08:28:37.699821Z',
    });

    expect(extraitLaDuree(manifeste)).toBe(90_000);
  });
});
