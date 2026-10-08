// Racine de composition : branche le bootstrap sur le système réel, depuis la racine du dépôt.
import { join } from 'node:path';
import { GitEnLigneDeCommande } from '../bootstrap/adaptateurs/GitEnLigneDeCommande.ts';
import { bootstrap } from '../bootstrap/cli.ts';
import { ScannerCodexSecurityNpm } from '../codex-security/adaptateurs/ScannerCodexSecurityNpm.ts';
import { PrepareCodexSecurity } from '../codex-security/application/prepareCodexSecurity.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';
import { DepotShannonGit } from '../shannon/adaptateurs/DepotShannonGit.ts';
import { PrepareShannon } from '../shannon/application/prepareShannon.ts';

const racine = join(import.meta.dirname, '../../../..');
const console = new ConsoleNode();

process.exitCode = await bootstrap(process.argv.slice(2), {
  git: new GitEnLigneDeCommande(racine),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  console,
  outils: [
    new PrepareCodexSecurity({
      cli: new ScannerCodexSecurityNpm(join(racine, 'outils/codex-security')),
      console,
    }),
    new PrepareShannon({
      depot: new DepotShannonGit(join(racine, 'outils/shannon')),
      console,
    }),
  ],
});
