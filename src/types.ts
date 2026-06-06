export type UserRole = "buyer" | "seller" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  username: string;
  createdAt: any; // Firestore Timestamp
  status: "active" | "pending_approval" | "rejected";
  sellerName?: string;
  sellerDescription?: string;
  sellerWhatsApp?: string;
  sellerPayChanguPublicKey?: string;
  earnings?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  stock: number;
  sellerId: string;
  sellerName: string;
  averageRating: number;
  reviewCount: number;
  createdAt: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  sellerId: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: "pending" | "paid";
  status: "pending" | "paid" | "shipped" | "delivered";
  shippingAddress: string;
  couponCode?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  buyerId: string;
  buyerName: string;
  createdAt: any;
}

export interface ChatThread {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  updatedAt: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export interface DiscountCoupon {
  id: string;
  discountPercent: number;
  active: boolean;
  createdAt: any;
}
