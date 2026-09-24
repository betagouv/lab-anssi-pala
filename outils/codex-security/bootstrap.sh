#!/usr/bin/env bash
# Préparation propre à Codex Security, appelée par scripts/bootstrap.sh après l'initialisation
# des sous-modules (idempotent) :
#   - installe la CLI publiée sur npm, à la version figée dans package-lock.json ;
#   - crée cible/copies/cible-exemple-codex, clone git local de cible/cible-exemple au commit
#     du sous-module. Codex Security exige une sortie hors du dépôt Git englobant la cible :
#     avec une copie sans .git, ce dépôt serait celui du lab, et resultats/ serait refusé.
set -euo pipefail

outil="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
racine="$(cd "$outil/../.." && pwd)"

if [ ! -x "$outil/node_modules/.bin/codex-security" ]; then
  (cd "$outil" && npm ci --no-fund --no-audit)
  echo "    installé : @openai/codex-security $("$outil/node_modules/.bin/codex-security" --version)"
fi

copie="$racine/cible/copies/cible-exemple-codex"
if [ ! -d "$copie" ]; then
  git clone -q "$racine/cible/cible-exemple" "$copie"
  git -C "$copie" checkout -q "$(git -C "$racine/cible/cible-exemple" rev-parse HEAD)"
  echo "    créé : cible/copies/cible-exemple-codex (clone local au commit du sous-module)"
fi