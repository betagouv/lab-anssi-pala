---
name: error-handling
description: À utiliser lors de la création ou modification d'un comportement pouvant échouer, d'une validation ou d'une frontière technique.
---

# Gestion des erreurs

## 1. Objectif

Rendre les erreurs explicites, compréhensibles et correctement propagées sans exposer de détails sensibles.

## 2. Règles

- Distinguer erreurs métier, validation, autorisation, infrastructure et erreurs inattendues.
- Ne pas masquer une erreur.
- Ne pas transformer arbitrairement une erreur technique en succès.
- Ne pas faire dépendre le domaine des objets d'erreur Express.
- Traduire les erreurs aux frontières adaptées.
- Fournir un message utilisateur sûr et un contexte de diagnostic exploitable côté serveur.
- Ne jamais exposer secrets, traces internes ou données sensibles dans une réponse HTTP.

## 3. Méthode

1. Identifier la nature et la frontière de l'erreur.
2. Déterminer si elle est attendue et récupérable.
3. Définir le contrat d'erreur approprié.
4. Propager ou traduire l'erreur sans perdre le contexte utile.
5. Tester les scénarios d'échec.

## 4. Références

- `../../../../documentation/development`
- `../../../../documentation/development`
