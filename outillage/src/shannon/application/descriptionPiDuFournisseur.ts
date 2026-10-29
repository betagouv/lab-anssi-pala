import { dirname, join } from 'node:path';
import { environnement } from '../../noyau/environnement.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import type { SpecModele } from '../domaine/SpecModele.ts';

const URL_DU_FOURNISSEUR = '${FOURNISSEUR_BASE_URL}';
const API_KEY_DU_FOURNISSEUR = '${FOURNISSEUR_API_KEY}';

export const descriptionPiDuFournisseur = (
  modele: SpecModele,
  racine: string,
  systemeDeFichier: SystemeDeFichier
): string | undefined => {
  const dossierConfigs = join(racine, 'outils/shannon/configs');
  const gabarit = modele.descriptionPiDans(dossierConfigs);
  if (!gabarit) return undefined;
  const description = modele.descriptionPiDans(join(dossierConfigs, 'genere'))!;
  systemeDeFichier.creeDossier(dirname(description));
  systemeDeFichier.ecritFichier(
    description,
    systemeDeFichier
      .lit(gabarit)
      .replaceAll(URL_DU_FOURNISSEUR, environnement.fournisseur().url)
      .replaceAll(API_KEY_DU_FOURNISSEUR, environnement.fournisseur().apiKey)
  );
  return description;
};
