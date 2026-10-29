import type { PreparationOutil } from '../../bootstrap/domaine/PreparationOutil.ts';
import type { Console } from '../../noyau/ports/Console.ts';
import type { ScannerCodexSecurity } from '../ports/ScannerCodexSecurity.ts';

export class PrepareCodexSecurity implements PreparationOutil {
  readonly nom = 'codex-security';
  readonly #cli: ScannerCodexSecurity;
  readonly #console: Console;

  constructor({ cli, console }: { cli: ScannerCodexSecurity; console: Console }) {
    this.#cli = cli;
    this.#console = console;
  }

  async prepare(): Promise<void> {
    if (this.#cli.estInstallee()) return;
    await this.#cli.installe();
    this.#console.aLaLigne(
      `    installé : @openai/codex-security ${this.#cli.version()}`,
      'VERT'
    );
  }
}
