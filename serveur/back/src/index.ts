import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { creeServeur } from './serveur.ts';
import { middleware } from './http/middleware.ts';
import { adaptateurProtection } from './adaptateurs/adaptateurProtection.ts';
import { adaptateurEnvironnement } from './adaptateurs/adaptateurEnvironnement.ts';
import { creeOperationsWebAuthn } from './adaptateurs/adaptateurWebAuthn.ts';
import { EntrepotUtilisateursEnMemoire } from './adaptateurs/entrepotUtilisateursEnMemoire.ts';
import {
  DemarreAuthentification,
  DemarreEnregistrement,
  FinaliseEnregistrement,
  FinaliseEnrolement,
} from './enrolement/etapesEnrolement.ts';

const entrepot = new EntrepotUtilisateursEnMemoire();
const operations = creeOperationsWebAuthn(adaptateurEnvironnement.enrolement());

const servicesEnrolement = {
  demarreEnregistrement: new DemarreEnregistrement({
    prepareEnregistrement: operations.prepareEnregistrement,
    genereIdentifiantUtilisateur: () =>
      isoBase64URL.fromBuffer(globalThis.crypto.getRandomValues(new Uint8Array(16))),
  }),
  finaliseEnregistrement: new FinaliseEnregistrement({
    verifieEnregistrement: operations.verifieEnregistrement,
  }),
  demarreAuthentification: new DemarreAuthentification({
    prepareAuthentification: operations.prepareAuthentification,
  }),
  finaliseEnrolement: new FinaliseEnrolement({
    verifieAuthentification: operations.verifieAuthentification,
    entrepot,
  }),
};

const leServeur = creeServeur({
  middleware: middleware(),
  adaptateurProtection: adaptateurProtection,
  adaptateurEnvironnement: adaptateurEnvironnement,
  servicesEnrolement,
});

const port = process.env.PORT || 8086;
leServeur.ecoute(port as number, () => {
  console.log(`PALA est démarré et écoute le port ${port} !…`);
});
