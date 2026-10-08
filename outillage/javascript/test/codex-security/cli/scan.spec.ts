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
  it('transmet ses options telles quelles à codex-security scan et sort avec le statut du scan', async () => {
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      cible: '/depot/cible/copies/app',
    });
    const cli = new ScannerCodexSecuritySimulee({ statutDuScan: 42 });
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      'outils/codex-security/codex-security.env':
        'LITELLM_MASTER_KEY=sk-local-jeton\n',
    });
    systemeDeFichier.creeDossier('/depot/cible/copies/app');

    const code = await scan(
      ['--verbose', '--dry-run', '--scan-prompt-file', 'consignes.md'],
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

  it('affiche sa propre aide, avec les options ajoutées par défaut, sans lancer de scan', async () => {
    const cli = new ScannerCodexSecuritySimulee();
    const console = new ConsoleEnMemoire();

    const code = await scan(['--help'], {
      racine: '/depot',
      scanner: cli,
      systemeDeFichier: new SystemeDeFichierEnMemoire(),
      reseau: new ReseauSimule(),
      horloge: new HorlogeFigee(new Date(2026, 8, 30)),
      estimation: new EstimationDuCoutSimulee(),
      console,
    });

    expect(code).toBe(0);
    expect(cli.scans).toEqual([]);
    expect(console.lignes.map((l) => l.message)).toEqual(
      expect.arrayContaining([
        '  --scan-prompt-file outils/codex-security/configs/consignes-scan.md',
        '  --verbose',
      ])
    );
  });
});
