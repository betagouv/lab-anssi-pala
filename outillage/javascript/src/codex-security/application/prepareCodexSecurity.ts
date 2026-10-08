// Préparation propre à Codex Security, appelée par le bootstrap : installe la CLI publiée sur npm.
// Portage TS de outils/codex-security/bootstrap.sh.
import type { PreparationOutil } from '../../bootstrap/domaine/PreparationOutil.ts';
import type { Console } from '../../noyau/ports/Console.ts';
import type { ScannerCodexSecurity } from '../ports/ScannerCodexSecurity.ts';

export class PrepareCodexSecurity implements PreparationOutil {
  readonly nom = 'codex-security';
  readonly fichierEnvironnement = 'outils/codex-security/codex-security.env';
  readonly #cli: ScannerCodexSecurity;
  readonly #console: Console;

  constructor({ cli, console }: { cli: ScannerCodexSecurity; console: Console }) {
    this.#cli = cli;
    this.#console = console;
  }

  // Idempotent : une CLI déjà installée est laissée telle quelle.
  async prepare(): Promise<void> {
    if (this.#cli.estInstallee()) return;
    await this.#cli.installe();
    this.#console.aLaLigne(
      `    installé : @openai/codex-security ${this.#cli.version()}`,
      'VERT'
    );
  }
}
