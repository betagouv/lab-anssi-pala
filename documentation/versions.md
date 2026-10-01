# Versions

Les commits exacts de la cible et des outils sont fixés par les sous-modules (`git submodule status`) ; ce document en
garde la trace lisible.

## Environnement hôte

| Outil                           | Version                | Notes                                                                  |
|---------------------------------|------------------------|------------------------------------------------------------------------|
| docker                          | 29.4.3 (build 055a478) | daemon actif                                                           |
| docker compose                  | v5.1.3                 | plugin CLI                                                             |
| node / pnpm                     | requis pour Shannon    | Node.js ≥ 24 pour l'outillage TypeScript (exécution directe des `.ts`) |
| typescript / vitest / commander | 7.0.2 / 5.0.2 / 15     | outillage TypeScript (`package.json` racine)                           |
| python (hôte)                   | 3.9.6                  | scripts utilitaires (`check_tool_calls.py`)                            |


> **un outil tiers** (un éditeur tiers, `outil-tiers 1.0.0`, sous-module supprimé le 28/09/2026 après
> évaluation) a été écarté ; les runs restent tracés dans `resultats/rapports/`.

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