import { join } from 'node:path';
import { scanComplet } from '../scan-complet/cli/scanComplet.ts';
import type { EtapesScanComplet } from '../scan-complet/application/lanceScanComplet.ts';
import { PrepareEnvironnement } from '../bootstrap/application/prepareEnvironnement.ts';
import { CibleBootstrap } from '../bootstrap/domaine/CibleBootstrap.ts';
import { GenereEnvironnement } from '../environnement/application/genereEnvironnement.ts';
import { GenereConfigCible } from '../codex-security/application/genereConfigCible.ts';
import { DemarreProxy } from '../codex-security/application/demarreProxy.ts';
import { LanceScan } from '../codex-security/application/lanceScan.ts';
import { NOMBRE_DE_JOURS_PAR_DEFAUT } from '../codex-security/domaine/fenetreDeModification.ts';
import { proxyEstLocal } from '../codex-security/domaine/proxyLocal.ts';
import { cheminConfigCible } from '../codex-security/domaine/cheminConfig.ts';
import { Cible } from '../environnement/domaine/Cible.ts';
import { ConsoleNode } from '../noyau/adaptateurs/node/consoleNode.ts';
import { SystemeDeFichierNode } from '../noyau/adaptateurs/node/SystemeDeFichierNode.ts';
import { environnement } from '../noyau/environnement.ts';
import {
  lesDependancesPourLaGenerationConfig,
  lesDependancesPourLaGenerationEnvironnement,
  lesDependancesPourLaPreparationEnvironnement,
  lesDependancesPourLeDemarrageDuProxy,
  lesDependancesPourLeScan,
} from './dependances.ts';

const racine = join(import.meta.dirname, '../../../..');
const console = new ConsoleNode();
const contexte = { racine, console };

const etapes: EtapesScanComplet = {
  bootstrap: (cible) =>
    new PrepareEnvironnement(
      lesDependancesPourLaPreparationEnvironnement(contexte, { shannon: false })
    ).execute({ cible: new CibleBootstrap(cible) }),

  genereEnv: () =>
    new GenereEnvironnement(
      lesDependancesPourLaGenerationEnvironnement(contexte)
    ).execute(),

  genereConfig: (nomCible, jours) =>
    void new GenereConfigCible(
      lesDependancesPourLaGenerationConfig(contexte)
    ).execute(nomCible, jours ?? NOMBRE_DE_JOURS_PAR_DEFAUT),

  demarreProxy: () =>
    new DemarreProxy(lesDependancesPourLeDemarrageDuProxy(contexte)).execute(),

  scan: (nomCible) =>
    new LanceScan(lesDependancesPourLeScan(contexte)).execute({
      options: [],
      cible: join(racine, new Cible({ nom: nomCible }).copieDeTravail),
      config: join(racine, cheminConfigCible(nomCible)),
    }),
};

process.exitCode = await scanComplet(process.argv.slice(2), {
  etapes,
  console,
  systemeDeFichier: new SystemeDeFichierNode(racine),
  proxyLocal: proxyEstLocal(environnement.urlLiteLLMConfiguree()),
});
