import type { ServicesEnrolement } from '../src/enrolement/localisateurServicesEnrolement.ts';

export const lesServicesDEnrolement = (
  services?: Partial<ServicesEnrolement>
): ServicesEnrolement => {
  return {
    demarreEnregistrement: {
      demarre: async () => ({
        options: { pour: 'navigateur' },
        contexte: { nom: '', identifiantUtilisateur: '' },
      }),
      ...(services && { ...services.demarreEnregistrement }),
    },
    finaliseEnregistrement: {
      finalise: async () => ({
        identifiant: '',
        contexte: { nom: '', identifiantUtilisateur: '' },
      }),
      ...(services && { ...services.finaliseEnregistrement }),
    },
    demarreAuthentification: {
      demarre: async () => ({
        options: { pour: 'navigateur' },
        contexte: { nom: '', identifiantUtilisateur: '' },
      }),
      ...(services && { ...services.demarreAuthentification }),
    },
    finaliseEnrolement: {
      finalise: async () => ({
        keyId: '',
      }),
      ...(services && { ...services.finaliseEnrolement }),
    },
  };
};
