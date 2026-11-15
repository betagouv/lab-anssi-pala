---
name: clean-layer-separation
description: À utiliser lors de la création, modification ou refactorisation de composants afin de séparer les responsabilités et respecter SOLID.
---

# Séparation des couches et principes SOLID

## 1. Objectif

Limiter le couplage, clarifier les responsabilités et rendre les composants testables et évolutifs.

## 2. Principes SOLID

- **S — Single Responsibility** : une responsabilité principale et une raison cohérente de changer.
- **O — Open/Closed** : permettre l'extension sans multiplier les modifications du comportement existant.
- **L — Liskov Substitution** : une implémentation respecte le contrat de l'abstraction.
- **I — Interface Segregation** : préférer des interfaces ciblées aux interfaces imposant des méthodes inutiles.
- **D — Dependency Inversion** : les composants de haut niveau dépendent d'abstractions.

## 3. Répartition indicative

- Domaine : règles métier et invariants.
- Application : orchestration des cas d'utilisation.
- Infrastructure : intégrations et détails techniques.
- Présentation : interactions avec utilisateurs et systèmes externes.

## 4. Règles

- Ne pas mélanger les responsabilités métier, techniques et de présentation.
- Rendre les dépendances explicites.
- Définir des interfaces cohérentes avec les besoins de leurs consommateurs.
- Ne créer une abstraction que si elle répond à un besoin identifiable.
- Préserver les contrats lors des refactorings.

## 5. Anti-patterns

- Classes « fourre-tout ».
- Contrôleurs contenant de la logique applicative ou métier.
- Services applicatifs contenant toutes les règles métier.
- Interfaces génériques artificielles.
- Héritage utilisé uniquement pour partager du code.
- Dépendances cachées.

## 6. Critères de validation

Chaque composant possède une responsabilité identifiable, des dépendances maîtrisées et une justification cohérente.
