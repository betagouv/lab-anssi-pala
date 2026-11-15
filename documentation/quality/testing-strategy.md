# Stratégie de tests

## Objectifs

Les tests vérifient les comportements et protègent les invariants. La couverture chiffrée ne remplace pas la pertinence des scénarios.

## Types de tests

- Unitaires : comportements du domaine et composants applicatifs isolés.
- Intégration : interactions entre composants techniques, adaptateurs et PostgreSQL.
- API / fonctionnels : contrats HTTP et cas d'utilisation.
- End-to-end : parcours représentatifs traversant l'application. Aucun test de ce type n'existe à ce jour.

## Principes

- Tester les comportements observables.
- Garder les tests déterministes et indépendants.
- Ne pas utiliser la base de production.
- Isoler les systèmes externes lorsque nécessaire.
- Ne pas utiliser de mocks de bibliothèque (`vi.mock`, `vi.fn`, `vi.spyOn`) : écrire les doublures
  à la main, comme implémentations des ports, dans `test/doubles/`.
- Ne pas écrire de test dédié pour un utilitaire trivial : il est couvert par les tests de ses
  consommateurs.
- Tester les cas nominaux, limites et erreurs pertinentes.

## Outils et commandes

- Framework : Vitest, configuré à la racine (`vitest.config.ts`).
- Emplacement : `<paquet>/test/`, en miroir de `src/`, fichiers `*.spec.ts`. Paquets couverts :
  `outillage`, `serveur/back`, `noyau-partage`.
- Cas d'utilisation : instanciés avec des doublures (`SystemeDeFichierEnMemoire`, `HorlogeFigee`,
  `ReseauSimule`…).
- HTTP : `supertest` sur l'application Express, via `serveur/back/test/testeurPALA.ts`.
- Persistance : tests d'entrepôts sur un PostgreSQL réel (`BASE_DONNEES_URL`), migrations appliquées.
- Front : aucun test automatisé ; seul `svelte-check` est disponible.

```bash
pnpm run test                                        # toute la suite
pnpm exec vitest run outillage/test/codex-security   # un dossier
pnpm exec vitest outillage/test/cout                 # mode surveillance
```
