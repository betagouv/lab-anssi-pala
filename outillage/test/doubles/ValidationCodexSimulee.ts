import type {
  DemandeDeValidation,
  ResultatDeValidation,
  ValidationCodex,
} from '../../src/codex-security/ports/ValidationCodex.ts';
import type { HorlogeFigee } from './HorlogeFigee.ts';

// Simule une validation qui dure dureeMs (l'horloge avance d'autant).
export class ValidationCodexSimulee implements ValidationCodex {
  readonly demandes: DemandeDeValidation[] = [];
  readonly #horloge?: HorlogeFigee;
  readonly #dureeMs: number;
  readonly #echec?: Error;
  fermee = false;

  constructor({
    horloge,
    dureeMs = 0,
    echec,
  }: { horloge?: HorlogeFigee; dureeMs?: number; echec?: Error } = {}) {
    this.#horloge = horloge;
    this.#dureeMs = dureeMs;
    this.#echec = echec;
  }

  async valide(demande: DemandeDeValidation): Promise<ResultatDeValidation> {
    this.demandes.push(demande);
    this.#horloge?.avance(this.#dureeMs);
    if (this.#echec) throw this.#echec;
    return {
      disposition: 'confirmed',
      threadId: 'fil-1',
      dossier: demande.sortie,
      rapport: '# Rapport\n',
    };
  }

  async ferme(): Promise<void> {
    this.fermee = true;
  }
}
