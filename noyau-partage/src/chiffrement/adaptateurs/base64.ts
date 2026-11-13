export type OctetsEnBase64 = string;

export const enBase64 = (octets: Uint8Array): OctetsEnBase64 =>
  btoa(String.fromCharCode(...octets));

export const octetsDepuisBase64 = (valeur: OctetsEnBase64): Uint8Array =>
  Uint8Array.from(atob(valeur), (caractere) => caractere.charCodeAt(0));
