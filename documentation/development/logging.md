# Journalisation

## Principes

- Utiliser une journalisation structurée.
- Ne jamais journaliser de secrets ou données sensibles sans justification et protection.
- Inclure un identifiant de corrélation lorsque pertinent.
- Distinguer les niveaux de journalisation.
- Ne pas utiliser les logs comme mécanisme de communication métier.

## Format et outil

État actuel :

- CLI : le port `Console` (`outillage/src/noyau/ports/Console.ts`), implémenté par `ConsoleNode`
  et doublé en test par `ConsoleEnMemoire`. Le code applicatif n'appelle pas `console` directement.
- Serveur : `console.log`, `console.warn` et `console.error`, en texte libre. Les adresses IP
  sont masquées dans les messages de limitation de trafic.
- Scans : le journal de chaque scan (sorties standard et d'erreur de Codex Security) est écrit
  dans `resultats/brut/codex-security/` (non versionné).
- Destination : sortie standard, collectée par Clever Cloud en DEMO.

Aucune bibliothèque de journalisation structurée ni identifiant de corrélation n'est en place :
les deux premiers principes ci-dessus sont une cible, pas un état.

[À compléter : bibliothèque retenue, format, niveaux et rétention.]
