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

[Décrire les types d'erreur, codes applicatifs et format des réponses HTTP.]
