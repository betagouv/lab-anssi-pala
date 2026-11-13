# Base de données PostgreSQL

## Responsabilités

PostgreSQL assure la persistance des données relationnelles.

## Schéma

[Documenter les schémas, tables, relations et conventions réelles.]

## Accès aux données

- L'accès SQL est confiné aux adaptateurs d'infrastructure.
- Le domaine ne dépend pas du schéma relationnel.
- Les conversions entre persistance et objets métier sont explicites.
- Les transactions sont définies à un niveau cohérent avec les invariants métier.

## Migrations

[Préciser l'outil, les conventions de nommage, l'ordre d'exécution et la stratégie de retour arrière.]

## Index et contraintes

[Documenter les contraintes d'intégrité, index et choix importants.]

## Tests

[Décrire l'instance et les données de test.]
