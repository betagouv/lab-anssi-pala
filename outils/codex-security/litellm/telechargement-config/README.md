# Téléchargement de la configuration LiteLLM depuis Cellar

Petit module Node **autonome** qui télécharge la configuration du proxy LiteLLM
depuis un bucket **Cellar (S3)** au démarrage du conteneur, via
[`@aws-sdk/client-s3`](https://www.npmjs.com/package/@aws-sdk/client-s3).

## Variables d'environnement

Lues par le module (injectées par l'add-on Cellar de Clever) :

| Variable                  | Rôle           |
|---------------------------|----------------|
| `CELLAR_ADDON_HOST`       | Hôte Cellar    |
| `CELLAR_ADDON_KEY_ID`     | Clé d'accès S3 |
| `CELLAR_ADDON_KEY_SECRET` | Secret S3      |

Les autres paramètres sont fixés en dur dans `telecharge-config.mjs` :

| Paramètre      | Valeur                          |
|----------------|---------------------------------|
| Région S3      | `eu-west-3`                     |
| Bucket         | `litellm`                       |
| Clé de l'objet | `config.yaml`                   |
| Destination    | `/app/proxy-config/config.yaml` |

## Utilisation

```bash
npm ci
npm run telecharge
node telecharge-config.mjs
```

En cas de succès, le fichier est écrit à `/app/proxy-config/config.yaml` et le
code de sortie est `0` ; en cas d'échec (variable manquante, objet introuvable…),
un message est écrit sur `stderr` et le code de sortie est `1`.

## API

Le module exporte trois fonctions (utile pour les tests) :

- `litDepuisEnvironnement()` — construit le paramétrage depuis l'environnement.
- `telechargeConfiguration(parametres)` — télécharge et écrit le fichier.
- `principal()` — enchaîne les deux (point d'entrée CLI).
