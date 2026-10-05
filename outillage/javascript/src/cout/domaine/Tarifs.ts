export type Tarif = { entree: number; sortie: number; note: string };

// €/million de tokens. Table dupliquée de scripts/estimer-cout.py le temps du portage : garder les
// deux alignées, ainsi que les prix de outils/codex-security/litellm/config.yaml.
export const TARIFS: Record<string, Tarif> = {
  'deepseek-v4-flash-0731': { entree: 0.4, sortie: 0.8, note: 'tarif Scaleway' },
  'glm-5.2': { entree: 1.8, sortie: 5.5, note: 'tarif Scaleway' },
};

// Albert est un service gratuit de la DINUM.
export const estGratuit = (fournisseur: string) =>
  fournisseur.toLowerCase().startsWith('albert');
