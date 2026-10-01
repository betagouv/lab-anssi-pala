#!/usr/bin/env bash
# Prépare l'environnement de travail : sous-modules des outils, clone de la cible à scanner,
# et préparation propre à chaque outil (outillage/bash/<outil>/bootstrap.sh, s'il existe).
#
# Le dépôt est agnostique de la cible : celle-ci n'est plus figée en sous-module, mais fournie
# au lancement (--project + --url). La cible est clonée dans cible/copies/<nom> (avec .git, non
# versionné) ; cette copie sert à la fois Codex Security (dépôt git, sortie hors du dépôt) et
# Shannon (dépôt de référence). Les sources amont des OUTILS restent des sous-modules.
#
# Idempotent : peut être relancé sans effet de bord (cible déjà clonée = conservée).
set -euo pipefail

racine="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

usage() {
  cat <<'USAGE'
Prépare l'environnement d'audit (sous-modules des outils, clone de la cible, outils).

Usage :
  bash outillage/bash/bootstrap.sh --project <nom> --url <git-url> [--branch <branche>]
  bash outillage/bash/bootstrap.sh [--project <nom> --url <git-url>]   # cible optionnelle
  bash outillage/bash/bootstrap.sh --help

Options :
  --project <nom>   nom court de la cible ; la copie de travail est cible/copies/<nom>
  --url <git-url>   URL git de la cible à cloner
  --branch <nom>    branche à cloner (défaut : branche par défaut du dépôt distant)
  -h, --help        affiche cette aide

Sans --project/--url, le script se limite aux sous-modules des outils et à leur préparation
(utile pour réinitialiser l'outillage sans (re)cloner de cible).

Exemples :
  bash outillage/bash/bootstrap.sh --project cible-exemple --url https://github.com/betagouv/cible-exemple.git
  bash outillage/bash/bootstrap.sh --project cible-exemple --url https://github.com/betagouv/cible-exemple.git --branch main

Après le bootstrap, les outils ciblent la copie cible/copies/<nom> (rappel en fin d'exécution) :
CODEX_TARGET pour Codex Security ; pour Shannon, run-shannon.sh --project <nom> l'utilise par défaut.
USAGE
}

projet=""
url=""
branche=""
while [ $# -gt 0 ]; do
  case "$1" in
    --project) projet="${2:-}"; shift 2 ;;
    --url)     url="${2:-}"; shift 2 ;;
    --branch)  branche="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Option inconnue : $1" >&2; echo >&2; usage >&2; exit 2 ;;
  esac
done

# --project et --url vont de pair : soit les deux, soit aucun.
if [ -n "$projet" ] && [ -z "$url" ]; then
  echo "Erreur : --project fourni sans --url." >&2; echo >&2; usage >&2; exit 2
fi
if [ -z "$projet" ] && [ -n "$url" ]; then
  echo "Erreur : --url fourni sans --project." >&2; echo >&2; usage >&2; exit 2
fi

cd "$racine"

echo "==> Initialisation des sous-modules des outils"
git submodule update --init --recursive

echo "==> Copies de scan (cible/copies/, non versionnées)"
mkdir -p cible/copies

if [ -n "$projet" ]; then
  copie="cible/copies/$projet"
  if [ -d "$copie" ]; then
    echo "    conservé : $copie (déjà présent)"
  else
    echo "    clone de la cible « $projet » depuis $url${branche:+ (branche $branche)}"
    git clone ${branche:+--branch "$branche"} "$url" "$copie"
    echo "    créé : $copie"
  fi
else
  echo "    (aucune cible demandée : passer --project <nom> --url <git-url> pour en cloner une)"
fi

for bootstrap_outil in outillage/bash/*/bootstrap.sh; do
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

if [ -n "$projet" ]; then
  echo
  echo "==> Cible prête : cible/copies/$projet"
  echo "    Codex Security : CODEX_TARGET=\"\$PWD/cible/copies/$projet\""
  echo "    Shannon        : run-shannon.sh --project $projet --url <url-app> --config <fichier>"
fi
