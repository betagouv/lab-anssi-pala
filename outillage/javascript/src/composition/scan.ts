import { join } from 'node:path';
import { ScannerCodexSecurityNpm } from '../codex-security/adaptateurs/ScannerCodexSecurityNpm.ts';
import { scan } from '../codex-security/cli/scan.ts';
import { EstimationDuCout } from '../cout/application/estimationDuCout.ts';
import { BusEvenementsPALA } from '../noyau/adaptateurs/node/busEvenementsPALA.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { HorlogeSysteme } from '../noyau/adaptateurs/node/HorlogeSysteme.ts';
import { ReseauFetch } from '../noyau/adaptateurs/node/ReseauFetch.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';
import type { ScanTermine } from '../codex-security/domaine/scanTermine.ts';
import { MessagerieMattermost } from '../messagerie/adaptateurs/messagerieMattermost.ts';
import { ApiHTTPFetch } from '../noyau/adaptateurs/node/apiHTTPFetch.ts';

const racine = join(import.meta.dirname, '../../../..');
const repertoireAppel = process.env.INIT_CWD || process.cwd();
const console = new ConsoleNode();
const systemeDeFichier = new SystemeDeFichierNode(racine);
const busEvenementsPALA = new BusEvenementsPALA();

busEvenementsPALA.sabonne<ScanTermine>('SCAN_TERMINÉ', async (evenement) => {
  const messagerie = new MessagerieMattermost(new ApiHTTPFetch());

  const message = `### ${evenement.resultat === 'Succès' ? '✅' : '❌'} Scan terminé
  **Cible :** ${evenement.cible}
  **Coût :** ${evenement.cout.type === 'estimé' ? evenement.cout.montantEnEuros.toFixed(2) : 0}€
  `;
  await messagerie.envoyer({ contenu: message });
});

process.exitCode = await scan(process.argv.slice(2), {
  racine,
  scanner: new ScannerCodexSecurityNpm(
    join(racine, 'outils/codex-security'),
    repertoireAppel
  ),
  systemeDeFichier,
  reseau: new ReseauFetch(5000),
  horloge: new HorlogeSysteme(),
  estimation: new EstimationDuCout({ console }),
  console,
  busDEvenements: busEvenementsPALA,
});
