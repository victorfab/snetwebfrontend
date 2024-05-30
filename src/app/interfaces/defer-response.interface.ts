export interface DeferResponseInterface {
  date: string;
  amounts: AmountInterface[];
  message: string;
}

export interface AmountInterface {
  descripcion: string;
  total: string;
  respuesta: string;
}
