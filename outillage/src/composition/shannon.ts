// Racine de composition : lance un pentest Shannon depuis la racine du dépôt.
import { join } from "node:path";
import { EstimeCout } from "../cout/application/EstimeCout.ts";
import { ConsoleNode } from "../noyau/adaptateurs/node/ConsoleNode.ts";
import { EnvironnementProcessus } from "../noyau/adaptateurs/node/EnvironnementProcessus.ts";
import { HorlogeSysteme } from "../noyau/adaptateurs/node/HorlogeSysteme.ts";
import { ReseauFetch } from "../noyau/adaptateurs/node/ReseauFetch.ts";
import { SystemeDeFichierNode } from "../noyau/adaptateurs/node/SystemeDeFichierNode.ts";
import { ShannonDirenv } from "../shannon/adaptateurs/ShannonDirenv.ts";
import { shannon } from "../shannon/cli/shannon.ts";

const racine = join(import.meta.dirname, "../../..");
const console = new ConsoleNode();
const systemeDeFichier = new SystemeDeFichierNode(racine);

process.exitCode = await shannon(process.argv.slice(2), {
  racine,
  // pnpm exécute depuis la racine du paquet mais garde le répertoire d'appel dans INIT_CWD.
  repertoireAppel: process.env.INIT_CWD || process.cwd(),
  shannon: new ShannonDirenv(join(racine, "outils/shannon")),
  systemeDeFichier,
  reseau: new ReseauFetch(5000),
  horloge: new HorlogeSysteme(),
  environnement: new EnvironnementProcessus(),
  estimation: new EstimeCout({ systemeDeFichier, console }),
  console,
});
