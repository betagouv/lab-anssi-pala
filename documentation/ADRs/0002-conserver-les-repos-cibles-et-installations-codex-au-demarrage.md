# ADR 0002 — Conserver les repos cibles et installations Codex au démarrage

- **Statut :** Proposé — **décision non prise**.
- **Date :** 2026-10-19
- **Portée :** Déploiement de PALA sur Clever Cloud.

---

## Contexte

Lorsque PALA est déployé ou démarré sur Clever Cloud, les projets cibles ainsi que l’installation des outils préalablement existants
ne sont pas conservés. Cela a comme incidence de retirer sans cesse l’intégralité des repo cible et de reconstruire 
la chaine d’outils Codex Security.

--- 

### Diagnostic

Le fait que l’application Clever Cloud soit de type task (ce qui nous semble le plus adapté étant donné que les scans 
ont pour vocation à être effectués à intervalles réguliers de plusieurs jours), implique que lorsqu’un scan est lancé, 
un entrepôt git ciblé lors d’un précédent scan est retiré intégralement. Il en va de même pour Codex Security (et Shannon)
qui est retiré et rebuildé. Cela consomme de la ressource et du temps.

---


## Proposition détaillée (retranscription intégrale)

Aucune proposition à l’heure actuelle :
- application toujours active (plus une tâche mais un serveur express => justifié pour une tâche ponctuelle ?) ?
- mettre en place un cellar (ça demande beaucoup de changements surtout pour les outils Codex et Shannon ) ?
- autre ?

---

## Conséquences / impacts

Dépend de la proposition choisie.
