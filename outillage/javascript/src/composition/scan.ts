// Racine de composition : lance un scan Codex Security depuis la racine du dépôt.
import { join } from 'node:path';
import { CliCodexSecurityNpm } from '../codex-security/adaptateurs/CliCodexSecurityNpm.ts';
import { scan } from '../codex-security/cli/scan.ts';
import { EstimationDuCout } from '../cout/application/estimationDuCout.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { HorlogeSysteme } from '../noyau/adaptateurs/node/HorlogeSysteme.ts';
import { ReseauFetch } from '../noyau/adaptateurs/node/ReseauFetch.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';

const racine = join(import.meta.dirname, '../../../..');
// pnpm exécute depuis la racine du paquet mais garde le répertoire d'appel dans INIT_CWD.
const repertoireAppel = process.env.INIT_CWD || process.cwd();
const console = new ConsoleNode();
const systemeDeFichier = new SystemeDeFichierNode(racine);

process.exitCode = await scan(process.argv.slice(2), {
  racine,
  cli: new CliCodexSecurityNpm(
    join(racine, 'outils/codex-security'),
    repertoireAppel
  ),
  systemeDeFichier,
  reseau: new ReseauFetch(5000),
  horloge: new HorlogeSysteme(),
  estimation: new EstimationDuCout({ console }),
  console,
});
