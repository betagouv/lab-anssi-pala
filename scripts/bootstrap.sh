#!/usr/bin/env bash
# Prépare l'environnement de travail après un clone : initialise les sous-modules,
# recrée les copies de scan (non versionnées) et lance la préparation propre à
# chaque outil (outils/<outil>/bootstrap.sh, s'il existe).
#
# La cible (cible/cible-exemple) et le code amont de chaque outil (outils/<outil>/source)
# sont des SOUS-MODULES : le dépôt ne stocke qu'un pointeur (URL + commit). Ce script
# en récupère le contenu. Idempotent : peut être relancé sans effet de bord.
#
# Usage : bash scripts/bootstrap.sh
set -euo pipefail

racine="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$racine"

echo "==> Initialisation des sous-modules"
git submodule update --init --recursive

echo "==> Recréation des copies de scan (cible/copies/, non versionnées)"
mkdir -p cible/copies

# Copie sans .git de la cible (branche par défaut du sous-module cible-exemple)
if [ ! -d cible/copies/cible-exemple ]; then
  rsync -a --exclude '.git' cible/cible-exemple/ cible/copies/cible-exemple/
  echo "    créé : cible/copies/cible-exemple (copie sans .git)"
fi

# Copie AVEC .git pour le SAST agentique, sur la branche de POC
if [ ! -d cible/copies/cible-exemple-git ]; then
  git clone --branch branche-de-travail \
    https://github.com/betagouv/cible-exemple.git \
    cible/copies/cible-exemple-git \
    || echo "    (branche branche-de-travail indisponible : à recréer manuellement si nécessaire)"
fi

for bootstrap_outil in outils/*/bootstrap.sh; do
  [ -f "$bootstrap_outil" ] || continue
  echo "==> Préparation de $(basename "$(dirname "$bootstrap_outil")")"
  bash "$bootstrap_outil"
done

echo "==> Terminé. Fichiers d'environnement à renseigner (non versionnés) :"
echo "    .env                             (depuis .env.example — clé Albert commune)"
for template in outils/*/*.env.template; do
  [ -f "$template" ] || continue
  env_file="${template%.template}"
  etat="à créer"
  [ -f "$env_file" ] && etat="présent"
  printf '    %-32s (depuis %s — %s)\n' "$env_file" "$(basename "$template")" "$etat"
done
echo "    ainsi que les configs Shannon remplies, depuis outils/shannon/configs/*.template.yaml."