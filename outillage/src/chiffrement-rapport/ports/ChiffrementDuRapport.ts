export interface ChiffrementDuRapport {
  chiffre(identifiantScan: string, rapport: string): Promise<string>;
}
