# Intégrations externes

| Système                   | Usage                                                                  | Protocole                   | Port / adaptateur                                                                            | Données échangées                               |
| ------------------------- | ---------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Fournisseur LLM           | Inférence des agents                                                   | HTTPS, API Chat Completions | Appelé par le proxy LiteLLM (Codex Security) et directement par Shannon                      | Extraits du code de la cible, consignes         |
| Proxy LiteLLM             | Traduit _Responses_ en _Chat Completions_, garde la clé du fournisseur | HTTP(S), API Responses      | Port `ConteneurProxy` ; adaptateurs `ConteneurProxyDockerLocal` et `ConteneurProxyDockeurCC` | Requêtes d'inférence de Codex Security          |
| Codex Security            | Analyse statique agentique                                             | Sous-processus (CLI npm)    | Port `ScannerCodexSecurity` ; adaptateur `ScannerCodexSecurityNpm`                           | Configuration de scan, journal, constats        |
| Shannon                   | Pentest agentique dynamique                                            | Sous-processus              | Ports de `outillage/src/shannon/ports/`                                                      | Configuration, URL de l'instance testée         |
| Dépôt Git de la cible     | Clonage et mise à jour du code à auditer                               | Git                         | Adaptateur `GitEnLigneDeCommande`                                                            | Code source de la cible                         |
| Mattermost                | Compte rendu de fin de scan                                            | HTTPS, webhook entrant      | Port `MessagerieInstantanee` ; adaptateur `messagerieMattermost`                             | Résumé du scan, constats, lien vers le rapport  |
| Cellar                    | Dépôt de la configuration du proxy distant                             | API S3                      | Port `SystemeDeFichier` ; adaptateur `SystemeDeFichierCellar`                                | Fichier de configuration LiteLLM                |
| CDN du kit UI Lab ANSSI   | Web components et variables du design system                           | HTTPS                       | Balises injectées par `serveur/back/src/serveur.ts`, hôte autorisé dans la CSP               | Scripts et feuilles de style                    |
| Authentificateur WebAuthn | Enrôlement de l'utilisateur                                            | WebAuthn (navigateur)       | `serveur/back/src/adaptateurs/adaptateurWebAuthn.ts`                                         | Défis, attestations, sortie PRF côté navigateur |

Pour chaque intégration, documenter les délais, reprises, erreurs, authentification, limites et stratégie de test.

Stratégie de test : chaque port dispose d'une doublure écrite à la main dans
`outillage/test/doubles/` (par exemple `ReseauSimule`, `ConteneurProxySimule`,
`ScannerCodexSecuritySimulee`). Aucun test n'appelle un système externe réel.
