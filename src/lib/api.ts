
import { toast } from "sonner";

const API_BASE_URL = "http://45.77.171.162:3000";

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  status: number;
  data: {
    token: string;
    id: number;
    role_id: number;
    name: string;
  };
}

interface UserData {
  username: string;
  password: string;
  email: string;
  name: string;
  image?: string;
  role_id: number;
}

interface ProductData {
  id: number;
  name: string;
  price: number;
  category_id: number;
  description: string;
  image: string;
  created_at: string;
  updated_at: string;
}

interface CategoryData {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  product_id: number;
  quantity: number;
}

interface OrderData {
  user_id: number;
  orders: OrderItem[];
}

interface OrderResponse {
  id: number;
  reference: string;
  user_id: number;
  total: number;
  created_at: string;
  updated_at: string;
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  data?: any,
  isMultipart: boolean = false
): Promise<T> {
  const token = localStorage.getItem("posToken");
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = token;
  }

  let body: any = undefined;

  if (data) {
    if (isMultipart) {
      body = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          body.append(key, value as string | Blob);
        }
      });
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    toast.error(`API Error: ${(error as Error).message}`);
    throw error;
  }
}

// Auth Services
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>("/login", "POST", credentials);
  localStorage.setItem("posToken", response.data.token);
  localStorage.setItem("posUser", JSON.stringify(response.data));
  return response;
}

export async function register(userData: UserData) {
  return apiRequest("/register", "POST", userData, true);
}

export function logout() {
  localStorage.removeItem("posToken");
  localStorage.removeItem("posUser");
  localStorage.removeItem("posCart");
}

export function getCurrentUser() {
  const userStr = localStorage.getItem("posUser");
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
}

// Products Services
export async function getProducts(params?: string) {
  const queryParams = params ? `?${params}` : "";
  return apiRequest<{ code: number; data: ProductData[] }>(`/products${queryParams}`);
}

export async function getProductById(id: number) {
  return apiRequest<{ code: number; data: ProductData }>(`/products/${id}`);
}

export async function createProduct(productData: Partial<ProductData>) {
  return apiRequest("/products", "POST", productData, true);
}

export async function updateProduct(id: number, productData: Partial<ProductData>) {
  return apiRequest(`/products/${id}`, "PUT", productData, true);
}

export async function deleteProduct(id: number) {
  return apiRequest(`/products/${id}`, "DELETE");
}

// Categories Services
export async function getCategories() {
  return apiRequest<{ code: number; data: CategoryData[] }>("/categories");
}

export async function getCategoryById(id: number) {
  return apiRequest<{ code: number; data: CategoryData }>(`/categories/${id}`);
}

export async function createCategory(name: string) {
  return apiRequest("/categories", "POST", { name });
}

export async function updateCategory(id: number, name: string) {
  return apiRequest(`/categories/${id}`, "PUT", { name });
}

export async function deleteCategory(id: number) {
  return apiRequest(`/categories/${id}`, "DELETE");
}

// Orders Services
export async function getOrders() {
  return apiRequest<{ code: number; data: OrderResponse[] }>("/orders");
}

export async function getOrderById(id: number) {
  return apiRequest<{ code: number; data: OrderResponse }>(`/orders/${id}`);
}

export async function getOrderItems(orderId: number) {
  return apiRequest(`/orders/${orderId}/items`);
}

export async function createOrder(orderData: OrderData) {
  return apiRequest<{ code: number; data: OrderResponse }>("/orders", "POST", orderData);
}

export async function deleteOrder(id: number) {
  return apiRequest(`/orders/${id}`, "DELETE");
}
