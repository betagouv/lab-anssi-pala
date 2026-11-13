---
name: test-driven-development
description: À utiliser lors de l'implémentation ou de la modification d'un comportement, d'une règle métier ou d'un cas d'utilisation.
---

# Test-Driven Development

## 1. Objectif

Concevoir le comportement attendu avant son implémentation et le vérifier automatiquement.

## 2. Cycle

1. **RED** : écrire un test représentatif et vérifier qu'il échoue pour la bonne raison.
2. **GREEN** : écrire le minimum de code nécessaire pour le faire réussir.
3. **REFACTOR** : améliorer la conception sans changer le comportement.

## 3. Règles

- Le test exprime un comportement attendu.
- Tester les comportements observables plutôt que les détails internes.
- Couvrir les cas nominaux, limites et erreurs pertinentes.
- Éviter les mocks excessifs.
- Ne pas supprimer ou affaiblir un test pour faire passer artificiellement une implémentation.
- Conserver les tests verts pendant le refactoring.
- Adapter la démarche aux tâches où un cycle TDD n'a pas de sens, par exemple une modification purement documentaire.

## 4. Méthode

1. Identifier un scénario précis.
2. Écrire le test.
3. Exécuter le test et observer l'échec.
4. Implémenter le comportement minimal.
5. Exécuter le test.
6. Refactoriser.
7. Exécuter l'ensemble des tests pertinents.

## 5. Critères de validation

Les comportements modifiés disposent de tests adaptés et les tests concernés passent.
