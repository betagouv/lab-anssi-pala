export const base64urlVersOctets = (valeur: string): Uint8Array => {
  const base64 = valeur.replace(/-/g, '+').replace(/_/g, '/');
  const reste = base64.length % 4;
  const bourrage = reste === 0 ? '' : '='.repeat(4 - reste);
  const binaire = atob(base64 + bourrage);
  const octets = new Uint8Array(binaire.length);
  for (let i = 0; i < binaire.length; i += 1) octets[i] = binaire.charCodeAt(i);
  return octets;
};
