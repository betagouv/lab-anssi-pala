export type Tarif = { entree: number; sortie: number; note: string };

export const TARIFS: Record<string, Tarif> = {
  'deepseek-v4-flash-0731': { entree: 0.4, sortie: 0.8, note: 'tarif Scaleway' },
  'glm-5.2': { entree: 1.8, sortie: 5.5, note: 'tarif Scaleway' },
};

export const estGratuit = (fournisseur: string) =>
  fournisseur.toLowerCase().startsWith('albert');
