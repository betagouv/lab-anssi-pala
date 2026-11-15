# Gestion des erreurs

## Catégories

Distinguer au minimum :

- erreurs métier attendues ;
- erreurs de validation ;
- erreurs d'autorisation ;
- erreurs techniques et d'infrastructure ;
- erreurs inattendues.

## Principes

- Ne pas masquer une erreur.
- Ne pas exposer de détails internes ou secrets à l'utilisateur.
- Préserver le contexte utile au diagnostic dans les logs.
- Traduire les erreurs techniques en réponses adaptées à la frontière HTTP.
- Ne pas coupler le domaine aux statuts ou objets d'erreur Express.

## Contrats

### CLI

- Une erreur de prérequis ou d'exécution est levée (`Error` avec un message en français qui
  indique la correction à apporter) et remonte jusqu'à l'adaptateur de ligne de commande, qui
  l'affiche et renvoie un code de sortie non nul.
- `codex:scan-complet` poursuit sur les cibles suivantes lorsqu'une cible échoue ; son code de
  sortie est le nombre de cibles en échec.
- Un scan lancé qui échoue publie `SCAN_TERMINÉ` avec `resultat: 'Échec'`. L'explicitation de
  l'origine de l'échec est l'objet de l'[ADR 0001](../architecture/decisions/ADR-0001-expliciter-origine-erreur-message-scan.md),
  non décidé.

### Serveur

- Les routes d'enrôlement répondent `400 { "erreur": "<message>" }` pour toute erreur levée
  (`intercepteErreurs` de `http/routeEnrolement.ts`).
- Le dépassement de la limite de trafic répond `429` sans corps.
- Une configuration invalide empêche le démarrage.

[À compléter : types d'erreur distincts par catégorie et codes HTTP associés — le serveur ne
distingue pas encore erreurs de validation, d'autorisation et erreurs inattendues.]
