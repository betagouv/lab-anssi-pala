# Architecture générale

## 1. Principes directeurs

Le projet vise à s'appuyer sur :

- Domain-Driven Design (DDD) pour la modélisation du domaine ;
- architecture hexagonale (Ports & Adapters) pour isoler le cœur applicatif ;
- séparation des responsabilités et principes SOLID ;
- injection de dépendances par constructeur ;
- testabilité des composants et démarche TDD.

Ces principes doivent être appliqués de manière pragmatique et documentée.

## 2. Vue d'ensemble

PALA se compose d'une CLI d'audit (`outillage`), d'un serveur web (`serveur/back`) qui sert une
SPA (`serveur/front`), d'un noyau partagé (`noyau-partage`) et d'une base PostgreSQL. La CLI pilote
deux outils amont intégrés en sous-modules, Codex Security et Shannon, et un proxy LiteLLM.

- Contexte et acteurs : `system-context.md`.
- Diagrammes C4 (contexte, conteneurs, composants) : `architecture.md`.
- Paquets et modules : `module-organization.md`.
- Flux : `data-flow.md`.

## 3. Couches logiques

### Domaine

Contient les concepts et comportements métier : entités, objets-valeurs, agrégats, invariants, services et événements de domaine. Le domaine ne dépend pas des frameworks ni de l'infrastructure.

### Application

Contient les cas d'utilisation, l'orchestration, les DTO applicatifs et les ports requis par les cas d'utilisation. Elle coordonne le domaine sans absorber ses règles fondamentales.

### Infrastructure

Contient les adaptateurs techniques : persistance, clients externes, implémentations de ports et intégrations.

### Présentation

Contient les points d'entrée et de sortie : routes et contrôleurs Express, validation HTTP, sérialisation, composants et interactions Svelte. La présentation ne porte pas les règles métier.

## 4. Direction des dépendances

Les dépendances du code source pointent vers les couches internes. Le domaine ne dépend ni de l'application, ni de l'infrastructure, ni de la présentation. L'application dépend d'abstractions dont elle a besoin, pas de leurs implémentations concrètes.

## 5. Composition

Les implémentations concrètes sont assemblées dans un Composition Root explicite. Les dépendances sont transmises par constructeur.

- CLI : `outillage/src/composition/`, un fichier par commande et `dependances.ts` pour les fabriques.
- Serveur : `serveur/back/src/index.ts`.

Les cas d'utilisation reçoivent un objet `Dependances` typé dans leur constructeur.

## 6. Points à préciser

- [Architecture du frontend au-delà de la page d'accueil et de l'enrôlement]
- [Stratégie d'authentification et d'autorisation pour la consultation des rapports]
- [Gestion des transactions]
