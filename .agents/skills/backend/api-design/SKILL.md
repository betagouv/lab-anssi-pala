---
name: api-design
description: À utiliser lors de la création ou modification d'un endpoint, d'un contrat HTTP ou d'un échange entre frontend et backend.
---

# Conception d'API

## Règles

- Définir des contrats explicites et cohérents.
- Distinguer DTO d'entrée, modèle métier et représentation de sortie.
- Valider les entrées à la frontière.
- Utiliser des codes HTTP appropriés.
- Définir un format d'erreur stable.
- Documenter pagination, tri, filtres et règles d'idempotence lorsqu'ils s'appliquent.
- Ne pas exposer directement les entités ou modèles de persistance.
- Préserver la compatibilité ou documenter les changements incompatibles.

## Méthode

1. Décrire le besoin et le consommateur.
2. Définir méthode, chemin, paramètres et corps.
3. Définir réponses nominales et erreurs.
4. Vérifier autorisation et validation.
5. Documenter et tester le contrat.

## Références

[OpenAPI ou autre documentation d'API à préciser.]
