# Versions

Les commits exacts de la cible et des outils sont fixés par les sous-modules
(`git submodule status`) ; ce document en garde la trace lisible.

## Environnement hôte

| Outil | Version | Notes |
|---|---|---|
| OS | macOS (Darwin 25.6.0, arm64) | Docker Desktop pour macOS |
| git | 2.50.1 (Apple Git-155) | |
| docker | 29.4.3 (build 055a478) | daemon actif |
| docker compose | v5.1.3 | plugin CLI |
| node / pnpm | requis pour Shannon et `passerelles/outil-tiers-to-shannon` | un outil tiers, lui, tourne entièrement en conteneur |
| python (hôte) | 3.9.6 | scripts utilitaires (`check_tool_calls.py`, `reconcile.py`) ; un outil tiers embarque son propre Python 3.12 |

## Cible — Cible / la cible

- Dépôt : https://github.com/betagouv/cible-exemple.git
- Chemin local : `cible/cible-exemple/` (sous-module)
- Branche : `main`
- Commit : `224ba638b3486104cb9d4f4468ff5750378d11a4`
- Copies de scan : `cible/copies/` (non versionnées, voir `scripts/bootstrap.sh`)

## Outil — un outil tiers

- Dépôt : https://github.com/editeur-tiers/outil-tiers
- Chemin local : `outils/outil-tiers/source/` (sous-module)
- Branche : `main`
- Commit : `e4fe316bf30892e104269ab2ad32ce3e82e1af9d`
- Version applicative : `outil-tiers 1.0.0`

### Image Docker un outil tiers

- Tag local : `outil-tiers:local`
- Construite depuis `outils/outil-tiers/source/Dockerfile` (build multi-stage `python:3.12-slim` + `uv`)
- `ENTRYPOINT ["outil-tiers"]` — l'image est un CLI, pas un service long-running (voir `outils/outil-tiers/docs/setup.md`)
- Image dérivée `outil-tiers-sandbox:local` : `outils/outil-tiers/docker-sandbox/Dockerfile`

## Outil — Shannon

- Dépôt : https://github.com/KeygraphHQ/shannon
- Chemin local : `outils/shannon/source/` (sous-module)
- Commit : `327c10fd90a6186a9f035b4b6ddb5bbba1839e92` (`v3.3.0`)
- Patch local : `outils/shannon/patches/bash-timeout-30s.patch`

## Outil — Codex Security

- Dépôt : https://github.com/openai/codex-security
- Chemin local : `outils/codex-security/source/` (sous-module)
- Commit : `607298fca7a24dfc290f560005acaf2332bdfa1c`
- CLI utilisée : `@openai/codex-security@0.1.30` (npm, `outils/codex-security/package-lock.json`),
  embarquant Codex `0.155.0` et le plugin Codex Security `0.1.95`
- Proxy LiteLLM : `ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02`
- Node.js 24.14.0, Python 3.14.3 (hôte)