import { join } from 'node:path';
import { scanComplet } from '../cinematique/cli/scanComplet.ts';
import type { EtapesScanComplet } from '../cinematique/application/lanceCinematique.ts';
import { PrepareEnvironnement } from '../bootstrap/application/prepareEnvironnement.ts';
import { CibleBootstrap } from '../bootstrap/domaine/CibleBootstrap.ts';
import { GitEnLigneDeCommande } from '../bootstrap/adaptateurs/GitEnLigneDeCommande.ts';
import { PrepareCodexSecurity } from '../codex-security/application/prepareCodexSecurity.ts';
import { PrepareShannon } from '../shannon/application/prepareShannon.ts';
import { DepotShannonGit } from '../shannon/adaptateurs/DepotShannonGit.ts';
import { GenereEnvironnement } from '../environnement/application/genereEnvironnement.ts';
import { GenereConfigCible } from '../codex-security/application/genereConfigCible.ts';
import { DemarreProxy } from '../codex-security/application/demarreProxy.ts';
import { LanceScan } from '../codex-security/application/lanceScan.ts';
import { NOMBRE_DE_JOURS_PAR_DEFAUT } from '../codex-security/domaine/fenetreDeModification.ts';
import { proxyEstLocal } from '../codex-security/domaine/proxyLocal.ts';
import { cheminConfigCible } from '../codex-security/domaine/cheminConfig.ts';
import { Cible } from '../environnement/domaine/Cible.ts';
import { DepotGitEnLigneDeCommande } from '../codex-security/adaptateurs/DepotGitEnLigneDeCommande.ts';
import { ConteneurProxyDocker } from '../codex-security/adaptateurs/ConteneurProxyDocker.ts';
import { ScannerCodexSecurityNpm } from '../codex-security/adaptateurs/ScannerCodexSecurityNpm.ts';
import { EstimationDuCout } from '../cout/application/estimationDuCout.ts';
import { AttenteTemporisee } from '../noyau/adaptateurs/node/AttenteTemporisee.ts';
import { BusEvenementsPALA } from '../noyau/adaptateurs/node/busEvenementsPALA.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { HorlogeSysteme } from '../noyau/adaptateurs/node/HorlogeSysteme.ts';
import { ReseauFetch } from '../noyau/adaptateurs/node/ReseauFetch.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';
import { environnement } from '../noyau/environnement.ts';
import { abonneNotificationScan } from './notificationScan.ts';

const racine = join(import.meta.dirname, '../../../..');
const outil = join(racine, 'outils/codex-security');
const repertoireAppel = process.env.INIT_CWD || process.cwd();
const console = new ConsoleNode();
const systemeDeFichier = new SystemeDeFichierNode(racine);
const busEvenementsPALA = new BusEvenementsPALA();
abonneNotificationScan(busEvenementsPALA);

const etapes: EtapesScanComplet = {
  bootstrap: (cible) =>
    new PrepareEnvironnement({
      git: new GitEnLigneDeCommande(racine),
      systemeDeFichier,
      console,
      outils: [
        new PrepareCodexSecurity({
          cli: new ScannerCodexSecurityNpm(outil),
          console,
        }),
        new PrepareShannon({
          depot: new DepotShannonGit(join(racine, 'outils/shannon')),
          console,
        }),
      ],
    }).execute({ cible: new CibleBootstrap(cible) }),

  genereEnv: () => new GenereEnvironnement({ systemeDeFichier, console }).execute(),

  genereConfig: (nomCible, jours) =>
    void new GenereConfigCible({
      systemeDeFichier,
      console,
      depotGit: new DepotGitEnLigneDeCommande(racine),
    }).execute(nomCible, jours ?? NOMBRE_DE_JOURS_PAR_DEFAUT),

  demarreProxy: () =>
    new DemarreProxy({
      conteneur: new ConteneurProxyDocker(outil),
      reseau: new ReseauFetch(2000),
      attente: new AttenteTemporisee(),
      console,
    }).execute(),

  scan: (nomCible) =>
    new LanceScan({
      racine,
      scanner: new ScannerCodexSecurityNpm(outil, repertoireAppel),
      systemeDeFichier,
      reseau: new ReseauFetch(5000),
      attente: new AttenteTemporisee(),
      horloge: new HorlogeSysteme(),
      estimation: new EstimationDuCout({ console }),
      console,
      busDEvenements: busEvenementsPALA,
    }).execute({
      options: [],
      cible: join(racine, new Cible({ nom: nomCible }).copieDeTravail),
      config: join(racine, cheminConfigCible(nomCible)),
    }),
};

process.exitCode = await scanComplet(process.argv.slice(2), {
  etapes,
  console,
  proxyLocal: proxyEstLocal(environnement.urlLiteLLMConfiguree()),
});
