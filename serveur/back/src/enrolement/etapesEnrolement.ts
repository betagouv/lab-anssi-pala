import type { ContexteEnrolement } from './contexteEnrolement.ts';
import type { Appareil } from './appareil.ts';
import type { EntrepotUtilisateurs } from '../utilisateurs/entrepotUtilisateurs.ts';
import type { Enveloppe } from './enveloppe.ts';

export type PrepareAuthentification = (contexte: {
  identifiantAppareil: string;
}) => Promise<{ options: unknown; defi: string }>;
export type DependancesAuthentification = {
  prepareAuthentification: PrepareAuthentification;
};
export type DemandeAuthentification = { contexte: ContexteEnrolement };

export class DemarreAuthentification {
  readonly #prepareAuthentification: PrepareAuthentification;

  constructor(dependances: DependancesAuthentification) {
    this.#prepareAuthentification = dependances.prepareAuthentification;
  }

  async demarre({ contexte }: DemandeAuthentification): Promise<{
    options: unknown;
    contexte: ContexteEnrolement;
  }> {
    if (!contexte.appareil) {
      throw new Error(
        "L'appareil n'est pas enregistré : authentification impossible."
      );
    }

    const { options, defi } = await this.#prepareAuthentification({
      identifiantAppareil: contexte.appareil.identifiant,
    });

    return { options, contexte: { ...contexte, defi } };
  }
}

export type PrepareEnregistrement = (contexte: {
  identifiantUtilisateur: string;
  nom: string;
}) => Promise<{ options: unknown; defi: string }>;
export type DependancesEnregistrement = {
  prepareEnregistrement: PrepareEnregistrement;
  genereIdentifiantUtilisateur: () => string;
};
export type DemandeEnregistrement = { nom: string };

export class DemarreEnregistrement {
  readonly #prepareEnregistrement: PrepareEnregistrement;
  readonly #genereIdentifiantUtilisateur: () => string;

  constructor(dependances: DependancesEnregistrement) {
    this.#prepareEnregistrement = dependances.prepareEnregistrement;
    this.#genereIdentifiantUtilisateur = dependances.genereIdentifiantUtilisateur;
  }

  async demarre({ nom }: DemandeEnregistrement): Promise<{
    options: unknown;
    contexte: ContexteEnrolement;
  }> {
    if (!nom || nom.trim() === '') {
      throw new Error("Le nom d'utilisateur est obligatoire.");
    }

    const identifiantUtilisateur = this.#genereIdentifiantUtilisateur();
    const { options, defi } = await this.#prepareEnregistrement({
      identifiantUtilisateur,
      nom,
    });

    return { options, contexte: { nom, identifiantUtilisateur, defi } };
  }
}

export type VerifieFinalisationEnregistrement = (contexte: {
  reponse: unknown;
  defiAttendu: string;
}) => Promise<Appareil>;
export type DependancesFinaliseEnregistrement = {
  verifieEnregistrement: VerifieFinalisationEnregistrement;
};
export type DemandeFinalisationEnregistrement = {
  reponse: unknown;
  contexte: ContexteEnrolement;
};

export class FinaliseEnregistrement {
  readonly #verifieEnregistrement: VerifieFinalisationEnregistrement;

  constructor(dependances: DependancesFinaliseEnregistrement) {
    this.#verifieEnregistrement = dependances.verifieEnregistrement;
  }

  async finalise({ reponse, contexte }: DemandeFinalisationEnregistrement): Promise<{
    identifiant: string;
    contexte: ContexteEnrolement;
  }> {
    if (!contexte.defi) {
      throw new Error("Aucun défi d'enregistrement en attente.");
    }

    const appareil = await this.#verifieEnregistrement({
      reponse,
      defiAttendu: contexte.defi,
    });

    return {
      identifiant: appareil.identifiant,
      contexte: {
        nom: contexte.nom,
        identifiantUtilisateur: contexte.identifiantUtilisateur,
        appareil,
      },
    };
  }
}

export type VerifieAuthentification = (contexte: {
  reponse: unknown;
  defiAttendu: string;
  appareil: Appareil;
}) => Promise<{ compteur: number }>;
export type DependancesFinaliseEnrolement = {
  verifieAuthentification: VerifieAuthentification;
  entrepot: EntrepotUtilisateurs;
};
export type DemandeFinalisationEnrolement = {
  reponseAuthentification: unknown;
  enveloppe: Enveloppe;
  contexte: ContexteEnrolement;
};

export class FinaliseEnrolement {
  readonly #verifieAuthentification: VerifieAuthentification;
  readonly #entrepot: EntrepotUtilisateurs;

  constructor(dependances: DependancesFinaliseEnrolement) {
    this.#verifieAuthentification = dependances.verifieAuthentification;
    this.#entrepot = dependances.entrepot;
  }

  async finalise({
    reponseAuthentification,
    enveloppe,
    contexte,
  }: DemandeFinalisationEnrolement): Promise<{ keyId: string }> {
    if (!contexte.appareil || !contexte.defi) {
      throw new Error("L'appareil n'est pas authentifié : enrôlement impossible.");
    }

    const { compteur } = await this.#verifieAuthentification({
      reponse: reponseAuthentification,
      defiAttendu: contexte.defi,
      appareil: contexte.appareil,
    });

    await this.#entrepot.persiste({
      nom: contexte.nom,
      appareil: { ...contexte.appareil, compteur },
      enveloppe,
    });

    return { keyId: enveloppe.keyId };
  }
}
