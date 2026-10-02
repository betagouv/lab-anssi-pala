// Racine de composition : passage de fumée Shannon depuis la racine du dépôt.
import { join } from "node:path";
import { ConsoleNode } from "../noyau/adaptateurs/node/consoleNode.ts";
import { EnvironnementProcessus } from "../noyau/adaptateurs/node/EnvironnementProcessus.ts";
import { HorlogeSysteme } from "../noyau/adaptateurs/node/HorlogeSysteme.ts";
import { SystemeDeFichierNode } from "../noyau/adaptateurs/node/SystemeDeFichierNode.ts";
import { ServeurCibleFumeeHttp } from "../shannon/adaptateurs/ServeurCibleFumeeHttp.ts";
import { ShannonDirenv } from "../shannon/adaptateurs/ShannonDirenv.ts";
import { shannonSmoke } from "../shannon/cli/shannon-smoke.ts";

<<<<<<< Updated upstream
const racine = join(import.meta.dirname, "../../..");
const outil = join(racine, "outils/shannon");
=======
const racine = join(import.meta.dirname, '../../../..');
const outil = join(racine, 'outils/shannon');
>>>>>>> Stashed changes

process.exitCode = await shannonSmoke(process.argv.slice(2), {
  racine,
  shannon: new ShannonDirenv(outil),
  serveur: new ServeurCibleFumeeHttp(join(outil, "smoke-target")),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  horloge: new HorlogeSysteme(),
  environnement: new EnvironnementProcessus(),
  console: new ConsoleNode(),
});
