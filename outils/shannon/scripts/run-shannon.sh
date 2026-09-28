#!/usr/bin/env bash
# Runner généraliste Shannon : pentest agentique contre une application EN MARCHE, cible fournie
# au lancement (aucune cible codée en dur). La clé et le modèle sont lus dans
# outils/shannon/shannon.env (non versionné) ; la clé n'est jamais affichée.
#
# PRÉREQUIS (voir README) :
#   - une instance de la cible tourne en local (sinon les exploitations n'aboutissent pas) ;
#   - /etc/hosts de l'hôte mappe 127.0.0.1 vers le host Docker (ligne `127.0.0.1 host.docker.internal`),
#     lue par Shannon au démarrage du worker ;
#   - CLI Shannon construite (pnpm build) et Temporal lancé (docker compose up -d temporal).
set -euo pipefail

outil="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
racine="$(cd "$outil/../.." && pwd)"
shannon_dir="$outil/source"
env_file="$outil/shannon.env"

usage() {
  cat <<'USAGE'
Lance un pentest Shannon contre une application en marche.

Usage :
  bash outils/shannon/scripts/run-shannon.sh --project <nom> --url <url-app> --config <fichier> [options]
  bash outils/shannon/scripts/run-shannon.sh --help

Obligatoire :
  --project <nom>       nom de la cible ; dépôt de référence par défaut : cible/copies/<nom>
  --url <url-app>       URL de l'app locale en marche (ex. http://localhost:8081)
  --config <fichier>    config de scénario Shannon (remplie depuis un configs/*.template.yaml)

Options :
  --repo <dossier>      dépôt source passé à Shannon (-r) ; défaut cible/copies/<nom>
  --workspace <nom>     nom de workspace ; défaut <nom>-<horodatage> (un nom existant REPREND le run)
  --models-config <f>   description de modèle pi ; défaut déduit de SHANNON_AI_MODEL
                        (scaleway:* -> models.scaleway.json, albert:* -> models.albert.json)
  --model <spec>        force SHANNON_AI_MODEL (ex. scaleway:deepseek-v4-flash-0731)
  -h, --help            affiche cette aide

L'URL est convertie en host.docker.internal pour le conteneur Shannon (localhost/127.0.0.1 y sont
inaccessibles). L'instance doit tourner AVANT le lancement.

Exemple :
  cp outils/shannon/configs/config-authentification-cible.template.yaml \
     outils/shannon/configs/config-<nom>-authentification.yaml   # puis renseigner url/identifiants
  bash outils/shannon/scripts/run-shannon.sh --project <nom> --url http://localhost:8081 \
     --config outils/shannon/configs/config-<nom>-authentification.yaml
USAGE
}

projet="" ; url="" ; config="" ; repo="" ; workspace="" ; models_config="" ; modele_impose=""
while [ $# -gt 0 ]; do
  case "$1" in
    --project) projet="${2:-}"; shift 2 ;;
    --url) url="${2:-}"; shift 2 ;;
    --config) config="${2:-}"; shift 2 ;;
    --repo) repo="${2:-}"; shift 2 ;;
    --workspace) workspace="${2:-}"; shift 2 ;;
    --models-config) models_config="${2:-}"; shift 2 ;;
    --model) modele_impose="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Option inconnue : $1" >&2; echo >&2; usage >&2; exit 2 ;;
  esac
done

for req in projet url config; do
  if [ -z "${!req}" ]; then
    echo "Erreur : --${req/projet/project} manquant." >&2; echo >&2; usage >&2; exit 2
  fi
done

repo="${repo:-$racine/cible/copies/$projet}"
# Normalise config et repo en chemins absolus (avant le cd dans source/).
config="$(cd "$(dirname "$config")" && pwd)/$(basename "$config")"
workspace="${workspace:-$projet-$(date +%s)}"

[ -f "$env_file" ] || { echo "Fichier manquant : $env_file (depuis shannon.env.template)" >&2; exit 1; }
[ -f "$config" ] || { echo "Config manquante : $config" >&2; exit 1; }
[ -d "$repo" ] || { echo "Dépôt de référence manquant : $repo (cloner via scripts/bootstrap.sh --project $projet --url <git-url>)" >&2; exit 1; }
[ -f "$shannon_dir/apps/cli/dist/index.mjs" ] || { echo "CLI Shannon non construite (cd outils/shannon/source && pnpm build)" >&2; exit 1; }

# L'instance doit être joignable sur l'hôte avant le lancement.
if ! curl -s -o /dev/null --max-time 5 "$url"; then
  echo "Attention : l'app ne répond pas à $url — vérifiez que l'instance locale est bien lancée." >&2
  exit 1
fi

# Le conteneur Shannon atteint l'hôte via host.docker.internal, pas localhost/127.0.0.1.
url_shannon="$url"
url_shannon="${url_shannon/localhost/host.docker.internal}"
url_shannon="${url_shannon/127.0.0.1/host.docker.internal}"

set -a
. "$env_file"
set +a
export SHANNON_AI_MODEL="${modele_impose:-${SHANNON_AI_MODEL:-anthropic:claude-sonnet-4-6}}"

# models-config : override explicite, sinon déduit du fournisseur nommé par SHANNON_AI_MODEL.
if [ -z "$models_config" ]; then
  case "$SHANNON_AI_MODEL" in
    scaleway:*) models_config="$outil/configs/models.scaleway.json" ;;
    albert:*)   models_config="$outil/configs/models.albert.json" ;;
  esac
fi
mc_args=()
[ -n "$models_config" ] && mc_args=(--models-config "$models_config")

echo "Projet    : $projet"     >&2
echo "URL (app) : $url  ->  $url_shannon" >&2
echo "Dépôt     : $repo"       >&2
echo "Config    : $config"     >&2
echo "Modèle    : $SHANNON_AI_MODEL" >&2
echo "Workspace : $workspace"  >&2

cd "$shannon_dir"
direnv exec . node shannon start \
  -u "$url_shannon" \
  -r "$repo" \
  -c "$config" \
  ${mc_args[@]+"${mc_args[@]}"} \
  --follow \
  -w "$workspace"
