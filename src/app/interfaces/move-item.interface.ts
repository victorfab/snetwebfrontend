export interface MoveItem<T> {
  id: string;
  description: string;
  amount: string;
  selected?: boolean;
  fullItem: T;
}
