#! /bin/bash -l
#
# Date d'origine du cycle (format AAAA-MM-JJ). Le scan n'est lancé que si la
# difference en jours entre aujourd'hui et cette date est un multiple de 3
# (0, 3, 6, ...), c'est-a-dire tous les 3 jours a partir de cette date.
# À adapter selon le point de depart souhaite.
DATE_ORIGINE="2026-10-30"

# Le cron s'execute plusieurs fois par jour : on ne retient que le passage de
# minuit, afin de ne declencher le scan qu'une seule fois dans la journee.
if [ "$(date +%H%M)" != "0000" ]; then
  exit 0
fi

# Calcul de la difference en jours. On interprete les dates en UTC pour obtenir
# un ecart toujours exact (pas d'effet de bord lie aux changements d'heure).
jours_origine=$(( $(date -u -d "${DATE_ORIGINE}" +%s) / 86400 ))
jours_aujourdhui=$(( $(date -u -d "$(date +%F)" +%s) / 86400 ))
difference=$(( jours_aujourdhui - jours_origine ))

# On sort sans rien lancer si on est avant la date d'origine, ou si l'ecart
# n'est pas un multiple de 3.
if [ "${difference}" -lt 0 ] || [ $(( difference % 3 )) -ne 0 ]; then
  echo "Il est encore trop tôt pour le scan complet des projets du LAB"
  exit 0
fi

echo "LANCE le scan complet des projets du LAB ${APP_HOME}"

cd "${APP_HOME}" || exit
pnpm run codex:scan-complet \
  --cible https://github.com/betagouv/lab-anssi-admin.git \
  --cible https://github.com/betagouv/anssi-lab-utilitaires.git \
  --cible https://github.com/betagouv/anssi-recommandations-cyber-data.git \
  --cible https://github.com/betagouv/lab-anssi-ui-kit.git \
  --cible https://github.com/betagouv/lab-anssi-rula.git \
  --cible https://github.com/betagouv/lab-anssi-lib.git \
  --cible https://github.com/betagouv/anssi-demain-specialiste-cyber.git \
  --cible https://github.com/betagouv/mon-service-securise.git \
  --cible https://github.com/betagouv/anssi-recommandations-cyber.git \
  --cible https://github.com/betagouv/anssi-portail.git --jours 3