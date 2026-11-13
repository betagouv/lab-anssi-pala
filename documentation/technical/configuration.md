# Configuration

## Principes

La configuration dépendante de l'environnement est externalisée. Les valeurs sensibles ne sont jamais versionnées.

## Environnements

- Développement
- Test
- Préproduction
- Production

[Décrire les différences et les mécanismes de chargement.]

## Validation

Valider la configuration au démarrage. Échouer explicitement si une variable obligatoire est absente ou invalide.

## Source de vérité

Les noms et valeurs par défaut doivent rester cohérents avec les fichiers de configuration du dépôt.
