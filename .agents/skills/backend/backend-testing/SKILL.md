---
name: backend-testing
description: À utiliser pour créer ou modifier les tests unitaires, d'intégration et API du backend.
---

# Tests backend

## Règles

- Tester le domaine sans infrastructure lorsque possible.
- Tester les cas d'utilisation avec des ports substituables.
- Tester les adaptateurs avec les vraies dépendances de test lorsque cela apporte une garantie utile.
- Utiliser une base de test isolée pour les tests PostgreSQL.
- Vérifier les contrats HTTP et les scénarios d'erreur.
- Éviter les tests dépendants de l'ordre ou de données partagées.

## Méthode

1. Identifier la couche et le comportement.
2. Choisir le niveau de test adapté.
3. Préparer les doublures ou ressources isolées.
4. Écrire les scénarios nominaux et limites.
5. Exécuter la suite ciblée puis les tests de régression.
