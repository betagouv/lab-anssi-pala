# Docker et environnement de développement

## Objectifs

Docker permet de disposer d'un environnement reproductible.

## Services

| Service    | Image / build | Port          | Volume        | Rôle        |
| ---------- | ------------- | ------------- | ------------- | ----------- |
| Backend    | [À compléter] | [À compléter] | [À compléter] | API         |
| Frontend   | [À compléter] | [À compléter] | [À compléter] | Interface   |
| PostgreSQL | [À compléter] | [À compléter] | [À compléter] | Persistance |

## Règles

- Ne pas intégrer de secrets dans les images.
- Persister les données locales lorsque nécessaire.
- Définir des healthchecks pour les services qui le nécessitent.
- Distinguer les configurations de développement et de production.
- Rendre les migrations reproductibles.

## Commandes

[Documenter les commandes réelles pour démarrer, arrêter, reconstruire et consulter les logs.]
