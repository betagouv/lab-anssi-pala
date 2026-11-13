---
name: domain-driven-design
description: À utiliser pour toute conception ou modification du modèle métier, des règles de gestion, des entités, agrégats, objets-valeurs ou interactions entre domaines.
---

# Domain-Driven Design

## 1. Objectif

Concevoir le logiciel à partir du domaine métier. Le modèle doit refléter le vocabulaire, les règles et les invariants du métier plutôt que les structures techniques.

## 2. Principes fondamentaux

- Le domaine métier est au cœur de l'application.
- Le modèle utilise un langage partagé avec les experts métier.
- Les invariants sont protégés par le modèle.
- Les frontières entre domaines et agrégats sont explicites.
- Les détails de persistance ne dictent pas le modèle métier.

## 3. Règles obligatoires

- Consulter le glossaire et les règles métier.
- Ne pas placer les règles métier dans les contrôleurs HTTP.
- Distinguer les entités métier des modèles de base de données.
- Empêcher les objets métier d'entrer dans un état invalide.
- Ne pas exposer directement les détails de persistance.
- Ne pas partager les objets internes d'un domaine sans contrat explicite.

## 4. Concepts

- **Entité** : objet défini par une identité métier.
- **Objet-valeur** : objet défini par ses attributs et l'égalité par valeur.
- **Agrégat** : frontière de cohérence autour d'invariants.
- **Racine d'agrégat** : point d'accès garantissant la cohérence de l'agrégat.
- **Repository** : abstraction de persistance d'agrégats.
- **Service de domaine** : comportement métier qui ne relève naturellement d'aucune entité.
- **Événement de domaine** : fait métier significatif qui s'est produit.

## 5. Méthode d'application

1. Comprendre le besoin métier.
2. Identifier les concepts et termes du glossaire.
3. Identifier les invariants et règles concernées.
4. Déterminer les entités, objets-valeurs et agrégats pertinents.
5. Définir les responsabilités et frontières.
6. Identifier les interactions avec les autres domaines.
7. Implémenter les comportements métier.
8. Tester les invariants et scénarios pertinents.
9. Mettre à jour la documentation métier.

## 6. Bonnes pratiques

- Utiliser un langage ubiquitaire cohérent.
- Garder les agrégats aussi petits que possible tout en protégeant leurs invariants.
- Préférer des méthodes métier exprimant l'intention.
- Documenter les décisions de modélisation importantes.

## 7. Anti-patterns

- Modèle anémique sans justification.
- Logique métier dispersée dans les services applicatifs.
- Agrégats trop volumineux.
- Accès direct aux données internes d'un autre agrégat.
- Modèle métier calqué sur le schéma SQL.
- Concepts DDD artificiels sans valeur métier.

## 8. Critères de validation

- Le modèle reflète le vocabulaire métier.
- Les invariants sont protégés.
- Les règles sont testables sans infrastructure.
- Les frontières sont explicites.
- La documentation est cohérente avec le code.

## 9. Références

- `../../../../documentation/project`
- `../../../../documentation/business`
- `../../../../documentation/business`
- `../../../../documentation/architecture`
