import { describe, expect, test } from 'vitest';
import { CliCodexSecuritySimulee } from '../../doubles/CliCodexSecuritySimulee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EnvironnementEnMemoire } from '../../doubles/EnvironnementEnMemoire.ts';
import { EstimationDuCoutSimulee } from '../../doubles/EstimationDuCoutSimulee.ts';
import { HorlogeFigee } from '../../doubles/HorlogeFigee.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import { scan } from '../../../src/codex-security/cli/scan.ts';

describe('scan (ligne de commande)', () => {
  test('transmet ses options telles quelles à codex-security scan et sort avec le statut du scan', async () => {
    const cli = new CliCodexSecuritySimulee({ statutDuScan: 3 });
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      'outils/codex-security/codex-security.env':
        'LITELLM_MASTER_KEY=sk-local-jeton\n',
    });
    systemeDeFichier.creeDossier('/depot/cible/copies/app');

    const code = await scan(
      ['--verbose', '--dry-run', '--scan-prompt-file', 'consignes.md'],
      {
        racine: '/depot',
        cli,
        systemeDeFichier,
        reseau: new ReseauSimule(),
        horloge: new HorlogeFigee(new Date(2026, 8, 30)),
        environnement: new EnvironnementEnMemoire({
          CODEX_TARGET: '/depot/cible/copies/app',
        }),
        estimation: new EstimationDuCoutSimulee(),
        console: new ConsoleEnMemoire(),
      }
    );

    expect(code).toBe(3);
    expect(cli.scans[0].options).toEqual([
      '--verbose',
      '--dry-run',
      '--scan-prompt-file',
      'consignes.md',
    ]);
  });

  test('affiche sa propre aide, avec les options ajoutées par défaut, sans lancer de scan', async () => {
    const cli = new CliCodexSecuritySimulee();
    const console = new ConsoleEnMemoire();

    const code = await scan(['--help'], {
      racine: '/depot',
      cli,
      systemeDeFichier: new SystemeDeFichierEnMemoire(),
      reseau: new ReseauSimule(),
      horloge: new HorlogeFigee(new Date(2026, 8, 30)),
      environnement: new EnvironnementEnMemoire(),
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
