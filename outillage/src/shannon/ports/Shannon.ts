export type EnvironnementShannonDeLancement = NodeJS.ProcessEnv & {
  SHANNON_AI_MODEL: string;
  SHANNON_AI_API_KEY: string;
};

export type DemandeDeLancement = {
  url: string;
  depot: string;
  config?: string;
  modelsConfig?: string;
  workspace: string;
  pipelineTesting?: boolean;
  environnement: EnvironnementShannonDeLancement;
};

export interface Shannon {
  demarre(demande: DemandeDeLancement): Promise<number>;
}
