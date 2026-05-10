export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  description: string;
  imageUrl: string;
  stockQuantity: number;
  tubeColor: string;
  cardBgColor: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  expiresAt: string;
}

export interface CheckoutRequest {
  items: { productId: number; quantity: number }[];
  shippingAddress: string;
  city: string;
  country: string;
  zipCode: string;
}

export interface OrderResponse {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}
