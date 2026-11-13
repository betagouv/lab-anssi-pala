# Catalogue des Skills

Les skills décrivent des compétences et procédures spécialisées. Le format canonique du dépôt est un fichier `SKILL.md` avec un frontmatter YAML simple (`name`, `description`) et des sections explicites.

## Architecture

| Skill                                 | Quand l'utiliser                            |
| ------------------------------------- | ------------------------------------------- |
| `architecture/domain-driven-design`   | Modélisation et règles métier               |
| `architecture/hexagonal-architecture` | Ports, adaptateurs et frontières techniques |
| `architecture/clean-layer-separation` | Création ou refactoring de composants       |
| `architecture/dependency-injection`   | Déclaration et assemblage des dépendances   |

## Développement

| Skill                                 | Quand l'utiliser                           |
| ------------------------------------- | ------------------------------------------ |
| `development/test-driven-development` | Création ou modification d'un comportement |
| `development/code-conventions`        | Écriture ou modification de code           |
| `development/french-language`         | Toutes les interventions                   |
| `development/error-handling`          | Gestion et propagation des erreurs         |

## Frontend

| Skill                         | Quand l'utiliser     |
| ----------------------------- | -------------------- |
| `frontend/svelte-development` | Développement Svelte |
| `frontend/frontend-testing`   | Tests frontend       |

## Backend

| Skill                         | Quand l'utiliser                  |
| ----------------------------- | --------------------------------- |
| `backend/express-development` | Routes, middleware et contrôleurs |
| `backend/api-design`          | Contrats HTTP                     |
| `backend/backend-testing`     | Tests backend                     |

## Base de données

| Skill                             | Quand l'utiliser        |
| --------------------------------- | ----------------------- |
| `database/postgresql-development` | Persistance et requêtes |
| `database/database-migrations`    | Évolution du schéma     |

## Règles de découverte

- Les skills transversales s'appliquent à toutes les tâches concernées.
- Plusieurs skills peuvent être combinées.
- Une skill complète les instructions générales, elle ne les remplace pas.
- Les règles du projet et les ADR acceptés prévalent sur les exemples génériques.
- Les agents qui ne découvrent pas automatiquement les skills doivent être configurés via un adaptateur.
