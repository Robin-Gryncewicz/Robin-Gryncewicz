import { v4 as uuidv4 } from 'uuid';
import {
  Order,
  OrderItem,
  OrderStatus,
  CreateOrderRequest,
  OrderValidationResult,
  PaymentDetails,
  PaymentMethod
} from './types';

/**
 * OrderService - Handles payment order processing
 */
export class OrderService {
  private _orders: Map<string, Order>;
  private readonly _defaultCurrency: string;

  /**
   * Creates a new OrderService instance
   * @param defaultCurrency Default currency for orders (default: 'USD')
   */
  constructor(defaultCurrency: string = 'USD') {
    this._orders = new Map<string, Order>();
    this._defaultCurrency = defaultCurrency;
  }

  /**
   * Creates a new order
   * @param request The order creation request
   * @returns The created order object
   */
  public createOrder(request: CreateOrderRequest): Order {
    const now = Date.now();
    const totalAmount = this.calculateTotalAmount(request.items);

    const order: Order = {
      id: uuidv4(),
      userId: request.userId,
      items: request.items,
      status: OrderStatus.PENDING,
      totalAmount,
      currency: request.currency || this._defaultCurrency,
      createdAt: now,
      updatedAt: now,
      metadata: request.metadata
    };

    this._orders.set(order.id, order);
    return order;
  }

  /**
   * Retrieves an order by ID
   * @param orderId The order ID to retrieve
   * @returns The order or undefined if not found
   */
  public getOrder(orderId: string): Order | undefined {
    return this._orders.get(orderId);
  }

  /**
   * Retrieves all orders for a user
   * @param userId The user ID
   * @returns Array of orders for the user
   */
  public getUserOrders(userId: string): Order[] {
    return Array.from(this._orders.values())
      .filter(order => order.userId === userId);
  }

  /**
   * Updates the status of an order
   * @param orderId The order ID to update
   * @param status The new status
   * @returns The updated order or undefined if not found
   */
  public updateOrderStatus(orderId: string, status: OrderStatus): Order | undefined {
    const order = this._orders.get(orderId);
    
    if (!order) {
      return undefined;
    }

    order.status = status;
    order.updatedAt = Date.now();
    this._orders.set(orderId, order);

    return order;
  }

  /**
   * Processes payment for an order
   * @param orderId The order ID
   * @param paymentDetails The payment details
   * @returns A validation result indicating success or failure
   */
  public async processPayment(
    orderId: string,
    paymentDetails: PaymentDetails
  ): Promise<OrderValidationResult> {
    const order = this._orders.get(orderId);

    if (!order) {
      return { valid: false, error: 'Order not found' };
    }

    if (order.status !== OrderStatus.PENDING) {
      return { valid: false, error: 'Order is not in pending status' };
    }

    if (paymentDetails.amount !== order.totalAmount) {
      return { valid: false, error: 'Payment amount does not match order total' };
    }

    if (paymentDetails.currency !== order.currency) {
      return { valid: false, error: 'Payment currency does not match order currency' };
    }

    try {
      // Update order with payment details
      order.paymentDetails = {
        ...paymentDetails,
        paymentDate: Date.now()
      };
      order.status = OrderStatus.PROCESSING;
      order.updatedAt = Date.now();
      this._orders.set(orderId, order);

      // Simulate payment processing
      // In a real implementation, this would integrate with a payment gateway
      await this.simulatePaymentProcessing();

      // Mark as completed
      order.status = OrderStatus.COMPLETED;
      order.updatedAt = Date.now();
      this._orders.set(orderId, order);

      return { valid: true, order };
    } catch (error) {
      // Mark as failed
      order.status = OrderStatus.FAILED;
      order.updatedAt = Date.now();
      this._orders.set(orderId, order);

      return { valid: false, error: 'Payment processing failed' };
    }
  }

  /**
   * Cancels an order
   * @param orderId The order ID to cancel
   * @returns A boolean indicating if the cancellation was successful
   */
  public cancelOrder(orderId: string): boolean {
    const order = this._orders.get(orderId);

    if (!order) {
      return false;
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.REFUNDED) {
      return false;
    }

    order.status = OrderStatus.CANCELLED;
    order.updatedAt = Date.now();
    this._orders.set(orderId, order);

    return true;
  }

  /**
   * Refunds an order
   * @param orderId The order ID to refund
   * @returns A validation result indicating success or failure
   */
  public async refundOrder(orderId: string): Promise<OrderValidationResult> {
    const order = this._orders.get(orderId);

    if (!order) {
      return { valid: false, error: 'Order not found' };
    }

    if (order.status !== OrderStatus.COMPLETED) {
      return { valid: false, error: 'Only completed orders can be refunded' };
    }

    if (!order.paymentDetails) {
      return { valid: false, error: 'No payment details found for refund' };
    }

    try {
      // Simulate refund processing
      await this.simulateRefundProcessing();

      order.status = OrderStatus.REFUNDED;
      order.updatedAt = Date.now();
      this._orders.set(orderId, order);

      return { valid: true, order };
    } catch (error) {
      return { valid: false, error: 'Refund processing failed' };
    }
  }

  /**
   * Validates an order
   * @param orderId The order ID to validate
   * @returns A validation result
   */
  public validateOrder(orderId: string): OrderValidationResult {
    const order = this._orders.get(orderId);

    if (!order) {
      return { valid: false, error: 'Order not found' };
    }

    if (order.items.length === 0) {
      return { valid: false, error: 'Order has no items' };
    }

    if (order.totalAmount <= 0) {
      return { valid: false, error: 'Invalid order total amount' };
    }

    return { valid: true, order };
  }

  /**
   * Calculates the total amount for order items
   * @param items The order items
   * @returns The total amount
   */
  private calculateTotalAmount(items: OrderItem[]): number {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  }

  /**
   * Simulates payment processing (for demonstration purposes)
   * In a real implementation, this would integrate with a payment gateway
   */
  private async simulatePaymentProcessing(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  /**
   * Simulates refund processing (for demonstration purposes)
   * In a real implementation, this would integrate with a payment gateway
   */
  private async simulateRefundProcessing(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }
}
