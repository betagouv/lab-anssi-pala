export const VERSION_PRF = 1;

// Contexte lié à la dérivation de la KEK qui protège la clé privée d'une identité.
export const infoProtectionClePrivee = (keyId: string): string =>
  `pala:v1:x25519-private-key:${keyId}`;

// AAD liant le contenu chiffré à son identifiant de document et sa version.
export const aadDocument = (documentId: string): string =>
  `document:v1:${documentId}`;

// Contexte HPKE liant une enveloppe au document et au destinataire.
export const infoEnveloppe = (documentId: string, keyId: string): string =>
  `document:v1:${documentId}:${keyId}`;
