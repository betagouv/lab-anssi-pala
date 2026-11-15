# Glossaire métier

Centraliser ici les termes métier afin de garantir un langage partagé entre les parties prenantes et le code.

> Premier jet établi à partir du code et de la documentation existante : à valider par l'équipe.

| Terme                   | Définition                                                                                                             | Synonymes à éviter     | Exemple / contexte                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| Cible                   | Dépôt Git dont le code est audité, cloné dans `cible/copies/<nom>`                                                     | Projet, repo           | `--cible <url-git>`, type `Cible`                     |
| Outil                   | Outil d'audit amont intégré en sous-module : Codex Security ou Shannon                                                 |                        | `outils/<outil>/`                                     |
| Bootstrap               | Préparation des outils et clonage ou mise à jour d'une cible                                                           | Installation           | `pnpm run pala:bootstrap`                             |
| Scan                    | Analyse statique agentique d'une cible par Codex Security, enregistrée avec ses informations de commits et son rapport | Analyse, audit         | Type `Scan`, table `scans`                            |
| Scan complet            | Enchaînement automatisé de toutes les étapes, du bootstrap au scan, pour une ou plusieurs cibles                       |                        | `pnpm run codex:scan-complet`                         |
| Périmètre               | Ensemble des chemins de la cible soumis au scan                                                                        | Scope                  | `Perimetre`, `scan.scope.paths` dans la configuration |
| Fenêtre de modification | Nombre de jours glissants d'historique Git servant à déterminer les fichiers modifiés à scanner (7 par défaut)         | Historique             | `--jours`, `NOMBRE_DE_JOURS_PAR_DEFAUT`               |
| Scan non effectué       | Scan qui n'a pas été lancé parce que son périmètre est vide sur la fenêtre demandée                                    |                        | Événement `SCAN_NON_EFFECTUÉ`                         |
| Constat                 | Faiblesse potentielle signalée par un scan : titre, sévérité, confiance, CWE, emplacements                             | Finding, vulnérabilité | Type `Constat`                                        |
| Validation              | Confrontation d'un constat précis au code pour le confirmer ou l'infirmer                                              |                        | `pnpm run codex:validate`                             |
| Rapport                 | Document produit par un scan, destiné à être consulté par ses destinataires                                            | Compte rendu           | `Scan.rapport`                                        |
| Compte rendu            | Message de synthèse publié en fin de scan sur la messagerie                                                            | Rapport                | Message Mattermost                                    |
| Coût                    | Estimation du prix d'un scan, calculée à partir des tokens consommés et des tarifs du fournisseur                      |                        | `pnpm run pala:estimer-cout`                          |
| Pentest                 | Test d'intrusion agentique dynamique mené par Shannon contre une instance jetable                                      | Test de pénétration    | `pnpm run shannon:pen-test`                           |
| Test de fumée           | Passage minimal de Shannon sur une cible factice, pour vérifier la chaîne                                              | Smoke test             | `pnpm run shannon:smoke-test`                         |
| Fournisseur             | Service qui expose les modèles par une API compatible Chat Completions (Albert, Scaleway)                              | Provider               | Variables `FOURNISSEUR_*`                             |
| Proxy                   | Proxy LiteLLM qui traduit l'API _Responses_ en _Chat Completions_ et garde la clé du fournisseur                       |                        | `pnpm run codex:démarre-proxy`                        |
| Utilisateur             | Personne enrôlée dans PALA pour accéder aux rapports                                                                   | Compte                 | Type `Utilisateur`, table `utilisateurs`              |
| Enrôlement              | Parcours par lequel un utilisateur enregistre son appareil et obtient son enveloppe                                    | Inscription            | Routes `/enrolement/*`                                |
| Appareil                | Authentificateur WebAuthn d'un utilisateur                                                                             | Device, clé            | Type `Appareil`                                       |
| Enveloppe               | Clé publique et clé privée chiffrée d'un utilisateur ; par extension, clé de document encapsulée pour un destinataire  | Wrapper                | Type `Enveloppe`                                      |
| Destinataire            | Personne pour laquelle un rapport est chiffré                                                                          |                        | Type `Destinataire`                                   |
| Entrepôt                | Abstraction de persistance d'un agrégat                                                                                | Repository, dépôt      | `EntrepotScan`, `EntrepotUtilisateurs`                |

## Règles

- Un concept métier doit avoir un nom stable.
- Éviter les synonymes pour désigner un même concept.
- Distinguer les termes métier des termes techniques.
