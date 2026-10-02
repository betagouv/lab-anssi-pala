// Adaptateur de ligne de commande du pentest Shannon (run-shannon.sh).
import { resolve } from "node:path";
import { Command } from "commander";
import { executeCommande } from "../../noyau/ligne-de-commande.ts";
import { type Dependances, LancePentest } from "../application/lancePentest.ts";

export type DependancesCli = Dependances & { repertoireAppel: string };

const COMPLEMENT_AIDE = `
L'URL est convertie en host.docker.internal pour le conteneur Shannon (localhost/127.0.0.1 y sont
inaccessibles). L'instance doit tourner AVANT le lancement.

Exemple :
  cp outils/shannon/configs/config-authentification-cible.template.yaml \\
     outils/shannon/configs/config-<nom>-authentification.yaml   # puis renseigner url/identifiants
  pnpm shannon --project <nom> --url http://localhost:8081 \\
     --config outils/shannon/configs/config-<nom>-authentification.yaml`;

type Options = {
  project: string;
  url: string;
  config: string;
  repo?: string;
  workspace?: string;
  modelsConfig?: string;
  model?: string;
};

export async function shannon(argv: string[], dependances: DependancesCli): Promise<number> {
  const programme = new Command("shannon")
    .description("Lance un pentest Shannon contre une application en marche.")
    .requiredOption("--project <nom>", "nom de la cible ; dépôt de référence par défaut : cible/copies/<nom>")
    .requiredOption("--url <url-app>", "URL de l'app locale en marche (ex. http://localhost:8081)")
    .requiredOption("--config <fichier>", "config de scénario Shannon (remplie depuis un configs/*.template.yaml)")
    .option("--repo <dossier>", "dépôt source passé à Shannon (-r) ; défaut cible/copies/<nom>")
    .option("--workspace <nom>", "nom de workspace ; défaut <nom>-<horodatage> (un nom existant REPREND le run)")
    .option("--models-config <fichier>", "description de modèle pi ; défaut déduit de SHANNON_AI_MODEL")
    .option("--model <spec>", "force SHANNON_AI_MODEL (ex. scaleway:deepseek-v4-flash-0731)")
    .addHelpText("after", COMPLEMENT_AIDE);
  return executeCommande(programme, argv, dependances.console, () => {
    const { project, url, config, repo, workspace, modelsConfig, model } = programme.opts<Options>();
    // pnpm exécute depuis la racine : un chemin relatif garde le sens qu'il a pour l'utilisateur.
    const chemin = (valeur?: string) => valeur && resolve(dependances.repertoireAppel, valeur);
    return new LancePentest(dependances).execute({
      projet: project,
      url,
      config: resolve(dependances.repertoireAppel, config),
      depot: chemin(repo),
      workspace,
      modelsConfig: chemin(modelsConfig),
      modele: model,
    });
  });
}
