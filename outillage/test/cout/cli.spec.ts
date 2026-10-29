import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../doubles/SystemeDeFichierEnMemoire.ts';
import { estimerCout } from '../../src/cout/cli.ts';

const SESSION = JSON.stringify({
  metrics: { agents: { recon: { total_input_tokens: 10, total_output_tokens: 5 } } },
});

describe('estimer-cout (ligne de commande)', () => {
  it('estime une session Shannon désignée par --shannon-session et --model-spec', async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      'session.json': SESSION,
    });
    const console = new ConsoleEnMemoire();

    const code = await estimerCout(
      [
        '--shannon-session',
        'session.json',
        '--model-spec',
        'albert:openai/gpt-oss-120b',
      ],
      { systemeDeFichier, console }
    );

    expect(code).toBe(0);
    expect(console.lignes.map((l) => l.message).slice(1, 3)).toEqual([
      '  Modèle    : openai/gpt-oss-120b (fournisseur albert)',
      '  Tokens    : 10 entrée (dont 0 en cache), 5 sortie',
    ]);
  });

  it('estime un log Codex désigné par --codex-log, --provider et --model', async () => {
    const releve =
      '  TOKENS   10 uncached input, 2 cache reads, 0 cache writes, 3 output, 15 total';
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      'scan.stdout.log': releve,
    });
    const console = new ConsoleEnMemoire();

    const code = await estimerCout(
      [
        '--codex-log',
        'scan.stdout.log',
        '--provider',
        'albert',
        '--model',
        'deepseek-v4-flash-albert',
      ],
      { systemeDeFichier, console }
    );

    expect(code).toBe(0);
    expect(console.lignes.map((l) => l.message).slice(1, 3)).toEqual([
      '  Modèle    : deepseek-v4-flash-albert (fournisseur albert)',
      '  Tokens    : 12 entrée (dont 2 en cache), 3 sortie',
    ]);
  });

  it("refuse de s'exécuter sans source de tokens (erreur d'usage, code 2)", async () => {
    const console = new ConsoleEnMemoire();

    const code = await estimerCout(['--provider', 'albert'], {
      systemeDeFichier: new SystemeDeFichierEnMemoire(),
      console,
    });

    expect(code).toBe(2);
    expect(console.erreurs.map((l) => l.message)[0]).toBe(
      'Erreur : fournir --codex-log ou --shannon-session'
    );
  });

  it("signale une option inconnue comme une erreur d'usage (code 2)", async () => {
    const console = new ConsoleEnMemoire();

    const code = await estimerCout(['--inconnue'], {
      systemeDeFichier: new SystemeDeFichierEnMemoire(),
      console,
    });

    expect(code).toBe(2);
    expect(console.erreurs.map((l) => l.message)[0]).toBe(
      "error: unknown option '--inconnue'"
    );
  });

  it('signale un fichier introuvable et sort en erreur (code 1)', async () => {
    const console = new ConsoleEnMemoire();

    const code = await estimerCout(['--codex-log', 'absent.log'], {
      systemeDeFichier: new SystemeDeFichierEnMemoire(),
      console,
    });

    expect(code).toBe(1);
    expect(console.erreurs.map((l) => l.message)).toEqual([
      'Fichier introuvable : absent.log',
    ]);
  });
});
