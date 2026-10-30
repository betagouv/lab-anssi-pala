export interface Entrepot<T> {
  persiste: (element: T) => Promise<void>;
  lis: (identifiant: string) => Promise<T>;
}
