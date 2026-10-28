export type Scan = {
  [key: string]: {
    premierCommit?: string;
    dernierCommit?: string;
    dureeHistorique: number;
    nombreDeFichiers: number;
  };
};
