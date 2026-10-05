import { randomBytes } from 'node:crypto';
import type { GenerateurDeJeton } from '../ports/GenerateurDeJeton.ts';

export class GenerateurDeJetonAleatoire implements GenerateurDeJeton {
  jetonLocal(): string {
    return `sk-local-${randomBytes(24).toString('hex')}`;
  }
}
