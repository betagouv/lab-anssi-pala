#!/usr/bin/env bash
# Lance un scan Codex Security sur une copie de la cible, via le proxy LiteLLM local
# (voir start-proxy.sh, à lancer d'abord). Modèle par défaut : DeepSeek servi par Albert.
#
# Usage : CODEX_TARGET=$PWD/cible/copies/<nom> bash outils/codex-security/scripts/run-scan.sh [options…]
#   ex. : CODEX_TARGET=$PWD/cible/copies/<nom> bash outils/codex-security/scripts/run-scan.sh --dry-run
# Variables :
#   CODEX_TARGET  dépôt à scanner (OBLIGATOIRE ; cloné par scripts/bootstrap.sh dans cible/copies/<nom>)
#   CODEX_CONFIG  fichier de configuration (défaut configs/config-defaut.yaml : DeepSeek, dépôt entier ;
#                 pour un scan ciblé, copier configs/config-cible.template.yaml et y fixer scope.paths)
#   CODEX_OUTPUT  dossier de sortie, vide (défaut resultats/brut/codex-security/scan-<horodatage>)
#   LITELLM_PORT  port du proxy (défaut 4000 ; doit correspondre à base_url dans CODEX_CONFIG)
set -euo pipefail

# shellcheck source=env-runtime.sh
. "$(dirname "${BASH_SOURCE[0]}")/env-runtime.sh"

sortie="${CODEX_OUTPUT:-$racine/resultats/brut/codex-security/scan-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$sortie"
chmod 700 "$sortie"
# Le log est écrit À CÔTÉ du dossier de sortie (jamais dedans) : Codex Security exige un
# --output-dir vide au démarrage.
log_scan="${sortie%/}.stdout.log"

echo "Cible  : $cible"
echo "Config : $config"
echo "Sortie : $sortie"

# On ne fait plus exec : le log est capturé pour estimer le coût une fois le scan fini.
"$outil/node_modules/.bin/codex-security" scan "$cible" -c "$config" --output-dir "$sortie" --headless "$@" \
  2>&1 | tee "$log_scan"
statut=${PIPESTATUS[0]}

# Estimation du coût (best-effort : n'affecte jamais le statut du scan).
model="$(grep -E '^[[:space:]]*model:' "$config" | head -1 | awk '{print $2}')"
provider="$(grep -E '^[[:space:]]*model_provider:' "$config" | head -1 | awk '{print $2}')"
python3 "$racine/scripts/estimer-cout.py" --codex-log "$log_scan" \
  --provider "$provider" --model "$model" || true

exit "$statut"