# Enrôlement d'un destinataire

L'enrôlement crée l'identité cryptographique d'une personne : une paire de clés X25519 dont la clé privée n'existe en clair que dans le navigateur. Elle est stockée chiffrée, et seule la YubiKey de la personne permet de la rouvrir (extension WebAuthn PRF).

```mermaid
sequenceDiagram
    autonumber
    actor U as Personne
    participant N as Navigateur
    participant K as YubiKey (WebAuthn + PRF)
    participant S as Serveur PALA
    participant B as Postgres

    Note over U,S: Étape 1 : enregistrement de l'appareil
    U->>N: Saisit son nom
    N->>S: POST /enrolement/enregistrement/demarrage
    S-->>N: options WebAuthn + défi (contexte en session)
    N->>K: startRegistration(options)
    K-->>N: credential (identifiant d'appareil)
    N->>S: POST /enrolement/enregistrement/finalisation
    S->>S: Vérifie la réponse et le défi
    S-->>N: 201 identifiant de l'appareil

    Note over U,B: Étape 2 : identité cryptographique
    N->>S: POST /enrolement/authentification/demarrage
    S-->>N: options d'authentification + nouveau défi
    N->>N: Tire prfSalt et hkdfSalt (32 octets aléatoires), keyId (UUID)
    N->>K: startAuthentication(options + PRF eval(prfSalt))
    K->>U: Demande le code PIN et le toucher
    U-->>K: PIN + toucher
    K-->>N: secret PRF + assertion
    N->>N: KEK = HKDF(secret PRF, hkdfSalt, "pala:v1:x25519-private-key:keyId")
    N->>N: Génère la paire X25519
    N->>N: clé privée chiffrée = AES-GCM(clé privée, KEK)

    Note over N,B: Étape 3 : finalisation
    N->>S: POST /enrolement/finalisation (assertion + enveloppe)
    S->>S: Vérifie l'assertion et le compteur
    S->>B: Persiste nom, appareil, enveloppe
    S-->>N: keyId
```

L'enveloppe envoyée au serveur contient :

| Champ               | Contenu                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| `keyId`             | identifiant de la clé, lié à la KEK et aux enveloppes de rapport                   |
| `clePublique`       | clé publique X25519, utilisée par l'outillage pour chiffrer                        |
| `clePriveeChiffree` | clé privée chiffrée en AES-GCM par la KEK (`iv` + `ciphertext`)                    |
| `prf`               | `salt` PRF, `hkdfSalt` et version : de quoi redemander le même secret à la YubiKey |

## Qui peut déchiffrer ?

- **Le serveur et la base** détiennent la clé publique et la clé privée chiffrée, mais jamais la KEK : le secret PRF ne sort pas de la YubiKey. Ils ne peuvent pas ouvrir la clé privée.
- **La personne enrôlée** est la seule à pouvoir la rouvrir : il faut sa YubiKey physique, son code PIN et un geste de présence.
- Perdre la YubiKey fait perdre l'accès aux rapports chiffrés pour cette identité : il n'existe pas de recouvrement par le serveur.
- Un enrôlement ne donne accès qu'aux rapports chiffrés **après** lui (voir [le chiffrement](./chiffrement.md)).

## Code

- Cas d'usage `EnroleUtilisateur` : [`noyau-partage/src/chiffrement/application/EnroleUtilisateur.ts`](../../noyau-partage/src/chiffrement/application/EnroleUtilisateur.ts)
- Étapes côté navigateur : [`serveur/front/src/enrolement/etapesEnrolement.ts`](../../serveur/front/src/enrolement/etapesEnrolement.ts)
- Étapes et routes côté serveur : [`serveur/back/src/enrolement/etapesEnrolement.ts`](../../serveur/back/src/enrolement/etapesEnrolement.ts), [`serveur/back/src/http/routeEnrolement.ts`](../../serveur/back/src/http/routeEnrolement.ts)
