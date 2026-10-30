// Racine de composition : passage de fumée Shannon depuis la racine du dépôt.
import { join } from 'node:path';
import { ConsoleNode } from '../noyau/infrastructure/consoleNode.ts';
import { HorlogeSysteme } from '../noyau/infrastructure/HorlogeSysteme.ts';
import { SystemeDeFichierNode } from '../noyau/infrastructure/SystemeDeFichierNode.ts';
import { ServeurCibleFumeeHttp } from '../shannon/adaptateurs/ServeurCibleFumeeHttp.ts';
import { ShannonNode } from '../shannon/adaptateurs/ShannonNode.ts';
import { shannonSmoke } from '../shannon/cli/shannon-smoke.ts';

const racine = join(import.meta.dirname, '../../..');
const outil = join(racine, 'outils/shannon');

process.exitCode = await shannonSmoke(process.argv.slice(2), {
  racine,
  shannon: new ShannonNode(outil),
  serveur: new ServeurCibleFumeeHttp(join(outil, 'smoke-target')),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  horloge: new HorlogeSysteme(),
  console: new ConsoleNode(),
});
