import fetch from 'node-fetch';
import { context, trace, SpanStatusCode } from '@opentelemetry/api';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalCost: number;
  createdAt: string;
}

export async function createOrder(items: OrderItem[]): Promise<Order> {
  // Create a new span for the order creation process
  const tracer = trace.getTracer('service-a');
  
  return tracer.startActiveSpan('create-order', async (span) => {
    try {
      // Generate a random order ID
      const orderId = `order-${Math.random().toString(36).substr(2, 9)}`;
      
      // Call service B to calculate the total cost
      const totalCost = await calculateOrderCost(items);
      
      const order: Order = {
        id: orderId,
        items,
        totalCost,
        createdAt: new Date().toISOString(),
      };
      
      span.setAttributes({
        'order.id': orderId,
        'order.items.count': items.length,
        'order.total.cost': totalCost,
      });
      
      console.log(`Order created: ${orderId} with total cost: ${totalCost}`);
      
      return order;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}

async function calculateOrderCost(items: OrderItem[]): Promise<number> {
  // Create a new span for the cost calculation request
  const tracer = trace.getTracer('service-a');
  
  return tracer.startActiveSpan('calculate-cost-request', async (span) => {
    try {
      const serviceBUrl = process.env.SERVICE_B_URL || 'http://service-b:3000';
      const response = await fetch(`${serviceBUrl}/calculate-cost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate cost: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const cost = result.totalCost;

      span.setAttributes({
        'http.method': 'POST',
        'http.url': `${serviceBUrl}/calculate-cost`,
        'http.status_code': response.status,
        'cost.result': cost,
      });

      return cost;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}