# Docker et environnement de développement

## Objectifs

Docker permet de disposer d'un environnement reproductible.

## Services

Définis dans `../../docker-compose.yaml`.

| Service   | Image / build     | Port                        | Volume                                                                    | Rôle                                                                                            |
| --------- | ----------------- | --------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pala-db` | `postgres:17`     | `5432:5432`                 | `dbvol` (données), `docker-entrypoint-initdb.d/` (crée la base `pala`)    | Persistance                                                                                     |
| `serveur` | `Dockerfile-BACK` | `${PALA_PORT}:${PALA_PORT}` | Sources de `serveur/front`, `serveur/back` et `noyau-partage`             | Applique les migrations puis lance `pnpm run dev` : Express et serveur Vite (port 3001 interne) |
| `cli`     | `Dockerfile-CLI`  | Aucun                       | Aucun (reconstruction sur modification de `outillage` et `noyau-partage`) | Applique les migrations et reste disponible pour lancer les commandes de la CLI                 |

Il n'existe pas de service frontend séparé : le serveur Vite tourne dans le conteneur `serveur`,
derrière Express. `Dockerfile-UI` n'est pas référencé par Docker Compose.

Le proxy LiteLLM est un conteneur distinct, démarré par `pnpm codex:démarre-proxy` (voir
`../../outils/codex-security/README.md`).

## Prérequis

- Le réseau externe `reseau-pala` doit exister : `docker network create reseau-pala`.
- `NODE_VERSION` doit être définie : `scripts/dev/start.sh` la lit dans `.nvmrc`.
- Le `.env` racine doit exister.

## Règles

- Ne pas intégrer de secrets dans les images.
- Persister les données locales lorsque nécessaire.
- Définir des healthchecks pour les services qui le nécessitent.
- Distinguer les configurations de développement et de production.
- Rendre les migrations reproductibles.

## Commandes

```bash
./scripts/dev/start.sh                    # construit et démarre les services
docker-compose logs -f serveur            # consulte les journaux du serveur
docker-compose exec cli pnpm run <script> # lance une commande de la CLI
docker-compose down                       # arrête les services
docker-compose down -v                    # arrête et supprime les données locales
```
