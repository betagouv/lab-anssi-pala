#!/usr/bin/env bash
# Lance un scan Codex Security sur une copie de la cible, avec Albert (gpt-oss-120b) via le
# proxy LiteLLM local (voir start-proxy.sh, à lancer d'abord).
#
# Usage : bash outils/codex-security/scripts/run-scan.sh [options codex-security scan…]
#   ex. : bash outils/codex-security/scripts/run-scan.sh --dry-run
# Variables :
#   CODEX_TARGET  dépôt à scanner (défaut cible/copies/cible-exemple-codex, voir bootstrap.sh)
#   CODEX_CONFIG  fichier de configuration (défaut configs/albert-minimal.yaml)
#   CODEX_OUTPUT  dossier de sortie, vide (défaut resultats/brut/codex-security/scan-<horodatage>)
#   LITELLM_PORT  port du proxy (défaut 4000 ; doit correspondre à base_url dans CODEX_CONFIG)
set -euo pipefail

# shellcheck source=env-runtime.sh
. "$(dirname "${BASH_SOURCE[0]}")/env-runtime.sh"

sortie="${CODEX_OUTPUT:-$racine/resultats/brut/codex-security/scan-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$sortie"
chmod 700 "$sortie"

echo "Cible  : $cible"
echo "Config : $config"
echo "Sortie : $sortie"
exec "$outil/node_modules/.bin/codex-security" scan "$cible" -c "$config" --output-dir "$sortie" --headless "$@"