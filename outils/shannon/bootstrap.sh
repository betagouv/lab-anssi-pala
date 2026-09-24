#!/usr/bin/env bash
# Préparation propre à Shannon, appelée par scripts/bootstrap.sh après l'initialisation
# des sous-modules : réapplique les patchs locaux sur outils/shannon/source (idempotent).
set -euo pipefail

outil="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for patch in "$outil"/patches/*.patch; do
  [ -f "$patch" ] || continue
  if git -C "$outil/source" apply --check "$patch" 2>/dev/null; then
    git -C "$outil/source" apply "$patch"
    echo "    patch appliqué : ${patch#"$outil"/}"
  else
    echo "    patch déjà appliqué (ou non applicable en l'état) : ${patch#"$outil"/}"
  fi
done