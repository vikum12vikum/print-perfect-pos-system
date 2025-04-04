
export interface User {
  id: number;
  role_id: number;
  name: string;
  token: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  description: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  reference: string;
  user_id: number;
  total: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}
