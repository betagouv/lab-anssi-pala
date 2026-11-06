import type { EntrepotUtilisateurs } from '../utilisateurs/entrepotUtilisateurs.ts';
import type { Utilisateur } from '../utilisateurs/utilisateur.ts';

export class EntrepotUtilisateursEnMemoire implements EntrepotUtilisateurs {
  #utilisateurs = new Map<string, Utilisateur>();

  async persiste(utilisateur: Utilisateur): Promise<void> {
    console.log('persiste', utilisateur);
    this.#utilisateurs.set(utilisateur.enveloppe.keyId, utilisateur);
  }

  async lis(keyId: string): Promise<Utilisateur> {
    const utilisateur = this.#utilisateurs.get(keyId);
    if (!utilisateur) {
      throw new Error(`Aucun utilisateur enrôlé pour le keyId ${keyId}.`);
    }
    return utilisateur;
  }
}
