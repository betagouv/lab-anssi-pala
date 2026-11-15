# Documentation

Ce répertoire contient la documentation de référence du projet.

| Répertoire     | Contenu                                          |
| -------------- | ------------------------------------------------ |
| `project`      | Objectifs, périmètre, contraintes et vocabulaire |
| `architecture` | Architecture, modules, dépendances et décisions  |
| `technical`    | Stack, configuration, base de données et Docker  |
| `development`  | Conventions et méthodes de développement         |
| `quality`      | Stratégie de tests et critères de qualité        |
| `business`     | Modèle, règles et cas d'utilisation métier       |

Documents à la racine de ce répertoire :

| Document              | Contenu                                                      |
| --------------------- | ------------------------------------------------------------ |
| `demarche.md`         | Méthode d'évaluation des outils d'audit agentiques           |
| `ajouter-un-outil.md` | Convention et étapes d'intégration d'un nouvel outil d'audit |
| `versions.md`         | Versions des outils amont et de l'environnement hôte         |
| `albert-api.md`       | Notes sur l'API Albert                                       |
| `scaleway-ai-api.md`  | Notes sur l'API Scaleway                                     |

La documentation doit décrire le système réellement implémenté. En cas d'écart entre un exemple et le code, vérifier le code et mettre à jour la documentation.

## État des documents

Une section encore vide porte le marqueur `[À compléter]` : elle ne constitue pas une règle.

| Document                              | État                                                                |
| ------------------------------------- | ------------------------------------------------------------------- |
| `project/overview.md`                 | Premier jet, à valider par l'équipe                                 |
| `project/functional-scope.md`         | Premier jet, à valider par l'équipe                                 |
| `project/glossary.md`                 | Premier jet, à valider par l'équipe                                 |
| `project/constraints.md`              | Partiel : contraintes fonctionnelles et opérationnelles à compléter |
| `architecture/overview.md`            | Rempli                                                              |
| `architecture/architecture.md`        | Rempli (modèle C4)                                                  |
| `architecture/system-context.md`      | Rempli                                                              |
| `architecture/module-organization.md` | Rempli                                                              |
| `architecture/dependency-rules.md`    | Rempli ; aucune vérification automatique                            |
| `architecture/data-flow.md`           | Partiel : flux frontend et transactions à compléter                 |
| `architecture/decisions/`             | Deux ADR proposés, non décidés                                      |
| `technical/stack.md`                  | Rempli                                                              |
| `technical/environment-variables.md`  | Rempli                                                              |
| `technical/configuration.md`          | Rempli                                                              |
| `technical/database.md`               | Rempli                                                              |
| `technical/docker.md`                 | Rempli                                                              |
| `technical/build-and-deployment.md`   | Partiel : rollback et observabilité à compléter                     |
| `technical/external-integrations.md`  | Rempli ; délais et reprises non documentés                          |
| `development/getting-started.md`      | Rempli                                                              |
| `development/code-style.md`           | Rempli                                                              |
| `development/naming-conventions.md`   | Rempli (conventions observées)                                      |
| `development/git-workflow.md`         | Rempli                                                              |
| `development/error-handling.md`       | Partiel : contrat d'erreur HTTP par catégorie à définir             |
| `development/logging.md`              | Partiel : outil de journalisation structurée à choisir              |
| `development/security.md`             | Partiel : autorisation et données personnelles à compléter          |
| `quality/testing-strategy.md`         | Rempli                                                              |
| `quality/tdd.md`                      | Rempli                                                              |
| `quality/code-review.md`              | Rempli (générique)                                                  |
| `quality/definition-of-done.md`       | Rempli                                                              |
| `business/README.md`                  | Rempli                                                              |
| `business/modèle-du-domaine.md`       | Partiel : invariants et relations à compléter par l'équipe          |
| `business/règles-métiers.md`          | Squelette : à compléter par l'équipe                                |
| `business/use-cases/`                 | Squelette : aucun cas d'utilisation rédigé                          |
