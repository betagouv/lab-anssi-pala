# Démarche

Ce document décrit la **méthode** suivie pour évaluer des outils d'audit agentiques avec des
modèles souverains. Il reste volontairement général : il ne contient ni résultat de scan, ni nom de
projet audité, ni détail de vulnérabilité.

## 1. Objectif

Mesurer ce que des outils d'audit pilotés par LLM trouvent réellement, à quel coût et en combien de
temps, en restant dans un **circuit souverain** (modèles servis par Albert — DINUM — et Scaleway).
La question pratique : ces outils méritent-ils d'être intégrés à un audit continu, et dans quelle
combinaison ?

## 2. Choix et préparation des outils

- Un dossier par outil (`outils/<outil>/`), le code amont isolé en sous-module et jamais modifié,
  les patchs locaux réappliqués de façon idempotente par le bootstrap.
- La cible est clonée hors du dépôt, dans `cible/copies/<nom>` ; un outil qui écrit travaille sur
  une copie, jamais sur le dépôt de référence.

## 3. Branchement des modèles

C'est l'étape qui demande le plus de mise au point, et les enseignements portent sur les **modèles
et les fournisseurs**, pas sur les cibles :

- Adapter les protocoles d'API : un proxy local traduit _Responses_ ↔ _Chat Completions_ quand
  l'outil et le fournisseur ne parlent pas le même dialecte, et confine la clé du fournisseur.
- Vérifier les deux capacités qui décident de la compatibilité : les **appels d'outils en plusieurs
  tours** et, si le flux l'impose, la **sortie JSON contrainte par schéma**. Elles varient
  indépendamment d'un modèle à l'autre.
- Imposer au besoin les paramètres d'échantillonnage et `tool_choice` que l'outil ne transmet pas.
- À modèle égal, **le fournisseur pèse autant que le modèle** : débit, cache, stabilité de service
  et réglages par défaut changent la qualité et le coût effectifs.

## 4. Analyse statique

Scan de code agentique sur un périmètre cadré, puis **validation** d'un point précis en le
confrontant au code. Rapide et bon marché ; sert à débroussailler. L'analyse statique ne prouve
rien dynamiquement : elle produit des pistes à confirmer.

## 5. Test dynamique

Pentest agentique contre une instance **jetable** en marche, avec un compte de test et une base
jetable. L'exploitation réelle filtre une partie des faux positifs de l'analyse statique et atteint
des classes de problèmes hors de portée d'une lecture de code à fichier unique.

## 6. Contrôle négatif

Rejouer le même scan sur une version corrigée du code : un bon outil cesse alors de signaler le
point corrigé, sans faux positif résiduel. Utile pour distinguer un vrai régresseur d'un bruit
d'outil.

## 7. Lecture critique des résultats

- Un rapport marqué « exploité » n'est fiable qu'après **rejeu indépendant** d'un échantillon des
  preuves : le jugement d'impact reste celui du modèle.
- Biais récurrent observé : un modèle plaque un motif de vulnérabilité générique sans vérifier la
  bibliothèque, le protocole ou le modèle de domaine réellement en jeu. Une relecture humaine du
  code cité reste nécessaire.
- Le volume de findings n'est pas un indicateur de qualité : un fort taux de faux positifs dilue
  l'intérêt d'un outil.

## 8. Comparaison et industrialisation

Comparer les outils de façon **qualitative** (qualité du résultat et du raisonnement, coût, temps,
robustesse), sans transposer de chiffres liés à une cible particulière. L'outillage a ensuite été
porté en TypeScript (Node 24.22.1, architecture hexagonale, tests avec doubles) pour rendre les
lancements reproductibles et agnostiques du fournisseur.

## Enseignement d'ensemble

La combinaison la plus efficace observée : **cadrer vite et pour pas cher avec l'analyse statique,
puis faire prouver les cas sérieux par le test dynamique** sur instance jetable. Les traces
détaillées de chaque exploration restent privées, hors de ce dépôt.
