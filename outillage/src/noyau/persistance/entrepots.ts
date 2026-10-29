export interface Entrepot<T> {
  persiste: (element: T) => void;
  lis: (identifiant: string) => T;
}
