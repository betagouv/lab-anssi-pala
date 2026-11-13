---
name: svelte-development
description: À utiliser pour créer, modifier ou refactoriser des composants, pages, formulaires ou interactions Svelte.
---

# Développement Svelte

## 1. Objectif

Développer une interface accessible, typée, maintenable et cohérente avec les responsabilités du frontend.

## 2. Règles

- Respecter la version de Svelte et les conventions réellement configurées dans le projet.
- Garder les composants centrés sur la présentation et l'interaction.
- Ne pas y placer les règles métier du domaine.
- Isoler les appels HTTP et la gestion des données selon l'organisation frontend retenue.
- Définir des propriétés et événements typés.
- Gérer explicitement les états de chargement, succès, vide et erreur.
- Préserver l'accessibilité clavier et les attributs sémantiques.
- Éviter les composants excessivement volumineux.

## 3. Méthode

1. Examiner les composants et conventions existants.
2. Identifier les responsabilités UI et les contrats API.
3. Définir les états et interactions nécessaires.
4. Implémenter le composant en réutilisant les conventions du projet.
5. Ajouter les tests pertinents.
6. Vérifier accessibilité et comportement responsive.

## 4. Anti-patterns

- Logique métier dans le composant.
- Accès direct à PostgreSQL ou à des détails backend.
- État global introduit sans besoin explicite.
- Duplication de composants ou styles existants.

## 5. Références

- `../../../../documentation/technical`
- `../../../../documentation/development`
- `../../../../documentation/quality`
