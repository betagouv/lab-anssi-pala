// Racine de composition : branche le bootstrap sur le système réel, depuis la racine du dépôt.
import { join } from 'node:path';
import { bootstrap } from '../bootstrap/cli.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { lesDependancesPourLaPreparationEnvironnement } from './dependances.ts';

const racine = join(import.meta.dirname, '../../../..');
const console = new ConsoleNode();

process.exitCode = await bootstrap(
  process.argv.slice(2),
  lesDependancesPourLaPreparationEnvironnement({ racine, console })
);
