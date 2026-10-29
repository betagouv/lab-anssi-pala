#! /bin/bash -l
#
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