export interface Attente {
  attends(millisecondes: number): Promise<void>;
}
