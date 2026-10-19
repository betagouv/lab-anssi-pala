import type { BusEvenementsPALA } from '../noyau/adaptateurs/node/busEvenementsPALA.ts';
import type { ScanTermine } from '../codex-security/domaine/scanTermine.ts';
import type { ScanNonEffectue } from '../codex-security/domaine/scanNonEffectue.ts';
import type { Constat } from '../codex-security/domaine/constat.ts';
import { MessagerieMattermost } from '../messagerie/adaptateurs/messagerieMattermost.ts';
import { ApiHTTPFetch } from '../noyau/adaptateurs/node/apiHTTPFetch.ts';
import { environnement } from '../noyau/environnement.ts';

const nomDeCible = (cible: string) =>
  cible.substring(cible.lastIndexOf('/') + 1).toUpperCase();

const publieSurMattermost = async (contenu: string): Promise<void> => {
  if (!environnement.mattermost().urlWebhook) return;
  await new MessagerieMattermost(new ApiHTTPFetch()).envoyer({ contenu });
};

export const abonneNotificationScan = (bus: BusEvenementsPALA): void => {
  bus.sabonne<ScanTermine>('SCAN_TERMINÉ', async (evenement) => {
    const cible = nomDeCible(evenement.cible);

    const constat = (constat: Constat) => {
      return `##### ${constat.titre} (${constat.cwe.join(' ')})
    - **Sévérité :** ${constat.severite === 'high' ? '🔴' : constat.severite === 'medium' ? '🟠' : '⚪️'} ${constat.severite}
    - **Confiance :** ${constat.confiance}
    ${constat.emplacements.map((emplacement) => `- ${emplacement.chemin} (lignes ${emplacement.ligneDebut} à ${emplacement.ligneFin})`).join('\n')}
    `;
    };

    const message = `### ${evenement.resultat === 'Succès' ? '✅' : '❌'} Scan de vulnérabilité terminé pour ${cible}
  - **Cible :** ${cible}
  - **Coût :** ${evenement.cout.type === 'estimé' ? evenement.cout.montantEnEuros.toFixed(2) : 0}€
  - **Nombre de constats trouvés :** ${evenement.constats.length}
  #### Constats
  ${evenement.constats.map((c) => constat(c)).join('\n')}
  `;
    await publieSurMattermost(message);
  });

  bus.sabonne<ScanNonEffectue>('SCAN_NON_EFFECTUÉ', async (evenement) => {
    const cible = nomDeCible(evenement.cible);

    const message = `### ⚠️ Scan non effectué pour ${cible}
  - **Cible :** ${cible}
  - Aucun fichier à scanner : le périmètre (scan.scope.paths) est vide sur la fenêtre demandée.`;
    await publieSurMattermost(message);
  });
};
