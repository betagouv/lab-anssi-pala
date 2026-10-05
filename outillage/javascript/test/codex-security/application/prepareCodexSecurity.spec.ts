import { describe, expect, test } from 'vitest';
import { CliCodexSecuritySimulee } from '../../doubles/CliCodexSecuritySimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { PrepareCodexSecurity } from '../../../src/codex-security/application/prepareCodexSecurity.ts';

describe('PrepareCodexSecurity', () => {
  test('installe la CLI Codex Security absente et annonce sa version', async () => {
    const cli = new CliCodexSecuritySimulee({ installee: false, version: '0.1.30' });
    const console = new ConsoleEnMemoire();

    await new PrepareCodexSecurity({ cli, console }).prepare();

    expect(cli.estInstallee()).toBe(true);
    expect(console.lignes.map((l) => l.message)).toEqual([
      '    installé : @openai/codex-security 0.1.30',
    ]);
  });

  test('ne réinstalle pas une CLI déjà présente', async () => {
    const cli = new CliCodexSecuritySimulee({ installee: true });
    const console = new ConsoleEnMemoire();

    await new PrepareCodexSecurity({ cli, console }).prepare();

    expect(cli.installations).toBe(0);
    expect(console.lignes).toEqual([]);
  });
});
