---
name: hexagonal-architecture
description: À utiliser lors de la création ou modification d'un cas d'utilisation, d'un port, d'un adaptateur ou d'une interaction avec une infrastructure.
---

# Architecture hexagonale

## 1. Objectif

Isoler le cœur métier et applicatif des technologies et systèmes externes.

## 2. Principes fondamentaux

- Le cœur applicatif ne dépend pas des infrastructures.
- Les interactions avec l'extérieur passent par des ports.
- Les adaptateurs traduisent les protocoles et modèles externes.
- Les détails techniques restent remplaçables.
- Les dépendances du code pointent vers l'intérieur.

## 3. Règles obligatoires

- Définir les ports du côté du composant interne qui en a besoin.
- Placer les implémentations techniques dans l'infrastructure.
- Ne pas importer Express, PostgreSQL ou un SDK externe dans les cas d'utilisation.
- Ne pas placer de règles métier dans les contrôleurs.
- Définir les abstractions de persistance au niveau approprié.
- Traduire explicitement les données aux frontières.

## 4. Exemple de flux

Une requête Express appelle un contrôleur, qui invoque un cas d'utilisation. Celui-ci utilise un port de persistance. Un adaptateur PostgreSQL implémente ce port. Le contrôleur transforme le résultat en réponse HTTP.

## 5. Méthode d'application

1. Identifier le cas d'utilisation.
2. Définir les besoins du cœur applicatif.
3. Définir les ports nécessaires.
4. Implémenter les adaptateurs.
5. Assembler les dépendances dans le Composition Root.
6. Tester le cœur sans démarrer l'infrastructure.
7. Tester les adaptateurs séparément.

## 6. Anti-patterns

- Importer Express dans un cas d'utilisation.
- Importer un client PostgreSQL dans le domaine.
- Utiliser directement un ORM depuis une entité métier.
- Faire dépendre le cœur de l'infrastructure.
- Placer de la logique métier dans un adaptateur.

## 7. Critères de validation

Le domaine et les cas d'utilisation peuvent être testés sans démarrer Express ou PostgreSQL.

## 8. Références

- `../../../../documentation/architecture`
- `../../../../documentation/architecture`
