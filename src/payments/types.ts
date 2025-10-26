/**
 * Payment related type definitions
 */

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CRYPTO = 'CRYPTO'
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentDetails {
  method: PaymentMethod;
  transactionId?: string;
  paymentDate?: number;
  amount: number;
  currency: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  paymentDetails?: PaymentDetails;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export interface CreateOrderRequest {
  userId: string;
  items: OrderItem[];
  currency?: string;
  metadata?: Record<string, any>;
}

export interface OrderValidationResult {
  valid: boolean;
  order?: Order;
  error?: string;
}
