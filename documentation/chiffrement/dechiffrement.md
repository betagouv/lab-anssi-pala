# Déchiffrement du rapport

Le déchiffrement se fait uniquement dans le navigateur de la personne destinataire, avec sa YubiKey. Le serveur ne fait que transmettre le rapport chiffré et les enveloppes.

```mermaid
sequenceDiagram
    autonumber
    actor L as Lecteur
    participant N as Navigateur
    participant K as YubiKey (WebAuthn + PRF)
    participant S as Serveur PALA
    participant B as Postgres

    L->>N: Ouvre /rapports/:id
    N->>S: GET /scans/:id
    S->>B: Lit le scan (rapport chiffré)
    S->>B: Lit les utilisateurs des keyId du rapport
    S-->>N: cible, date, rapport chiffré, destinataires (appareil + enveloppe d'identité)
    N->>N: Défi aléatoire, sel PRF de chaque destinataire (evalByCredential)
    N->>K: startAuthentication(allowCredentials = appareils des destinataires)
    K->>L: Demande le code PIN et le toucher
    L-->>K: PIN + toucher
    alt la YubiKey n'est celle d'aucun destinataire
        K-->>N: Erreur
        N-->>L: Accès impossible
    else la YubiKey est celle d'un destinataire
        K-->>N: identifiant d'appareil + secret PRF
        N->>N: Retrouve le destinataire et son enveloppe de rapport
        N->>N: KEK = HKDF(secret PRF, hkdfSalt, "pala:v1:x25519-private-key:keyId")
        N->>N: clé privée = AES-GCM.ouvre(clé privée chiffrée, KEK)
        N->>N: DEK = HPKE.open(clé privée, enveloppe, info "document:v1:scanId:keyId")
        N->>N: rapport = AES-GCM.ouvre(document, DEK, AAD "document:v1:scanId")
        N-->>L: Affiche le rapport
    end
```

Le secret PRF, la clé privée et la DEK n'existent qu'en mémoire du navigateur, le temps de la lecture. Rien n'est renvoyé au serveur.

## Qui peut déchiffrer ?

Il faut réunir trois conditions :

1. avoir été enrôlé **avant** la fin du scan, pour disposer d'une enveloppe dans le rapport ;
2. posséder la YubiKey enregistrée lors de l'enrôlement ;
3. fournir son code PIN et un geste de présence.

Ne peuvent pas déchiffrer :

- le serveur, la base de données et l'outillage : aucun ne détient de clé privée déverrouillable ;
- une personne enrôlée après le scan ;
- quelqu'un qui connaît l'URL du rapport mais n'a pas de YubiKey destinataire : la route renvoie les données chiffrées, qui restent illisibles.

Les trois pages se lisent dans l'ordre : [enrôlement](./enrolement.md), [chiffrement](./chiffrement.md), déchiffrement.

## Code

- Étapes côté navigateur : [`serveur/front/src/rapport/etapesDechiffrement.ts`](../../serveur/front/src/rapport/etapesDechiffrement.ts)
- Cas d'usage : [`DeverrouilleClePrivee`](../../noyau-partage/src/chiffrement/application/DeverrouilleClePrivee.ts) et [`DechiffreDocument`](../../noyau-partage/src/chiffrement/application/DechiffreDocument.ts)
- Ressource serveur : [`serveur/back/src/http/routeScans.ts`](../../serveur/back/src/http/routeScans.ts)
