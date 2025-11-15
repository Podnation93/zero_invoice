export interface Item {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemFormData {
  name: string;
  description: string;
  unitPrice: string;
}
