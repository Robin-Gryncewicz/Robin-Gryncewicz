import { v4 as uuidv4 } from 'uuid';
import {
  Order,
  OrderProcessingResult,
  CreateOrderRequest,
  PaymentStatus,
  PaymentDetails
} from './types';

/**
 * Service for handling payment order operations
 */
export class OrderService {
  private _orders: Map<string, Order>;
  private _paymentGateway?: any;

  constructor(paymentGateway?: any) {
    this._orders = new Map<string, Order>();
    this._paymentGateway = paymentGateway;
  }

  /**
   * Creates a new payment order
   * @param request The order creation request
   * @returns The processing result with the created order or error
   */
  public async createOrder(request: CreateOrderRequest): Promise<OrderProcessingResult> {
    try {
      const now = Date.now();
      const order: Order = {
        id: uuidv4(),
        userId: request.userId,
        amount: request.amount,
        currency: request.currency,
        status: PaymentStatus.PENDING,
        paymentDetails: {
          method: request.paymentMethod,
          amount: request.amount,
          currency: request.currency
        },
        items: request.items,
        createdAt: now,
        updatedAt: now
      };

      this._orders.set(order.id, order);
      
      return {
        success: true,
        order
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order'
      };
    }
  }

  /**
   * Retrieves an order by ID
   * @param orderId The order ID
   * @returns The order or undefined if not found
   */
  public getOrder(orderId: string): Order | undefined {
    return this._orders.get(orderId);
  }

  /**
   * Retrieves all orders for a specific user
   * @param userId The user ID
   * @returns Array of orders for the user
   */
  public getUserOrders(userId: string): Order[] {
    return Array.from(this._orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Updates the status of an order
   * @param orderId The order ID
   * @param status The new status
   * @param paymentDetails Optional payment details to update
   * @returns A boolean indicating if the update was successful
   */
  public updateOrderStatus(
    orderId: string,
    status: PaymentStatus,
    paymentDetails?: Partial<PaymentDetails>
  ): boolean {
    const order = this._orders.get(orderId);
    
    if (!order) {
      return false;
    }

    order.status = status;
    order.updatedAt = Date.now();

    if (paymentDetails) {
      order.paymentDetails = {
        ...order.paymentDetails!,
        ...paymentDetails
      };
    }

    if (status === PaymentStatus.COMPLETED) {
      order.completedAt = Date.now();
    }

    this._orders.set(orderId, order);
    return true;
  }

  /**
   * Processes payment for an order
   * @param orderId The order ID
   * @returns The processing result
   */
  public async processPayment(orderId: string): Promise<OrderProcessingResult> {
    try {
      const order = this._orders.get(orderId);
      
      if (!order) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      if (order.status !== PaymentStatus.PENDING) {
        return {
          success: false,
          error: `Cannot process order with status: ${order.status}`
        };
      }

      // Update status to processing
      this.updateOrderStatus(orderId, PaymentStatus.PROCESSING);

      // Simulate payment processing
      // In a real implementation, this would call the payment gateway
      if (this._paymentGateway) {
        // Call payment gateway
        // const result = await this._paymentGateway.processPayment(order);
      }

      // Update to completed
      this.updateOrderStatus(orderId, PaymentStatus.COMPLETED, {
        transactionId: uuidv4()
      });

      const updatedOrder = this._orders.get(orderId);
      
      return {
        success: true,
        order: updatedOrder
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Update order to failed status
      this.updateOrderStatus(orderId, PaymentStatus.FAILED);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Cancels an order
   * @param orderId The order ID
   * @returns A boolean indicating if the cancellation was successful
   */
  public cancelOrder(orderId: string): boolean {
    const order = this._orders.get(orderId);
    
    if (!order) {
      return false;
    }

    // Can only cancel pending or failed orders
    if (order.status !== PaymentStatus.PENDING && order.status !== PaymentStatus.FAILED) {
      return false;
    }

    return this.updateOrderStatus(orderId, PaymentStatus.CANCELLED);
  }

  /**
   * Gets orders by status
   * @param status The payment status to filter by
   * @returns Array of orders with the specified status
   */
  public getOrdersByStatus(status: PaymentStatus): Order[] {
    return Array.from(this._orders.values())
      .filter(order => order.status === status)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Gets the total count of orders
   * @returns The total number of orders
   */
  public getOrderCount(): number {
    return this._orders.size;
  }
}
