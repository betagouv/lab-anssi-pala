import type { EnvironnementShannon } from '../../noyau/environnement.ts';

export type EnvironnementShannonDeLancement = NodeJS.ProcessEnv & {
  SHANNON_AI_MODEL: string;
  SHANNON_AI_API_KEY: string;
};

export type DemandeDeLancement = {
  // URL de l'app telle que le conteneur Shannon la voit.
  url: string;
  depot: string;
  // Config de scénario ; aucune pour un passage de fumée.
  config?: string;
  // Description pi du modèle (models.<fournisseur>.json), si Shannon ne le connaît pas nativement.
  modelsConfig?: string;
  workspace: string;
  // Prompts minimaux (--pipeline-testing) : vérifie la chaîne sans produire de rapport valide.
  pipelineTesting?: boolean;
  // Environnement du processus Shannon (clé et modèle compris).
  environnement: EnvironnementShannonDeLancement;
};

// CLI Shannon (outils/shannon/source), pentest agentique suivi jusqu'à son terme.
export interface Shannon {
  // Renvoie le statut de sortie de Shannon.
  demarre(demande: DemandeDeLancement): Promise<number>;
}
