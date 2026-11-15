---
name: postgresql-development
description: À utiliser pour créer ou modifier des requêtes, repositories, transactions, contraintes ou optimisations PostgreSQL.
---

# Développement PostgreSQL

## Règles

- Confiner les accès SQL aux adaptateurs d'infrastructure.
- Utiliser des requêtes paramétrées, via Knex.
- Étendre `EntrepotPosgres<T>` (`noyau-partage/src/entrepots/postgres/`) et convertir entité et DTO dans `mappe`.
- Définir les contraintes d'intégrité dans la base lorsqu'elles protègent réellement les données.
- Maîtriser les transactions et leur périmètre.
- Éviter de faire fuiter les modèles SQL dans le domaine.
- Examiner les plans d'exécution avant une optimisation complexe.
- Documenter les index et contraintes non évidents.
- Ne jamais exécuter de requête destructive sans vérifier le contexte et les données concernées.

## Méthode

1. Identifier le besoin métier et le contrat du repository.
2. Examiner le schéma et les migrations existantes.
3. Écrire une requête sûre et paramétrée.
4. Gérer les transactions et erreurs.
5. Tester avec PostgreSQL de test (`BASE_DONNEES_URL`, migrations appliquées par `pnpm run migration-bdd`).
6. Évaluer les performances si nécessaire.

## Références

- `documentation/technical/database.md`
- `documentation/technical/environment-variables.md`
