#!/usr/bin/env bash
# Valide un finding existant avec Codex Security (Albert via le proxy LiteLLM, voir start-proxy.sh).
# Flux plus simple que le scan : skill `validation` seule, plugins désactivés (ni outils MCP ni
# brouillon de scan).
#
# Usage :
#   bash outillage/bash/codex-security/validate.sh --finding-file <finding.json>
# Variables : CIBLE, CONFIG, PORT_LITE_LLM (voir env-runtime.sh),
#             SORTIE (défaut resultats/brut/codex-security/validate-<horodatage>, doit être vide)
set -euo pipefail

# shellcheck source=env-runtime.sh
. "$(dirname "${BASH_SOURCE[0]}")/env-runtime.sh"

sortie="${SORTIE:-$racine/resultats/brut/codex-security/validate-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$sortie"
chmod 700 "$sortie"

echo "Cible  : $cible" >&2
echo "Config : $config" >&2
echo "Sortie : $sortie" >&2
exec node "$outil/scripts/validate.mjs" --config "$config" --repository "$cible" --output "$sortie" "$@"