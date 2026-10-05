// Racine de composition : valide un finding avec Codex Security depuis la racine du dépôt.
import { join } from 'node:path';
import { CliCodexSecurityNpm } from '../codex-security/adaptateurs/CliCodexSecurityNpm.ts';
import { ValidationCodexSdk } from '../codex-security/adaptateurs/ValidationCodexSdk.ts';
import { validate } from '../codex-security/cli/validate.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { EnvironnementProcessus } from '../noyau/adaptateurs/node/EnvironnementProcessus.ts';
import { HorlogeSysteme } from '../noyau/adaptateurs/node/HorlogeSysteme.ts';
import { ReseauFetch } from '../noyau/adaptateurs/node/ReseauFetch.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';

const racine = join(import.meta.dirname, '../../../..');
const outil = join(racine, 'outils/codex-security');
// pnpm exécute depuis la racine du paquet mais garde le répertoire d'appel dans INIT_CWD.
const repertoireAppel = process.env.INIT_CWD || process.cwd();

process.exitCode = await validate(process.argv.slice(2), {
  racine,
  repertoireAppel,
  cli: new CliCodexSecurityNpm(outil, repertoireAppel),
  validation: new ValidationCodexSdk(outil),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  reseau: new ReseauFetch(5000),
  horloge: new HorlogeSysteme(),
  environnement: new EnvironnementProcessus({
    chemins: ['CODEX_TARGET', 'CODEX_CONFIG', 'CODEX_OUTPUT'],
    depuis: repertoireAppel,
  }),
  console: new ConsoleNode(),
});
