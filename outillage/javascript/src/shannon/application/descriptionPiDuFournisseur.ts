// Description pi d'un modèle (outils/shannon/configs/models.<fournisseur>.json), complétée de l'URL
// du fournisseur : pi ne résout pas les variables d'environnement dans baseUrl, d'où une copie
// générée (configs/genere/, non versionnée) où ${FOURNISSEUR_BASE_URL} est remplacée.
import { dirname, join } from 'node:path';
import { environnement } from '../../noyau/environnement.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import type { SpecModele } from '../domaine/SpecModele.ts';

const URL_DU_FOURNISSEUR = '${FOURNISSEUR_BASE_URL}';

// Chemin de la description générée ; aucun pour un modèle que Shannon connaît nativement.
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
  );
  return description;
};
