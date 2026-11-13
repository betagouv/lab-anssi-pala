# Stratégie de tests

## Objectifs

Les tests vérifient les comportements et protègent les invariants. La couverture chiffrée ne remplace pas la pertinence des scénarios.

## Types de tests

- Unitaires : comportements du domaine et composants applicatifs isolés.
- Intégration : interactions entre composants techniques, adaptateurs et PostgreSQL.
- API / fonctionnels : contrats HTTP et cas d'utilisation.
- End-to-end : parcours représentatifs traversant l'application.

## Principes

- Tester les comportements observables.
- Garder les tests déterministes et indépendants.
- Ne pas utiliser la base de production.
- Isoler les systèmes externes lorsque nécessaire.
- Éviter les mocks excessifs.
- Tester les cas nominaux, limites et erreurs pertinentes.

## Outils et commandes

[Préciser les frameworks de test et commandes réelles.]
