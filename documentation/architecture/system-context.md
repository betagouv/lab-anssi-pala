# Contexte système

## Système étudié

PALA met à disposition des outils d'audit de sécurité pilotés par des agents LLM. Il prépare une
cible (dépôt Git), lance une analyse statique agentique (Codex Security) et, à la demande, un
pentest dynamique (Shannon). Il enregistre chaque scan, publie un compte rendu et expose une
interface web où les utilisateurs s'enrôlent pour accéder aux rapports.

## Acteurs externes

| Acteur / système                    | Interaction                                      | Protocole / mécanisme          |
| ----------------------------------- | ------------------------------------------------ | ------------------------------ |
| Auditeur sécurité                   | Lance bootstrap, scans et pentests               | Commandes `pnpm`               |
| Tâche planifiée Clever Cloud        | Lance le scan complet des dépôts du Lab          | Cron (`clevercloud/cron.json`) |
| Équipe de développement de la cible | Reçoit les comptes rendus de scan                | Mattermost                     |
| Utilisateur de l'interface          | S'enrôle avec un authentificateur                | HTTPS, WebAuthn                |
| Dépôt Git de la cible               | Fournit le code à auditer                        | Git                            |
| Fournisseur LLM (Albert, Scaleway)  | Sert les modèles utilisés par les agents         | HTTPS, API Chat Completions    |
| Mattermost                          | Reçoit le compte rendu de fin de scan            | Webhook entrant                |
| Cellar (Clever Cloud)               | Stocke la configuration du proxy LiteLLM distant | API S3                         |
| CDN du kit UI Lab ANSSI             | Sert les web components du design system         | HTTPS                          |

Le détail des adaptateurs est dans `../technical/external-integrations.md`.

## Diagramme

Le diagramme de contexte est le niveau 1 du modèle C4 : voir [`architecture.md`](architecture.md).

## Frontières de confiance

- **Clé du fournisseur** : elle reste dans le proxy LiteLLM, hors de l'environnement de l'agent
  Codex Security, qui ne connaît que la clé du proxy.
- **Code de la cible** : cloné dans `cible/copies/<nom>`, jamais versionné. Des extraits partent
  vers le fournisseur LLM : le choix d'un fournisseur souverain fait partie de la démarche.
- **Bac à sable de Codex Security** : il dispose d'un accès en lecture au disque ; ne pas le
  lancer sur une machine portant d'autres secrets.
- **Shannon** : il agit réellement sur l'application testée ; uniquement sur une instance et une
  base jetables.
- **Navigateur** : toute entrée HTTP est non fiable ; le serveur applique CSP, en-têtes de
  sécurité et limitation de trafic (voir `../development/security.md`).
- **Rapport de scan** : conçu pour être chiffré par enveloppe pour ses destinataires
  (`noyau-partage/src/chiffrement`).
