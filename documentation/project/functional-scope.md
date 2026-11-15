# Périmètre fonctionnel

> Inventaire établi à partir des commandes et du code existants : à valider par l'équipe.

## Fonctionnalités

| Capacité                                         | Commande ou point d'entrée                                         | État                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Préparer les outils et cloner une cible          | `pnpm run pala:bootstrap`                                          | Disponible                                                                 |
| Générer l'environnement des outils               | `pnpm run pala:génère-env`                                         | Disponible                                                                 |
| Générer la configuration de scan d'une cible     | `pnpm run pala:génère-config`                                      | Disponible                                                                 |
| Générer la configuration du proxy et le démarrer | `pnpm run codex:génère-config-proxy`, `codex:démarre-proxy`        | Disponible                                                                 |
| Scanner une cible                                | `pnpm run codex:scan`                                              | Disponible                                                                 |
| Scanner une ou plusieurs cibles de bout en bout  | `pnpm run codex:scan-complet`                                      | Disponible ; planifié en DEMO                                              |
| Valider un constat                               | `pnpm run codex:validate`                                          | Disponible                                                                 |
| Estimer le coût d'un scan                        | `pnpm run pala:estimer-cout`                                       | Disponible                                                                 |
| Publier le compte rendu d'un scan                | Automatique en fin de scan (Mattermost)                            | Disponible                                                                 |
| Enregistrer le scan et son rapport               | Automatique (PostgreSQL)                                           | Disponible                                                                 |
| Lancer un pentest                                | `pnpm run shannon:pen-test`                                        | Disponible, manuel                                                         |
| Vérifier la chaîne Shannon                       | `pnpm run shannon:smoke-test`, `shannon:vérifie-appels-outils-llm` | Disponible                                                                 |
| Enrôler un utilisateur                           | Interface web, routes `/enrolement/*`                              | Disponible                                                                 |
| Chiffrer le rapport pour ses destinataires       | `noyau-partage/src/chiffrement`                                    | Implémenté, pas encore activé : aucun destinataire n'est associé à un scan |
| Consulter un rapport                             | Lien `/rapports/<id>` du compte rendu                              | À venir                                                                    |

## Acteurs

| Acteur                              | Droits ou responsabilités                                            |
| ----------------------------------- | -------------------------------------------------------------------- |
| Auditeur sécurité                   | Exécute les commandes de la CLI, dispose du `.env`                   |
| Tâche planifiée                     | Lance le scan complet des dépôts du Lab                              |
| Utilisateur enrôlé                  | S'enrôle avec son authentificateur ; destinataire futur des rapports |
| Équipe de développement d'une cible | Lit les comptes rendus sur Mattermost                                |

## Parcours principaux

1. **Scan automatisé** : bootstrap, configuration, proxy, scan, enregistrement, compte rendu
   (voir `../architecture/data-flow.md`).
2. **Approfondissement** : validation d'un constat, puis pentest Shannon sur une instance jetable
   pour les cas qui méritent une preuve (voir `../demarche.md`).
3. **Enrôlement** : enregistrement de l'appareil, authentification, dépôt de l'enveloppe.

## Hors périmètre

- Automatisation du pentest.
- Correction automatique des vulnérabilités dans la cible.
- Conservation de résultats d'audit dans le dépôt.
- [À compléter par l'équipe.]
