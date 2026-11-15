# Modèle de domaine

## Domaines et sous-domaines

### Scan

Toute la gestion du scan de vulnérabilité se fait dans la partie `outillage` du projet :

- `bootstrap` : Initie l'environnement pour effectuer un scan :
  - Tire le repo codex-security
  - Tire le repo shannon
  - Installe codex-security
  - Installe shannon
  - Copie le repo de la cible à scanner
- `coût` : Estime le coût d'un scan
- `génère l'environnement` : Génère les variables d'environnement nécessaires à Shannon
- `génère la configuration` : Génère les fichiers de configuration nécessaire pour la cible
- `génère la configuration du proxy` : Génère les fichiers de configuration nécessaire pour le proxy LLM
- `démarre proxy` : Lance le proxy LLM
- `scan` :
  - Effectue le scan d'une cible
  - Publie les événements de scan terminé / non effectué
  - Estime le coût du scan
- `test de pénétration (pen-test)` : Effectue un test de pénétration sur la cible avec Shannon

### Gestion des utilisateurs

Toute la partie utilisateur est gérée côté serveur :

- `serveur/back/src/enrolement`

## Concepts

[Décrire les entités, objets-valeurs, agrégats, services et événements.]

### Agrégats :

- Scan : Représente un scan avec ces informations et son rapport généré
- Utilisateur : Utilisateur de PALA souhaitant avoir accès aux scans

### Objets-valeurs :

- Rapport : Représente le rapport généré par un scan
- Destinataire : Personne identifiée comme destinataire d'un rapport

### Ports et services :

- `outillage/src/noyau/ports/SystemeDeFichier.ts` : Permet de lire et écrire des fichiers sur un système de fichiers cible. Il est utilisé pour générer des fichiers de config et lire des résultats de rapport
- `outillage/src/noyau/ports/BusEvenements.ts` : Permet de publier des événements et de les écouter. Il est utilisé pour notifier lorsqu'un scan est terminé
- `outillage/src/messagerie/domaine/messagerieInstantanee.ts` : Permet d'envoyer des messages instantanés par exemple à la fin d'un scan pour partager le rapport
- `noyau-partage/src/chiffrement/application/serviceDeChiffrement.ts` : Permet d'effectuer le chiffrement et le déchiffrement du rapport de scan

### Événements :

- `SCAN_TERMINÉ` (`outillage/src/codex-security/domaine/scanTermine.ts`) : un scan s'est achevé, en succès ou en échec ; porte le coût, les constats et le rapport
- `SCAN_NON_EFFECTUÉ` (`outillage/src/codex-security/domaine/scanNonEffectue.ts`) : le scan n'a pas été lancé car son périmètre est vide

Le vocabulaire de référence est dans le [glossaire](../project/glossary.md).

## Agrégats et invariants

| Agrégat       | Racine        | Invariants    | Frontière transactionnelle |
| ------------- | ------------- | ------------- | -------------------------- |
| [À compléter] | [À compléter] | [À compléter] | [À compléter]              |

## Relations

[Décrire les relations entre concepts et domaines.]

## Diagrammes

Un modèle C4 détaille l’architecture [ici](../architecture/architecture.md)
