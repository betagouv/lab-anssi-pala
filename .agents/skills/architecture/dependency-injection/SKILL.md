---
name: dependency-injection
description: À utiliser lors de la création ou modification de composants ayant besoin de repositories, services, clients techniques ou autres dépendances.
---

# Injection de dépendances par constructeur

## 1. Objectif

Rendre les dépendances explicites, remplaçables et faciles à tester.

## 2. Principe

Toute dépendance indispensable au fonctionnement d'une classe est fournie par son constructeur.

## 3. Règles obligatoires

- Injecter les dépendances par constructeur.
- Dépendre d'interfaces ou de contrats lorsque cela apporte un découplage utile.
- Éviter d'instancier des dépendances concrètes dans le domaine et l'application.
- Ne pas utiliser de singleton global ou de Service Locator.
- Ne pas rendre facultative une dépendance indispensable.
- Assembler les implémentations dans le Composition Root.

## 4. Exemple

```typescript
interface UtilisateurRepository {
  trouverParId(id: string): Promise<Utilisateur | null>;
}

class ConsulterUtilisateur {
  constructor(private readonly utilisateurs: UtilisateurRepository) {}

  async executer(id: string): Promise<Utilisateur | null> {
    return this.utilisateurs.trouverParId(id);
  }
}
```

Le cas d'utilisation connaît le contrat, pas PostgreSQL.

## 5. Composition Root

```typescript
const utilisateurRepository = new UtilisateurPostgresRepository(database);

const consulterUtilisateur = new ConsulterUtilisateur(utilisateurRepository);
```

Le point d'assemblage concret est à définir dans l'organisation réelle du projet.

## 6. Anti-patterns

- Instancier un repository dans un service métier.
- Importer une connexion globale depuis un module partagé.
- Accéder à un conteneur de dépendances partout dans le code.
- Cacher des dépendances dans des utilitaires globaux.

## 7. Critères de validation

Les dépendances indispensables sont explicites et les composants peuvent être instanciés avec des doublures de test.
