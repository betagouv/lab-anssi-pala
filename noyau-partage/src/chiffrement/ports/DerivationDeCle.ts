export interface DerivationDeCle {
  deriveKek(
    secretPrf: Uint8Array,
    hkdfSalt: Uint8Array,
    info: string
  ): Promise<CryptoKey>;
}
