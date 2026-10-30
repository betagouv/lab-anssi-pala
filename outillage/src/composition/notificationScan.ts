import type { BusEvenementsPALA } from '../noyau/infrastructure/busEvenementsPALA.ts';
import type { ScanTermine } from '../codex-security/domaine/scanTermine.ts';
import type { ScanNonEffectue } from '../codex-security/domaine/scanNonEffectue.ts';
import type { Constat } from '../codex-security/domaine/constat.ts';
import { intervalToDuration } from 'date-fns/intervalToDuration';
import type { MessagerieInstantanee } from '../messagerie/domaine/messagerieInstantanee.ts';

import { EntrepotDeScanMemoire } from '../../test/noyau/persistance/entrepots.ts';

const nomDeCible = (cible: string) =>
  cible.substring(cible.lastIndexOf('/') + 1).toUpperCase();

export const abonneNotificationScan = (
  bus: BusEvenementsPALA,
  messagerie: MessagerieInstantanee,
  entrepot: EntrepotDeScanMemoire
): void => {
  const recupereLesInformationsGit = async (
    evenement: ScanTermine | ScanNonEffectue
  ) => {
    try {
      const identifiant = evenement.cible.substring(
        evenement.cible.lastIndexOf('/') + 1
      );
      const scan = await entrepot.lis(identifiant);
      return `- **Interval de commits :** [${scan[identifiant].premierCommit}, ${scan[identifiant].dernierCommit}]
  - **Historique git sur :** ${scan[identifiant].dureeHistorique} jours`;
    } catch (_e) {
      return '';
    }
  };

  bus.sabonne<ScanTermine>('SCAN_TERMINÉ', async (evenement) => {
    const cible = nomDeCible(evenement.cible);

    const constat = (constat: Constat) => {
      return `##### ${constat.titre} (${constat.cwe.join(' ')})
    - **Sévérité :** ${constat.severite === 'high' ? '🔴' : constat.severite === 'medium' ? '🟠' : '⚪️'} ${constat.severite}
    - **Confiance :** ${constat.confiance}
    ${constat.emplacements.map((emplacement) => `- ${emplacement.chemin} (lignes ${emplacement.ligneDebut} à ${emplacement.ligneFin})`).join('\n')}
    `;
    };
    const informationsGit = await recupereLesInformationsGit(evenement);

    const {
      hours = 0,
      minutes = 0,
      seconds = 0,
    } = intervalToDuration({
      start: 0,
      end: evenement.dureeEnMs ?? 0,
    });
    const message = `### ${evenement.resultat === 'Succès' ? '✅' : '❌'} Scan de vulnérabilité terminé pour ${cible}
  - **Cible :** ${cible}
  - **Coût :** ${evenement.cout.type === 'estimé' ? evenement.cout.montantEnEuros.toFixed(2) : 0}€
  - **Nombre de fichiers analysés :** ${evenement.nombreDeFichiers}
  - **Durée du scan :** ${hours} H ${minutes} mn ${seconds} s
  - **Nombre de constats trouvés :** ${evenement.constats.length}
  ${informationsGit}
  #### Constats
  ${evenement.constats.map((c) => constat(c)).join('\n')}
  `;
    await messagerie.envoyer({ contenu: message });
  });

  bus.sabonne<ScanNonEffectue>('SCAN_NON_EFFECTUÉ', async (evenement) => {
    const cible = nomDeCible(evenement.cible);

    const informationsGit = await recupereLesInformationsGit(evenement);

    const message = `### ⚠️ Scan non effectué pour ${cible}
  - **Cible :** ${cible}
  - Aucun fichier à scanner : le périmètre (scan.scope.paths) est vide sur la fenêtre demandée.
  ${informationsGit}`;
    await messagerie.envoyer({ contenu: message });
  });
};
