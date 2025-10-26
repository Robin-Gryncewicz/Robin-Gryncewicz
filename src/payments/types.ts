/**
 * Payment and order related type definitions
 */

export interface Order {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export interface OrderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface CreateOrderRequest {
  userId: string;
  items: OrderItem[];
  currency?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  orderId: string;
  transactionId?: string;
  error?: string;
}

export interface PaymentGateway {
  processPayment(order: Order): Promise<PaymentResult>;
  refundPayment(orderId: string): Promise<boolean>;
  getPaymentStatus(orderId: string): Promise<OrderStatus>;
}
