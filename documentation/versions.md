# Versions

## Environnement hôte

| Outil | Version | Notes |
|---|---|---|
| OS | macOS (Darwin 25.6.0, arm64) | Docker Desktop pour macOS |
| git | 2.50.1 (Apple Git-155) | |
| docker | 29.4.3 (build 055a478) | daemon actif |
| docker compose | v5.1.3 | plugin CLI |
| node / npm / pnpm | non installés sur l'hôte | non requis en phase 1 : un outil tiers tourne en conteneur Docker, Cible n'est pas exécuté localement (clone seul demandé) |
| python (hôte) | 3.9.6 | non utilisé directement — un outil tiers embarque son propre Python 3.12 dans l'image Docker |

## Cible — Cible / la cible

- Dépôt : https://github.com/betagouv/cible-exemple.git
- Chemin local : `cible/cible-exemple/`
- Branche : `main`
- Commit : `224ba638b3486104cb9d4f4468ff5750378d11a4`
- Remote : `origin → https://github.com/betagouv/cible-exemple.git`

## Outil — un outil tiers

- Dépôt : git@github.com:editeur-tiers/outil-tiers.git
- Chemin local : `outils/outil-tiers/`
- Branche : `main`
- Commit : `e4fe316bf30892e104269ab2ad32ce3e82e1af9d`
- Version applicative : `outil-tiers 1.0.0`
- Remote : `origin → git@github.com:editeur-tiers/outil-tiers.git`

## Image Docker un outil tiers

- Tag local : `outil-tiers:local`
- Construite depuis `outils/outil-tiers/Dockerfile` (build multi-stage `python:3.12-slim` + `uv`)
- `ENTRYPOINT ["outil-tiers"]` — l'image est un CLI, pas un service long-running (voir `documentation/setup.md` pour le détail architecture)
