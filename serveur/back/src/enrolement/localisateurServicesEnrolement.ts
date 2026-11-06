import {
  DemarreAuthentification,
  DemarreEnregistrement,
  FinaliseEnregistrement,
  FinaliseEnrolement,
} from './etapesEnrolement.ts';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import type { EntrepotUtilisateurs } from '../utilisateurs/entrepotUtilisateurs.ts';
import { operationsWebAuthn } from '../adaptateurs/adaptateurWebAuthn.ts';
import { adaptateurEnvironnement } from '../adaptateurs/adaptateurEnvironnement.ts';
import type { ParametresEnrolement } from '../infra/environnement.ts';

export type ServicesEnrolement = {
  demarreEnregistrement: Pick<DemarreEnregistrement, 'demarre'>;
  finaliseEnregistrement: Pick<FinaliseEnregistrement, 'finalise'>;
  demarreAuthentification: Pick<DemarreAuthentification, 'demarre'>;
  finaliseEnrolement: Pick<FinaliseEnrolement, 'finalise'>;
};

export class LocalisateurServicesEnrolement {
  #entrepot: EntrepotUtilisateurs;
  #parametresEnrolement: ParametresEnrolement;

  constructor(entrepot: EntrepotUtilisateurs) {
    this.#entrepot = entrepot;
    this.#parametresEnrolement = adaptateurEnvironnement.enrolement();
  }

  localise(): ServicesEnrolement {
    const operations = operationsWebAuthn.cree(this.#parametresEnrolement);
    return {
      demarreEnregistrement: new DemarreEnregistrement({
        prepareEnregistrement: operations.prepareEnregistrement,
        genereIdentifiantUtilisateur: () =>
          isoBase64URL.fromBuffer(
            globalThis.crypto.getRandomValues(new Uint8Array(16))
          ),
      }),
      finaliseEnregistrement: new FinaliseEnregistrement({
        verifieEnregistrement: operations.verifieEnregistrement,
      }),
      demarreAuthentification: new DemarreAuthentification({
        prepareAuthentification: operations.prepareAuthentification,
      }),
      finaliseEnrolement: new FinaliseEnrolement({
        verifieAuthentification: operations.verifieAuthentification,
        entrepot: this.#entrepot,
      }),
    };
  }
}
