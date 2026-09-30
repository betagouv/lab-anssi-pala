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
  environnement: Record<string, string | undefined>;
};

// CLI Shannon (outils/shannon/source), pentest agentique suivi jusqu'à son terme.
export interface Shannon {
  // Renvoie le statut de sortie de Shannon.
  demarre(demande: DemandeDeLancement): Promise<number>;
}
