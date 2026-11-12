import type { EntrepotUtilisateurs } from '../../../../src/utilisateurs/entrepotUtilisateurs.ts';
import type { Utilisateur } from '../../../../src/utilisateurs/utilisateur.ts';
import { EntrepotMemoire } from './entrepotMemoire.ts';

export class EntrepotUtilisateursEnMemoire
  extends EntrepotMemoire<Utilisateur>
  implements EntrepotUtilisateurs
{
  async persiste(utilisateur: Utilisateur): Promise<void> {
    this.entites.set(utilisateur.enveloppe.keyId, utilisateur);
  }

  async parKeyIds(keyIds: string[]): Promise<Utilisateur[]> {
    return [...this.entites.values()].filter((utilisateur) =>
      keyIds.includes(utilisateur.enveloppe.keyId)
    );
  }
}
