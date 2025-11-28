import { OrderService } from '../src/payments/OrderService';
import { OrderStatus, CreateOrderRequest, PaymentGateway, PaymentResult } from '../src/payments/types';

class MockPaymentGateway implements PaymentGateway {
  public async processPayment(): Promise<PaymentResult> {
    return { success: true, orderId: 'test-order' };
  }

  public async refundPayment(): Promise<boolean> {
    return true;
  }

   public async getPaymentStatus(): Promise<OrderStatus> {
     return OrderStatus.COMPLETED;
   }
}

describe('OrderService', () => {
  it('creates an order with correct totals and defaults', () => {
    const service = new OrderService();
    const request: CreateOrderRequest = {
      userId: 'user-1',
      currency: 'EUR',
      items: [
        { productId: 'p1', quantity: 1, unitPrice: 10, totalPrice: 10 } as any,
        { productId: 'p2', quantity: 2, unitPrice: 5, totalPrice: 10 } as any
      ]
    };

    const order = service.createOrder(request);

    expect(order.userId).toBe('user-1');
    expect(order.amount).toBe(20);
    expect(order.currency).toBe('EUR');
    expect(order.status).toBe(OrderStatus.PENDING);
    expect(order.items).toHaveLength(2);
  });

  it('processes a payment successfully via payment gateway', async () => {
    const gateway = new MockPaymentGateway();
    const service = new OrderService(gateway);

    const request: CreateOrderRequest = {
      userId: 'user-2',
      items: [
        { productId: 'p1', quantity: 1, unitPrice: 100, totalPrice: 100 } as any
      ]
    };

    const order = service.createOrder(request);
    const result = await service.processPayment(order.id);

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('test-order');
    const updatedOrder = service.getOrder(order.id);
    expect(updatedOrder?.status).toBe(OrderStatus.COMPLETED);
  });

  it('fails payment when order does not exist', async () => {
    const gateway = new MockPaymentGateway();
    const service = new OrderService(gateway);

    const result = await service.processPayment('non-existent');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Order not found');
  });

  it('does not cancel completed or refunded orders', () => {
    const service = new OrderService();
    const request: CreateOrderRequest = {
      userId: 'user-3',
      items: [
        { productId: 'p1', quantity: 1, unitPrice: 50, totalPrice: 50 } as any
      ]
    };

    const order = service.createOrder(request);

    service.updateOrderStatus(order.id, OrderStatus.COMPLETED);
    const cancelCompleted = service.cancelOrder(order.id);

    expect(cancelCompleted).toBe(false);

    service.updateOrderStatus(order.id, OrderStatus.REFUNDED);
    const cancelRefunded = service.cancelOrder(order.id);

    expect(cancelRefunded).toBe(false);
  });
});
