# Présentation générale du projet

> Synthèse établie à partir du `README.md`, de `../business/README.md` et de `../demarche.md` :
> à valider par l'équipe.

## 1. Objectifs

PALA (Pentest agentique, Lab ANSSI) est une expérimentation du Lab ANSSI. Elle met à disposition
des outils d'audit de sécurité pilotés par des agents LLM, sur une cible fournie par l'utilisateur.

- Aider les équipes à sécuriser leurs applications en alliant découverte, preuve et correction.
- Analyser des bases de code qui évoluent quotidiennement, par des scans automatisés à
  intervalles réguliers sur les fichiers récemment modifiés.
- Mesurer ce que ces outils trouvent réellement, à quel coût et en combien de temps.

## 2. Utilisateurs et parties prenantes

| Partie prenante                     | Besoin                                                     |
| ----------------------------------- | ---------------------------------------------------------- |
| Auditeur sécurité                   | Lancer scans et pentests sur une cible, lire les résultats |
| Équipe de développement d'une cible | Être informée rapidement des vulnérabilités potentielles   |
| Équipe du Lab ANSSI                 | Développer et exploiter PALA, évaluer outils et modèles    |

## 3. Périmètre

### Inclus

- Analyse statique agentique avec Codex Security, automatisable en une commande.
- Pentest agentique dynamique avec Shannon, lancé manuellement.
- Estimation du coût, enregistrement des scans, compte rendu sur Mattermost.
- Interface web : enrôlement des utilisateurs en vue de la consultation des rapports.

### Exclus

- Le dépôt ne contient aucun résultat d'audit, aucune cible, aucun identifiant.
- Le pentest n'est pas automatisé : ses scénarios dépendent des résultats de l'analyse statique.
- Aucun pentest contre un environnement de production.

Le détail est dans `functional-scope.md`.

## 4. Enjeux et contraintes

- **Coût et contexte** : un périmètre trop large dégrade les résultats et consomme beaucoup de
  tokens ; les scans portent sur des périmètres réduits.
- **Sécurité** : les outils manipulent du code et, pour Shannon, agissent réellement sur une
  application.
- **Fiabilité des résultats** : un constat reste une piste tant qu'il n'est pas confirmé ; une
  relecture humaine demeure nécessaire.

Voir `constraints.md`.

## 5. Vocabulaire

Le vocabulaire métier de référence est centralisé dans `glossary.md`.
