// Racine de composition : branche l'estimation de coût sur le système réel.
import { estimerCout } from '../cout/cli.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';

process.exitCode = await estimerCout(process.argv.slice(2), {
  systemeDeFichier: new SystemeDeFichierNode(),
  console: new ConsoleNode(),
});
