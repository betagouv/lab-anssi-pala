// Racine de composition : lance un pentest Shannon depuis la racine du dépôt.
import { join } from 'node:path';
import { EstimationDuCout } from '../cout/application/estimationDuCout.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { HorlogeSysteme } from '../noyau/adaptateurs/node/HorlogeSysteme.ts';
import { ReseauFetch } from '../noyau/adaptateurs/node/ReseauFetch.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';
import { ShannonNode } from '../shannon/adaptateurs/ShannonNode.ts';
import { shannon } from '../shannon/cli/shannon.ts';

const racine = join(import.meta.dirname, '../../../..');
const console = new ConsoleNode();
const systemeDeFichier = new SystemeDeFichierNode(racine);

process.exitCode = await shannon(process.argv.slice(2), {
  racine,
  // pnpm exécute depuis la racine du paquet mais garde le répertoire d'appel dans INIT_CWD.
  repertoireAppel: process.env.INIT_CWD || process.cwd(),
  shannon: new ShannonNode(join(racine, 'outils/shannon')),
  systemeDeFichier,
  reseau: new ReseauFetch(5000),
  horloge: new HorlogeSysteme(),
  estimation: new EstimationDuCout({ console }),
  console,
});
