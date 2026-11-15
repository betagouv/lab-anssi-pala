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

- `noyau-partage` ne dépend d'aucun autre paquet.
- `outillage` et `serveur/back` dépendent de `noyau-partage`, jamais l'un de l'autre.
- `serveur/front` ne dépend que de `noyau-partage`.
- Dans `outillage`, tout module peut dépendre de `noyau` ; seul `composition/` connaît les
  implémentations concrètes de tous les modules.
- La réaction à la fin d'un scan passe par le bus d'événements, pas par un appel direct.

L'inventaire des dépendances constatées est dans `module-organization.md`.

## 4. Vérification automatique

Aucune vérification automatique n'existe : ni règle ESLint de frontières, ni test d'architecture. Le respect des règles repose sur la revue de code.

## 5. Exceptions

Toute exception doit être justifiée, limitée et documentée, idéalement par un ADR.
