import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus, CreateOrderRequest, OrderItem, PaymentGateway, PaymentResult } from './types';

/**
 * Service for handling payment order processing
 */
export class OrderService {
  private _orders: Map<string, Order>;
  private _paymentGateway?: PaymentGateway;
  
  constructor(paymentGateway?: PaymentGateway) {
    this._orders = new Map<string, Order>();
    this._paymentGateway = paymentGateway;
  }
  
  /**
   * Creates a new order
   * @param request The order creation request
   * @returns The created order object
   */
  public createOrder(request: CreateOrderRequest): Order {
    const now = Date.now();
    const totalAmount = request.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    const order: Order = {
      id: uuidv4(),
      userId: request.userId,
      amount: totalAmount,
      currency: request.currency || 'USD',
      status: OrderStatus.PENDING,
      items: request.items,
      createdAt: now,
      updatedAt: now,
      metadata: request.metadata
    };
    
    this._orders.set(order.id, order);
    return order;
  }
  
  /**
   * Retrieves an order by ID
   * @param orderId The ID of the order to retrieve
   * @returns The order or undefined if not found
   */
  public getOrder(orderId: string): Order | undefined {
    return this._orders.get(orderId);
  }
  
  /**
   * Retrieves all orders for a specific user
   * @param userId The ID of the user
   * @returns Array of orders for the user
   */
  public getUserOrders(userId: string): Order[] {
    return Array.from(this._orders.values())
      .filter(order => order.userId === userId);
  }
  
  /**
   * Processes payment for an order
   * @param orderId The ID of the order to process
   * @returns Payment result
   */
  public async processPayment(orderId: string): Promise<PaymentResult> {
    const order = this._orders.get(orderId);
    
    if (!order) {
      return {
        success: false,
        orderId,
        error: 'Order not found'
      };
    }
    
    if (order.status !== OrderStatus.PENDING) {
      return {
        success: false,
        orderId,
        error: `Order cannot be processed in ${order.status} status`
      };
    }
    
    // Update order status to processing
    this.updateOrderStatus(orderId, OrderStatus.PROCESSING);
    
    try {
      if (!this._paymentGateway) {
        throw new Error('Payment gateway not configured');
      }
      
      const result = await this._paymentGateway.processPayment(order);
      
      if (result.success) {
        this.updateOrderStatus(orderId, OrderStatus.COMPLETED);
      } else {
        this.updateOrderStatus(orderId, OrderStatus.FAILED);
      }
      
      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      this.updateOrderStatus(orderId, OrderStatus.FAILED);
      
      return {
        success: false,
        orderId,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }
  
  /**
   * Updates the status of an order
   * @param orderId The ID of the order to update
   * @param status The new status
   * @returns Boolean indicating if the update was successful
   */
  public updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    const order = this._orders.get(orderId);
    
    if (!order) {
      return false;
    }
    
    order.status = status;
    order.updatedAt = Date.now();
    this._orders.set(orderId, order);
    
    return true;
  }
  
  /**
   * Cancels an order
   * @param orderId The ID of the order to cancel
   * @returns Boolean indicating if the cancellation was successful
   */
  public cancelOrder(orderId: string): boolean {
    const order = this._orders.get(orderId);
    
    if (!order) {
      return false;
    }
    
    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.REFUNDED) {
      return false;
    }
    
    return this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
  }
  
  /**
   * Refunds an order
   * @param orderId The ID of the order to refund
   * @returns Boolean indicating if the refund was successful
   */
  public async refundOrder(orderId: string): Promise<boolean> {
    const order = this._orders.get(orderId);
    
    if (!order) {
      return false;
    }
    
    if (order.status !== OrderStatus.COMPLETED) {
      return false;
    }
    
    try {
      if (!this._paymentGateway) {
        throw new Error('Payment gateway not configured');
      }
      
      const refunded = await this._paymentGateway.refundPayment(orderId);
      
      if (refunded) {
        this.updateOrderStatus(orderId, OrderStatus.REFUNDED);
      }
      
      return refunded;
    } catch (error) {
      console.error('Refund processing error:', error);
      return false;
    }
  }
}
