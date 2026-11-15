# Catalogue des Skills

Les skills décrivent des compétences et procédures spécialisées. Le format canonique du dépôt est un dossier par skill contenant un fichier `SKILL.md` avec un frontmatter YAML simple (`name`, `description`) et des sections explicites.

## Architecture

| Skill                    | Quand l'utiliser                            |
| ------------------------ | ------------------------------------------- |
| `domain-driven-design`   | Modélisation et règles métier               |
| `hexagonal-architecture` | Ports, adaptateurs et frontières techniques |
| `clean-layer-separation` | Création ou refactoring de composants       |
| `dependency-injection`   | Déclaration et assemblage des dépendances   |

## Développement

| Skill                     | Quand l'utiliser                           |
| ------------------------- | ------------------------------------------ |
| `test-driven-development` | Création ou modification d'un comportement |
| `code-conventions`        | Écriture ou modification de code           |
| `french-language`         | Toutes les interventions                   |
| `error-handling`          | Gestion et propagation des erreurs         |

## Frontend

| Skill                | Quand l'utiliser     |
| -------------------- | -------------------- |
| `svelte-development` | Développement Svelte |
| `frontend-testing`   | Tests frontend       |

## Backend

| Skill                 | Quand l'utiliser                  |
| --------------------- | --------------------------------- |
| `express-development` | Routes, middleware et contrôleurs |
| `api-design`          | Contrats HTTP                     |
| `backend-testing`     | Tests backend                     |

## Base de données

| Skill                    | Quand l'utiliser        |
| ------------------------ | ----------------------- |
| `postgresql-development` | Persistance et requêtes |
| `database-migrations`    | Évolution du schéma     |

## Règles de découverte

- Les skills transversales s'appliquent à toutes les tâches concernées.
- Plusieurs skills peuvent être combinées.
- Une skill complète les instructions générales, elle ne les remplace pas.
- Les règles du projet et les ADR acceptés prévalent sur les exemples génériques.
- Dans un `SKILL.md`, les chemins cités sont relatifs à la racine du dépôt.

## Structure

Chaque skill occupe un dossier à son nom, directement sous `.agents/skills`, avec un fichier `SKILL.md` : `.agents/skills/<skill>/SKILL.md`. Il n'y a pas de niveau de catégorie : les regroupements ci-dessus ne servent qu'à la lecture du catalogue.

## Découverte par les agents

`.agents/skills` est l'emplacement canonique des skills, commun à tous les agents de code. Un agent qui ne lit pas cet emplacement dispose de son propre dossier versionné à la racine (`.claude`, `.codex`…) qui pointe vers lui sans le recopier. La convention est décrite dans `AGENTS.md`.

Pour Claude Code, `.claude/skills` est un lien symbolique vers `.agents/skills`.

## Ajouter une skill

1. Créer `.agents/skills/<skill>/SKILL.md` à partir de `_templates/SKILL-template.md`.
2. L'ajouter au catalogue ci-dessus.
