# Sécurité

## Principes

- Valider les données à chaque frontière de confiance.
- Appliquer le principe du moindre privilège.
- Séparer authentification et autorisation.
- Protéger les secrets via la configuration d'environnement ou un gestionnaire dédié.
- Utiliser des requêtes paramétrées.
- Éviter les fuites d'informations dans les erreurs et les logs.
- Maintenir les dépendances à jour.

## Spécificités

### Serveur web

- **CSP** stricte avec un nonce par requête (`default-src 'self'`, scripts et styles limités à
  `'self'`, au nonce et au CDN du kit UI), désactivée uniquement en `NODE_ENV=development`.
- **En-têtes** : HSTS (deux ans, sous-domaines, preload), `x-frame-options: deny`,
  `x-content-type-options: nosniff`, `referrer-policy: no-referrer`, politiques
  `cross-origin-opener` et `cross-origin-resource` à `same-origin` ; `x-powered-by` retiré.
- **Cache** interdit hors `/statique`.
- **Limitation de trafic** par minute (`express-rate-limit`), sauf `/sante`, `/statique/` et
  `/favicon.ico` ; `trust proxy` explicite (`NB_REQUETES_TRUST_PROXY`).
- **Session d'enrôlement** : cookie `pala.enrolement`, `httpOnly`, `sameSite: strict`, `secure`
  en production, durée de cinq minutes ; corps JSON limité à 64 ko.
- **Enrôlement** : WebAuthn avec vérification de l'utilisateur exigée et extension PRF.

### Rapports de scan

Chiffrement par enveloppe (`noyau-partage/src/chiffrement`) : le rapport est chiffré en
AES-256-GCM avec une clé encapsulée par HPKE pour chaque destinataire ; la clé privée d'un
utilisateur est protégée par un secret dérivé de son authentificateur (PRF). Tant qu'aucun
destinataire n'est défini pour un scan, le rapport est enregistré sans chiffrement.

### Outils d'audit

- Aucune cible, aucun identifiant, aucune sortie de scan n'est versionné (voir `.gitignore`).
- La clé du fournisseur LLM reste dans le proxy LiteLLM.
- Codex Security : bac à sable avec accès en lecture au disque ; ne pas le lancer sur une machine
  portant d'autres secrets.
- Shannon : uniquement contre une instance et une base jetables, jamais en production.
- Les sous-modules `outils/*/source` ne sont jamais modifiés ; les correctifs passent par des
  patchs idempotents.

### Dépendances

- `minimumReleaseAge` de sept jours et `--frozen-lockfile` (`pnpm-workspace.yaml`, CI).
- Mises à jour proposées par Renovate ; actions GitHub de déploiement épinglées par empreinte.

[À compléter : rôles et autorisation pour la consultation des rapports, données personnelles.]
