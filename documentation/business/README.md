# Documentation métier

Ce répertoire est la référence fonctionnelle et métier du projet.

Il doit être complété par l'équipe projet. Un agent ne doit pas inventer une règle métier absente de cette documentation.

**PALA est pensé en 2 parties distinctes :**

- une première partie faisant de l’analyse statique agentique avec l’outil Codex. Cette partie d’analyse statique est
  tout à fait automatisable et exécutable en une seule commande (voir [Scan complet](https://github.com/betagouv/lab-anssi-pala#effectuer-un-scan-complet)). Le détail du scan est donné également [ici](https://github.com/betagouv/lab-anssi-pala/blob/main/outils/codex-security/README.md#utilisation)
- une seconde partie exécutant du pentest agentique avec l’outil Shannon. Cette partie d’exécution intrusive n’est aujourd’hui pas automatisée car elle demande à mettre en place des scénari qui dépendent des résultats de l’analyse précédente.

La stratégie mise en place avec PALA est d’exécuter des scans de manière automatisée à intervalles réguliers.

Cela afin de :

- limiter le nombre de fichiers à analyser (contexte trop grand pour un LLM, performances dégradées, coût élevé)
- obtenir une boucle de retour la plus rapide possible
- informer les équipes de potentielles vulnérabilités

Le dépôt ne contient aucun résultat d'audit : il fournit l'outillage, les configurations d'exemple et
la méthode. Les cibles, les identifiants et les sorties de scan ne sont jamais versionnés.

## Les outils

PALA repose sur 2 outils distincts :

| Outil                                                               | Rôle                                                                                     | Nature                        |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------- |
| [Codex Security](https://github.com/openai/codex-security) (OpenAI) | Analyse statique de code agentique : repère des faiblesses potentielles et les documente | Lit le code, hors ligne       |
| [Shannon](https://github.com/KeygraphHQ/shannon) (Keygraph)         | Pentest agentique dynamique sur une application en marche                                | Agit sur une instance vivante |

Les deux s'enchaînent : **Codex Security d'abord** (analyse statique, large et bon marché), puis
**Shannon** (validation dynamique, ponctuelle) sur les points qui méritent une preuve.

Chaque outil est branché sur un modèle via une API compatible **Chat Completions**. Pour Codex
Security, qui ne parle que l'API _Responses_, un **proxy LiteLLM local** fait la traduction et
garde la clé du fournisseur hors de l'environnement de l'agent (voir
[documentation Codex](../../outils/codex-security/README.md) de PALA).

## Documentation métier

- le modèle métier est détaillé [ici](modèle-du-domaine.md)
- Les règles métiers sont détaillées [ici](règles-métiers.md)
