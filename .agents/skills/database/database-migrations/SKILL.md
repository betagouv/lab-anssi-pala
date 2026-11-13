---
name: database-migrations
description: À utiliser pour toute évolution du schéma PostgreSQL ou des données nécessitant une migration.
---

# Migrations de base de données

## Règles

- Utiliser l'outil de migration déjà adopté par le projet.
- Une migration versionnée est reproductible et ordonnée.
- Ne pas modifier une migration déjà appliquée dans un environnement partagé, sauf procédure explicitement définie.
- Évaluer les impacts sur les données existantes, les verrous et la disponibilité.
- Prévoir une stratégie de retour arrière lorsque cela est réaliste.
- Ne pas supprimer ou transformer des données sans validation explicite.
- Mettre à jour la documentation du schéma.

## Méthode

1. Examiner le schéma et l'historique des migrations.
2. Décrire l'évolution attendue.
3. Évaluer les risques sur les données.
4. Écrire la migration.
5. Tester l'application sur une base représentative.
6. Tester le rollback si pris en charge.
7. Documenter les éventuelles opérations manuelles.

## Outil

[À compléter : nom et version de l'outil de migration.]
