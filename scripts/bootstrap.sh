#!/usr/bin/env bash
# Prépare l'environnement de travail après un clone : initialise les sous-modules,
# réapplique les patchs locaux et recrée les copies de scan (non versionnées).
#
# Les dépôts cible/cible-exemple, outils/shannon et outils/outil-tiers sont des SOUS-MODULES :
# le dépôt ne stocke qu'un pointeur (URL + commit). Ce script en récupère le contenu.
#
# Usage : bash scripts/bootstrap.sh
set -euo pipefail

racine="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$racine"

echo "==> Initialisation des sous-modules (cible-exemple, shannon, outil-tiers)"
git submodule update --init --recursive

echo "==> Réapplication des patchs Shannon"
patch_shannon="scripts/shannon/patches/bash-timeout-30s.patch"
if [ -f "$patch_shannon" ]; then
  if git -C outils/shannon apply --check "../../$patch_shannon" 2>/dev/null; then
    git -C outils/shannon apply "../../$patch_shannon"
    echo "    patch appliqué : $patch_shannon"
  else
    echo "    patch déjà appliqué (ou non applicable en l'état) : $patch_shannon"
  fi
fi

echo "==> Recréation des copies de scan (scripts/shannon/scan-targets/, non versionnées)"
mkdir -p scripts/shannon/scan-targets

# Copie sans .git de la cible (branche par défaut du sous-module cible-exemple)
if [ ! -d scripts/shannon/scan-targets/cible-exemple ]; then
  rsync -a --exclude '.git' cible/cible-exemple/ scripts/shannon/scan-targets/cible-exemple/
  echo "    créé : scan-targets/cible-exemple (copie sans .git)"
fi

# Copie AVEC .git pour le SAST agentique, sur la branche de POC
if [ ! -d scripts/shannon/scan-targets/cible-exemple-git ]; then
  git clone --branch branche-de-travail \
    https://github.com/betagouv/cible-exemple.git \
    scripts/shannon/scan-targets/cible-exemple-git \
    || echo "    (branche branche-de-travail indisponible : à recréer manuellement si nécessaire)"
fi

echo "==> Terminé. Pensez à renseigner .env, .outil-tiers.env et les configs Shannon remplies"
echo "    à partir de .env.example, .outil-tiers.env.template et des *.template.yaml."