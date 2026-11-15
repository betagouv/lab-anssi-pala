# Configuration

## Principes

La configuration dépendante de l'environnement est externalisée. Les valeurs sensibles ne sont jamais versionnées.

## Environnements

| Environnement | Support                                                         | Chargement de la configuration                                           |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Local         | Docker Compose (`../../docker-compose.yaml`)                    | `.env` racine (chargé par `dotenv` et par `env_file`)                    |
| CI            | GitHub Actions (`../../.github/workflows/ci.yaml`)              | Variables du workflow (`BASE_DONNEES_URL` vers le PostgreSQL de service) |
| DEMO          | Clever Cloud : application PALA et application du proxy LiteLLM | Variables d'environnement des applications Clever Cloud                  |

Aucun environnement de préproduction ou de production n'est défini à ce jour.

## Chargement

- Serveur : `serveur/back/src/adaptateurs/adaptateurEnvironnement.ts` lit `process.env`.
- CLI : `outillage/src/noyau/environnement.ts` lit `process.env` ; les scripts `pnpm` chargent
  le `.env` racine avec `--require dotenv/config`.
- Shannon : `outils/shannon/shannon.env`, généré par `pnpm pala:génère-env`.
- Scans : `outils/codex-security/configs/config-<cible>.yaml`, généré par `pnpm pala:génère-config`.
- Proxy LiteLLM : `outils/codex-security/litellm/config-genere.yaml`, généré par
  `pnpm codex:génère-config-proxy`.

## Validation

Valider la configuration au démarrage. Échouer explicitement si une variable obligatoire est absente ou invalide.

- Serveur : `verifieLesVariablesNecessaires` (variables `ENROLEMENT_*`), contrôle de `PALA_PORT`,
  `PALA_HOTE` et `NB_REQUETES_TRUST_PROXY`.
- CLI : `verifiePresenceVariablesRacine` (`FOURNISSEUR_API_KEY`, `FOURNISSEUR_BASE_URL`,
  `FOURNISSEUR_MODELE`, `LITELLM_BASE_URL`, `LITELLM_API_KEY`).

## Source de vérité

Les noms et valeurs par défaut doivent rester cohérents avec `../../.env.example` et
`environment-variables.md`.
