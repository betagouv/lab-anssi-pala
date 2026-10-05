// Racine de composition : génère l'environnement du proxy depuis la racine du dépôt.
import { join } from 'node:path';
import { GenerateurDeJetonAleatoire } from '../codex-security/adaptateurs/GenerateurDeJetonAleatoire.ts';
import { genereEnv } from '../codex-security/cli/generate-env.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { EnvironnementProcessus } from '../noyau/adaptateurs/node/EnvironnementProcessus.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';

process.exitCode = await genereEnv(process.argv.slice(2), {
  systemeDeFichier: new SystemeDeFichierNode(
    join(import.meta.dirname, '../../../..')
  ),
  generateurDeJeton: new GenerateurDeJetonAleatoire(),
  environnement: new EnvironnementProcessus(),
  console: new ConsoleNode(),
});
