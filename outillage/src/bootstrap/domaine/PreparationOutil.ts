export interface PreparationOutil {
  readonly nom: string;
  readonly fichierEnvironnement?: string;
  prepare(): Promise<void>;
}
