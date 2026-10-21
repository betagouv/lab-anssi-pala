import { join } from 'node:path';
import type { Console } from '../noyau/ports/Console.ts';
import type { Dependances as DependancesPreparationEnvironnement } from '../bootstrap/application/prepareEnvironnement.ts';
import type { Dependances as DependancesGenerationConfig } from '../codex-security/application/genereConfigCible.ts';
import type { Dependances as DependancesGenerationEnvironnement } from '../environnement/application/genereEnvironnement.ts';
import type { Dependances as DependancesDemarrageProxy } from '../codex-security/application/demarreProxy.ts';
import type { Dependances as DependancesScan } from '../codex-security/application/lanceScan.ts';
import { GitEnLigneDeCommande } from '../bootstrap/adaptateurs/GitEnLigneDeCommande.ts';
import { PrepareCodexSecurity } from '../codex-security/application/prepareCodexSecurity.ts';
import { PrepareShannon } from '../shannon/application/prepareShannon.ts';
import { DepotShannonGit } from '../shannon/adaptateurs/DepotShannonGit.ts';
import { ConteneurProxyDocker } from '../codex-security/adaptateurs/ConteneurProxyDocker.ts';
import { ScannerCodexSecurityNpm } from '../codex-security/adaptateurs/ScannerCodexSecurityNpm.ts';
import { EstimationDuCout } from '../cout/application/estimationDuCout.ts';
import { AttenteTemporisee } from '../noyau/adaptateurs/node/AttenteTemporisee.ts';
import { BusEvenementsPALA } from '../noyau/adaptateurs/node/busEvenementsPALA.ts';
import { HorlogeSysteme } from '../noyau/adaptateurs/node/HorlogeSysteme.ts';
import { ReseauFetch } from '../noyau/adaptateurs/node/ReseauFetch.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';
import { abonneNotificationScan } from './notificationScan.ts';

export type ContexteDeComposition = {
  racine: string;
  console: Console;
};

const outilCodexSecurity = (racine: string) => join(racine, 'outils/codex-security');

export const lesDependancesPourLaPreparationEnvironnement = (
  { racine, console }: ContexteDeComposition,
  { shannon = true }: { shannon?: boolean } = {}
): DependancesPreparationEnvironnement => ({
  git: new GitEnLigneDeCommande(racine),
  systemeDeFichier: new SystemeDeFichierNode(racine),
  console,
  outils: [
    new PrepareCodexSecurity({
      cli: new ScannerCodexSecurityNpm(outilCodexSecurity(racine)),
      console,
    }),
    ...(shannon
      ? [
          new PrepareShannon({
            depot: new DepotShannonGit(join(racine, 'outils/shannon')),
            console,
          }),
        ]
      : []),
  ],
});

export const lesDependancesPourLaGenerationConfig = ({
  racine,
  console,
}: ContexteDeComposition): DependancesGenerationConfig => ({
  systemeDeFichier: new SystemeDeFichierNode(racine),
  console,
  git: new GitEnLigneDeCommande(racine),
});

export const lesDependancesPourLaGenerationEnvironnement = ({
  racine,
  console,
}: ContexteDeComposition): DependancesGenerationEnvironnement => ({
  systemeDeFichier: new SystemeDeFichierNode(racine),
  console,
});

export const lesDependancesPourLeDemarrageDuProxy = ({
  racine,
  console,
}: ContexteDeComposition): DependancesDemarrageProxy => ({
  conteneur: new ConteneurProxyDocker(outilCodexSecurity(racine)),
  reseau: new ReseauFetch(2000),
  attente: new AttenteTemporisee(),
  console,
});

export const lesDependancesPourLeScan = ({
  racine,
  console,
}: ContexteDeComposition): DependancesScan => {
  const repertoireAppel = process.env.INIT_CWD || process.cwd();
  const busDEvenements = new BusEvenementsPALA();
  abonneNotificationScan(busDEvenements);
  return {
    racine,
    scanner: new ScannerCodexSecurityNpm(
      outilCodexSecurity(racine),
      repertoireAppel
    ),
    systemeDeFichier: new SystemeDeFichierNode(racine),
    reseau: new ReseauFetch(5000),
    attente: new AttenteTemporisee(),
    horloge: new HorlogeSysteme(),
    estimation: new EstimationDuCout({ console }),
    console,
    busDEvenements,
  };
};
