import { Product } from './product';

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  size?: string;
  vendor: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  _id: string;
  user?: string; // User ID
  guestId?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  status: 'cart' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  shippingAddress: ShippingAddress;
  orderNumber?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
}
