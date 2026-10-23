export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export type NewProduct = Omit<Product, 'id' | 'rating'>;

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderLine {
  productId: number;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  orderNumber: string;
  placedAt: string;
  lines: OrderLine[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shipping: ShippingDetails;
  status?: 'new' | 'seen';
  emailPreviewUrl?: string | null;
}

export interface OrderNotification {
  sent: boolean;
  previewUrl: string | null;
}

export interface AccountProfile {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}
