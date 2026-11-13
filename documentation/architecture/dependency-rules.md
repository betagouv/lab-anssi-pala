# Règles de dépendances

## 1. Règle générale

Les dépendances de code doivent pointer vers les abstractions et les couches internes. Les détails techniques sont branchés depuis la périphérie.

## 2. Matrice indicative

| Depuis / vers  |                     Domaine |                     Application |        Infrastructure | Présentation |
| -------------- | --------------------------: | ------------------------------: | --------------------: | -----------: |
| Domaine        |                         Oui |                             Non |                   Non |          Non |
| Application    |                         Oui |                             Oui | Non (implémentations) |          Non |
| Infrastructure |          Oui, selon contrat | Oui, pour implémenter les ports |                   Oui |          Non |
| Présentation   | Non directement si possible |      Oui, via cas d'utilisation |       Non directement |          Oui |

Cette matrice doit être adaptée aux conventions précises du dépôt. Les imports de types et les contrats publics doivent être traités explicitement.

## 3. Règles intermodules

[Décrire les dépendances autorisées entre modules et les mécanismes de communication.]

## 4. Vérification automatique

[Préciser les outils éventuels : règles ESLint, tests d'architecture, analyse des dépendances.]

## 5. Exceptions

Toute exception doit être justifiée, limitée et documentée, idéalement par un ADR.
