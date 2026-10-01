#!/usr/bin/env bash
# Préparation propre à Codex Security, appelée par outillage/bash/bootstrap.sh (idempotent) :
#   - installe la CLI publiée sur npm, à la version figée dans package-lock.json.
#
# La cible à scanner n'est plus préparée ici : le bootstrap racine clone la cible dans
# cible/copies/<nom> (avec .git), utilisable directement comme CODEX_TARGET. Codex Security
# exige une sortie hors du dépôt Git englobant la cible : la copie porte son propre .git et
# resultats/ est en dehors, la contrainte est donc satisfaite.
set -euo pipefail

racine="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
outil="$racine/outils/codex-security"

if [ ! -x "$outil/node_modules/.bin/codex-security" ]; then
  (cd "$outil" && npm ci --no-fund --no-audit)
  echo "    installé : @openai/codex-security $("$outil/node_modules/.bin/codex-security" --version)"
fi
