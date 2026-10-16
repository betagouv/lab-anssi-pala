import { join } from 'node:path';
import { genereEnv } from '../environnement/cli/genere-env.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';

process.exitCode = await genereEnv(process.argv.slice(2), {
  systemeDeFichier: new SystemeDeFichierNode(
    join(import.meta.dirname, '../../../..')
  ),
  console: new ConsoleNode(),
});
