# Build et déploiement

## Build

| Commande               | Effet                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm run build`       | Enchaîne `build:back` et `build:front`                                                                      |
| `pnpm run build:back`  | Contrôle de types (`tsc --noEmit`) : le serveur exécute les `.ts` directement, aucun artefact n'est produit |
| `pnpm run build:front` | Construit la SPA dans `serveur/front/dist/` (non versionné)                                                 |
| `pnpm run start`       | Démarre le serveur Express                                                                                  |

## Environnements de déploiement

Un seul environnement déployé : **DEMO**, composé de deux applications
(PALA et le proxy LiteLLM). Voir `configuration.md`.

Scripts dédiés à Clever Cloud :

- `scripts/clever-cloud/post-build-clever.sh` : `pnpm run build` ;
- `scripts/clever-cloud/pre-run-clever.sh` : `pnpm run migration-bdd` ;
- `clevercloud/cron.json` : exécute `scripts/taches/scanLesRepoDuLab.sh` toutes les 30 minutes.
  Le script ne lance réellement `codex:scan-complet` qu'au passage de minuit, un jour sur trois,
  sur la liste des dépôts du Lab qu'il contient.

La conservation des dépôts cibles et des installations d'outils entre deux exécutions fait
l'objet de l'[ADR 0002](../architecture/decisions/ADR-0002-conserver-les-repos-cibles-et-installations-codex-au-demarrage.md).

## Pipeline

`.github/workflows/ci.yaml`, sur chaque pull request et chaque push sur `main` :

1. installation des dépendances (`pnpm install --frozen-lockfile`, cache) ;
2. en parallèle :
   - lint (`pnpm run lint`) ;
   - mise en forme (`pnpm run format:verifie`) ;
   - typage (`pnpm run typecheck`) ;
   - tests (`pnpm run migration-bdd` puis Vitest, avec un PostgreSQL de service) ;
3. sur `main` uniquement : déploiement DEMO (`.github/workflows/deploiement.yml`, `clever deploy`)
   du proxy LiteLLM et de PALA, conditionné à la mise en forme, au typage et aux tests.

Un hook `pre-commit` (`.githooks/pre-commit`) lance `lint-staged` : ESLint et Prettier sur les
fichiers indexés.

## Rollback

[À compléter : procédure de retour à une version précédente.]

## Observabilité

- Contrôle de santé : `GET /sante` répond `200 {"statut":"ok"}`, sans authentification ni
  limitation de trafic.
- Journaux : sortie standard des applications (voir `../development/logging.md`).
- Compte rendu de chaque scan publié sur Mattermost.
- [À compléter : métriques, traces et alertes.]
