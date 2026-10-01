// Racine de composition : branche le bootstrap sur le système réel, depuis la racine du dépôt.
import { join } from "node:path";
import { GitEnLigneDeCommande } from "../bootstrap/adaptateurs/GitEnLigneDeCommande.ts";
import { bootstrap } from "../bootstrap/cli.ts";
import { CliCodexSecurityNpm } from "../codex-security/adaptateurs/CliCodexSecurityNpm.ts";
import { PrepareCodexSecurity } from "../codex-security/application/PrepareCodexSecurity.ts";
import { ConsoleNode } from "../noyau/adaptateurs/node/ConsoleNode.ts";
import { SystemeDeFichierNode } from "../noyau/adaptateurs/node/SystemeDeFichierNode.ts";
import { DepotShannonGit } from "../shannon/adaptateurs/DepotShannonGit.ts";
import { PrepareShannon } from "../shannon/application/PrepareShannon.ts";

<<<<<<< Updated upstream
const racine = join(import.meta.dirname, "../../..");
=======
const racine = join(import.meta.dirname, '../../../..');
>>>>>>> Stashed changes
const console = new ConsoleNode();

process.exitCode = await bootstrap(process.argv.slice(2), {
  git: new GitEnLigneDeCommande(racine),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  console,
  outils: [
    new PrepareCodexSecurity({ cli: new CliCodexSecurityNpm(join(racine, "outils/codex-security")), console }),
    new PrepareShannon({ depot: new DepotShannonGit(join(racine, "outils/shannon")), console }),
  ],
});
