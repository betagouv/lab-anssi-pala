---
name: express-development
description: À utiliser pour créer ou modifier des routes, middleware, contrôleurs et points d'entrée HTTP Express.
---

# Développement Express

## 1. Objectif

Construire une couche HTTP fine qui adapte les requêtes externes aux cas d'utilisation de l'application.

## 2. Règles

- Les routes déclarent le routage et les middlewares.
- Les contrôleurs traduisent les entrées HTTP et invoquent les cas d'utilisation.
- La validation des entrées intervient à la frontière HTTP.
- Les contrôleurs ne contiennent pas de règles métier.
- Les objets Express ne traversent pas vers le domaine.
- La gestion centralisée des erreurs suit le contrat documenté.
- Les dépendances des contrôleurs sont injectées explicitement.

## 3. Méthode

1. Identifier le contrat HTTP.
2. Définir validation, authentification et autorisation requises.
3. Identifier le cas d'utilisation appelé.
4. Implémenter route et contrôleur fins.
5. Définir les réponses et erreurs.
6. Tester le contrat et les cas pertinents.

## 4. Anti-patterns

- SQL dans les contrôleurs.
- Règles métier dans les middlewares.
- Passage de `Request` ou `Response` aux couches internes.
- Instanciation globale de services dans les routes.

## 5. Références

- `../../../../documentation/architecture`
- `../../../../documentation/development`
- `../../../../documentation/quality`
