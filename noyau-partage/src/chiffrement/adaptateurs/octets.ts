// Copie les octets dans un ArrayBuffer neuf : WebCrypto attend un `BufferSource`
// adossé à un ArrayBuffer (et non un ArrayBufferLike, qui pourrait être partagé).
export const versArrayBuffer = (octets: Uint8Array): ArrayBuffer => {
  const copie = new ArrayBuffer(octets.byteLength);
  new Uint8Array(copie).set(octets);
  return copie;
};
