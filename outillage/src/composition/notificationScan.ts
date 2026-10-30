import type { BusEvenementsPALA } from '../noyau/infrastructure/busEvenementsPALA.ts';
import type { ScanTermine } from '../codex-security/domaine/scanTermine.ts';
import type { ScanNonEffectue } from '../codex-security/domaine/scanNonEffectue.ts';
import type { Constat } from '../codex-security/domaine/constat.ts';
import { intervalToDuration } from 'date-fns/intervalToDuration';
import type { MessagerieInstantanee } from '../messagerie/domaine/messagerieInstantanee.ts';
import type { EntrepotScan } from '../scan/entrepoScan.ts';
import type { Scan } from '../noyau/partage/scan.ts';

const nomDeCible = (cible: string) => cible.substring(cible.lastIndexOf('/') + 1);

const nomDeCibleEnMajuscule = (cible: string) => nomDeCible(cible).toUpperCase();

export const abonneNotificationScan = (
  bus: BusEvenementsPALA,
  messagerie: MessagerieInstantanee,
  entrepot: EntrepotScan
): void => {
  const estEvenementScanTermine = (
    evenement: ScanTermine | ScanNonEffectue
  ): evenement is ScanTermine => {
    return evenement.nom === 'SCAN_TERMINÉ';
  };

  const recupereLeScan = async (evenement: ScanTermine | ScanNonEffectue) => {
    try {
      return await entrepot.dernierScanPourLaCible(nomDeCible(evenement.cible));
    } catch (_e) {
      return undefined;
    }
  };

  const recupereLesInformationsGit = async (scan: Scan | undefined) => {
    if (scan) {
      const informationsDeCommits = scan.informationsDeCommits;
      return `- **Interval de commits :** [${informationsDeCommits.premierCommit}, ${informationsDeCommits.dernierCommit}]
  - **Historique git sur :** ${informationsDeCommits.dureeHistorique} jours`;
    }
    return '';
  };

  bus.sabonne<ScanTermine>('SCAN_TERMINÉ', async (evenement) => {
    const cible = nomDeCibleEnMajuscule(evenement.cible);

    const constat = (constat: Constat) => {
      return `##### ${constat.titre} (${constat.cwe.join(' ')})
    - **Sévérité :** ${constat.severite === 'high' ? '🔴' : constat.severite === 'medium' ? '🟠' : '⚪️'} ${constat.severite}
    - **Confiance :** ${constat.confiance}
    ${constat.emplacements.map((emplacement) => `- ${emplacement.chemin} (lignes ${emplacement.ligneDebut} à ${emplacement.ligneFin})`).join('\n')}
    `;
    };
    const scan = await recupereLeScan(evenement);
    if (scan && estEvenementScanTermine(evenement)) {
      scan.rapport = evenement.rapport;
      await entrepot.persiste(scan);
    }
    const informationsGit = await recupereLesInformationsGit(scan);

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
    const cible = nomDeCibleEnMajuscule(evenement.cible);

    const scan = await recupereLeScan(evenement);
    const informationsGit = await recupereLesInformationsGit(scan);

    const message = `### ⚠️ Scan non effectué pour ${cible}
  - **Cible :** ${cible}
  - Aucun fichier à scanner : le périmètre (scan.scope.paths) est vide sur la fenêtre demandée.
  ${informationsGit}`;
    await messagerie.envoyer({ contenu: message });
  });
};
