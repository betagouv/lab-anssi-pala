export interface PaireDeClesAsymetriques {
  genere(): Promise<CryptoKeyPair>;
  exportePublique(cle: CryptoKey): Promise<Uint8Array>;
  exportePrivee(cle: CryptoKey): Promise<Uint8Array>;
  importePublique(octets: Uint8Array): Promise<CryptoKey>;
  importePrivee(octets: Uint8Array): Promise<CryptoKey>;
}
