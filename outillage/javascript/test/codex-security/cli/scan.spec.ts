import { describe, expect, it } from 'vitest';
import { ScannerCodexSecuritySimulee } from '../../doubles/ScannerCodexSecuritySimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EstimationDuCoutSimulee } from '../../doubles/EstimationDuCoutSimulee.ts';
import { HorlogeFigee } from '../../doubles/HorlogeFigee.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { scan } from '../../../src/codex-security/cli/scan.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import { ENVIRONNEMENT_CODEX_SECURITY } from '../../doubles/environnement.ts';

describe('scan (ligne de commande)', () => {
  it('fournit la cible et transmet ses options par défaut à codex-security scan', async () => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
    });
    const cli = new ScannerCodexSecuritySimulee({ statutDuScan: 42 });
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      'outils/codex-security/codex-security.env':
        'LITELLM_MASTER_KEY=sk-local-jeton\n',
    });
    systemeDeFichier.creeDossier('/depot/cible/copies/cible');

    const code = await scan(['--cible', '/depot/cible/copies/cible'], {
      racine: '/depot',
      scanner: cli,
      systemeDeFichier,
      reseau: new ReseauSimule(),
      horloge: new HorlogeFigee(new Date(2026, 8, 30)),
      estimation: new EstimationDuCoutSimulee(),
      console: new ConsoleEnMemoire(),
    });

    expect(code).toBe(42);
    expect(cli.scans[0].options).toEqual([
      '--verbose',
      '--scan-prompt-file',
      `/depot/outils/codex-security/configs/consignes-scan.md`,
    ]);
  });

  it('transmet ses options à codex-security scan et sort avec le statut du scan', async () => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
    });
    const cli = new ScannerCodexSecuritySimulee({ statutDuScan: 42 });
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      'outils/codex-security/codex-security.env':
        'LITELLM_MASTER_KEY=sk-local-jeton\n',
    });
    systemeDeFichier.creeDossier('/depot/cible/copies/cible');

    const code = await scan(
      [
        '--verbose',
        '--dry-run',
        '--scan-prompt-file',
        'consignes.md',
        '--cible',
        '/depot/cible/copies/cible',
      ],
      {
        racine: '/depot',
        scanner: cli,
        systemeDeFichier,
        reseau: new ReseauSimule(),
        horloge: new HorlogeFigee(new Date(2026, 8, 30)),
        estimation: new EstimationDuCoutSimulee(),
        console: new ConsoleEnMemoire(),
      }
    );

    expect(code).toBe(42);
    expect(cli.scans[0].options).toEqual([
      '--verbose',
      '--dry-run',
      '--scan-prompt-file',
      'consignes.md',
    ]);
  });
});
