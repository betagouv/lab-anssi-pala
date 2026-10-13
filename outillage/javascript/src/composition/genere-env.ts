import { join } from 'node:path';
import { GenerateurDeJetonAleatoire } from '../codex-security/adaptateurs/GenerateurDeJetonAleatoire.ts';
import { genereEnv } from '../environnement/cli/genere-env.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';

process.exitCode = await genereEnv(process.argv.slice(2), {
  systemeDeFichier: new SystemeDeFichierNode(
    join(import.meta.dirname, '../../../..')
  ),
  generateurDeJeton: new GenerateurDeJetonAleatoire(),
  console: new ConsoleNode(),
});
