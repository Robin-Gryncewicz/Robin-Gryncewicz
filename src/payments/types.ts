/**
 * Payment related type definitions
 */

export enum PaymentStatus {
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
  CRYPTOCURRENCY = 'CRYPTOCURRENCY'
}

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  currency: string;
  cardLast4?: string;
  transactionId?: string;
  paymentGateway?: string;
}

export interface Order {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentDetails?: PaymentDetails;
  items?: OrderItem[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderRequest {
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  items?: OrderItem[];
}

export interface OrderProcessingResult {
  success: boolean;
  order?: Order;
  error?: string;
}
