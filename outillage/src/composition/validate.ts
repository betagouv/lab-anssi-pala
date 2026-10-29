import { join } from 'node:path';
import { ScannerCodexSecurityNpm } from '../codex-security/adaptateurs/ScannerCodexSecurityNpm.ts';
import { ValidationCodexSdk } from '../codex-security/adaptateurs/ValidationCodexSdk.ts';
import { validate } from '../codex-security/cli/validate.ts';
import { AttenteTemporisee } from '../noyau/adaptateurs/node/AttenteTemporisee.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { HorlogeSysteme } from '../noyau/adaptateurs/node/HorlogeSysteme.ts';
import { ReseauFetch } from '../noyau/adaptateurs/node/ReseauFetch.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';

const racine = join(import.meta.dirname, '../../..');
const outil = join(racine, 'outils/codex-security');
const repertoireAppel = process.env.INIT_CWD || process.cwd();

process.exitCode = await validate(process.argv.slice(2), {
  racine,
  repertoireAppel,
  scanner: new ScannerCodexSecurityNpm(outil, repertoireAppel),
  validation: new ValidationCodexSdk(outil),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  reseau: new ReseauFetch(5000),
  attente: new AttenteTemporisee(),
  horloge: new HorlogeSysteme(),
  console: new ConsoleNode(),
});
