# ADR 0001 — Expliciter l'origine de l'erreur dans le message de scan publié sur le bus

- **Statut :** Proposé — **décision non prise**. Orientation privilégiée : option **(b)**. **Non implémenté.**
- **Date :** 2026-10-19
- **Portée :** `codex-security` (événement `ScanTermine`, `LanceScan`) et `composition/notificationScan`.

> Cet ADR fige une proposition et le raisonnement qui l'accompagne. Aucune ligne de code
> n'a été écrite : l'implémentation attend une décision explicite. On a seulement convenu de
> l'**orientation (b)** ci-dessous, sans la réaliser.

---

## Contexte

En fin de scan, un compte rendu est publié sur le bus d'événements (`ScanTermine`) puis posté
sur Mattermost par `composition/notificationScan`. Quand un scan échoue, ce message indique
« ❌ Scan terminé » **sans expliquer pourquoi**. L'origine de l'échec n'est accessible que dans
le journal du scan ou les logs CI.

### Diagnostic : où naissent les erreurs aujourd'hui

Il existe **deux modes d'échec**, traités très différemment :

1. **Exceptions avant le scan** (`PrepareExecutionCodex.#verifiePrerequis`) : CLI absente,
   `CIBLE` non défini, cible manquante, proxy LiteLLM injoignable. Elles sont **levées** et
   remontent jusqu'à la CLI → **rien n'est publié sur le bus**. Mattermost reste muet, l'erreur
   n'existe que dans le log / la CI.

2. **Le scan tourne mais renvoie un code non nul** (`statut !== 0`) : `LanceScan` publie
   `ScanTermine` avec `resultat: 'Échec'`. Le message Mattermost affiche « ❌ Scan terminé »
   **sans aucune cause** — juste le coût et le nombre de constats (0).

La cause réelle d'un échec de type 2 est dans le **journal** du scan (`sortie.journal` =
stdout + stderr du sous-processus `codex-security`, cf. `lanceCommande` qui fait l'équivalent
d'un `2>&1 | tee`). `LanceScan` lit déjà ce journal (pour l'estimation du coût). Le code de
sortie seul (`number`) ne porte aucun détail.

---

## Options envisagées

Le NB d'origine parle de « l'origine de l'erreur **sur le message publié sur le bus** ». Deux
ampleurs possibles :

- **(a) Minimal** — enrichir seulement le message d'un **scan réellement lancé qui échoue**
  (mode 2). Colle au NB au plus près, changement contenu.

- **(b) Étendu** — couvrir **aussi les échecs avant scan** (mode 1 : CLI / cible / proxy),
  aujourd'hui totalement silencieux sur Mattermost, en capturant l'exception dans `LanceScan`
  pour publier un `ScanTermine` en échec avec l'origine (le message d'exception). C'est là que
  le gain est le plus fort (les pannes d'infra ne remontent nulle part), mais c'est plus
  intrusif : ça touche le flux d'exceptions et le code de sortie.

**Orientation retenue (sans décision finale ni implémentation) : (b)**, car c'est le cas
réellement aveugle aujourd'hui.

---

## Proposition détaillée (retranscription intégrale)

**1. Modéliser le résultat du scan avec son origine (domaine).**
Aujourd'hui `resultat: 'Succès' | 'Échec'` est un simple littéral. On propose un type somme qui
rend explicite qu'« un échec a toujours une origine » :

```ts
type ResultatDeScan = { statut: 'Succès' } | { statut: 'Échec'; origine: string };
```

Porté par l'événement `ScanTermine` (en remplacement du champ `resultat` actuel).

**2. Extraire l'origine depuis le journal (fonction de domaine, pure et testable).**
Une fonction `origineDeLErreur(journal: string, codeSortie: number): string` qui condense la
cause : par ex. la dernière ligne significative mentionnant une erreur (HTTP 4xx/5xx du
fournisseur via LiteLLM, refus du modèle, violation du bac à sable…), avec repli sur les
dernières lignes non vides et un plafond de longueur. Heuristique simple, couverte en TDD, et
facile à faire évoluer quand on connaîtra mieux les formats d'erreur de `codex-security`.

**3. `LanceScan`** : quand `statut !== 0`, lit le journal (déjà disponible), en extrait
l'origine, et la place dans l'événement.

**4. `notificationScan`** : quand `statut === 'Échec'`, ajoute une section « **Origine :** … »
au message Mattermost.

### Spécificité de l'option (b)

Pour couvrir les échecs **avant** le scan (mode 1), `LanceScan` capture les exceptions de
`PrepareExecutionCodex` (CLI absente, cible manquante, proxy injoignable) et, au lieu de les
laisser remonter silencieusement, publie un `ScanTermine` en échec dont l'`origine` est le
message de l'exception. Cela implique de décider du **code de sortie** retourné dans ce cas
(propagation de l'échec vs code dédié) — point à préciser au moment de l'implémentation.

---

## Conséquences / impacts

- **Tests :** changer la forme de `resultat` touche `lanceScan.spec.ts` et la fabrique
  `unScanTermine`. La fonction d'extraction `origineDeLErreur` sera testée en TDD.
  `notificationScan` reste de la glue non testée unitairement, comme convenu.
- **Flux d'exceptions (option b) :** `LanceScan` cesse de laisser remonter certaines
  exceptions telles quelles ; il faut vérifier que la CLI et la cinématique retournent toujours
  un code de sortie cohérent.
- **Détail d'extraction :** le journal peut contenir des codes ANSI / être verbeux →
  l'extraction nettoie et tronque.

---

## À décider avant implémentation

1. Valider (ou non) l'option **(b)** par rapport à **(a)**.
2. Valider le type somme `ResultatDeScan` (origine portée par l'échec) plutôt qu'un simple
   champ optionnel `origine?`.
3. Choisir le code de sortie des échecs « avant scan » republiés (option b).
