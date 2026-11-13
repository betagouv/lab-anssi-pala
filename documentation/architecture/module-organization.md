# Organisation des modules

## 1. Principe

Organiser le code autour des capacités et domaines fonctionnels plutôt qu'autour des seuls types techniques de fichiers.

Chaque module doit :

- avoir une responsabilité clairement définie ;
- encapsuler ses règles et détails internes ;
- exposer un contrat public maîtrisé ;
- limiter les dépendances vers les autres modules ;
- être testable indépendamment autant que possible.

## 2. Structure indicative d'un module backend

```text
nom-module/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── aggregates/
│   ├── services/
│   ├── events/
│   └── repositories/
├── application/
│   ├── use-cases/
│   ├── ports/
│   └── dto/
├── infrastructure/
│   ├── persistence/
│   ├── repositories/
│   └── external-services/
├── presentation/
│   ├── controllers/
│   ├── routes/
│   ├── validators/
│   └── presenters/
└── index.ts
```

Cette structure est indicative : ne pas créer systématiquement tous les dossiers si le module n'en a pas besoin.

## 3. Inventaire réel des modules

| Module | Responsabilité | Sous-modules | Dépendances autorisées | Contrat public      |
| ------ | -------------- | ------------ | ---------------------- | ------------------- |
| [Nom]  | [Rôle]         | [Liste]      | [Modules]              | [Entrées publiques] |

## 4. Communication intermodules

Les interactions utilisent des contrats explicites : interfaces, ports, événements ou API applicatives. Un module ne doit pas accéder directement aux détails internes d'un autre.

## 5. Dépendances interdites

- accès direct aux tables d'un autre module ;
- import de classes internes non exposées ;
- appel direct à un repository interne d'un autre domaine ;
- dépendances circulaires ;
- partage de fichiers privés entre modules.
