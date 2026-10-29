import type { EnvironnementCodex } from './EnvironnementCodex.ts';

export type DemandeDeValidation = {
  cible: string;
  config: string;
  finding: object;
  sortie: string;
  environnement: EnvironnementCodex;
};

export type ResultatDeValidation = {
  disposition: string;
  threadId: string | null;
  dossier: string;
  rapport: string;
};

// Validation d'un finding par Codex Security. Passe par le SDK plutôt que par
// `codex-security validate` : la CLI ignore la config utilisateur, donc le fournisseur Albert.
export interface ValidationCodex {
  valide(demande: DemandeDeValidation): Promise<ResultatDeValidation>;
  // Libère les ressources de Codex (processus, fichiers temporaires).
  ferme(): Promise<void>;
}
