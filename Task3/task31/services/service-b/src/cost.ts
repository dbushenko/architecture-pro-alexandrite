import { trace, SpanStatusCode } from '@opentelemetry/api';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

export function calculateCost(items: OrderItem[]): number {
  // Create a new span for the cost calculation process
  const tracer = trace.getTracer('service-b');
  
  return tracer.startActiveSpan('calculate-cost', (span) => {
    try {
      // Simulate some processing time
      const processingTime = Math.random() * 100; // Random delay up to 100ms
      const start = Date.now();
      while (Date.now() - start < processingTime) {
        // Busy wait to simulate processing
      }
      
      // Calculate the total cost based on items
      // In a real application, this might involve complex pricing rules, discounts, etc.
      let totalCost = 0;
      for (const item of items) {
        // Generate a random price per item (between $5 and $100)
        const itemPrice = Math.floor(Math.random() * 95 + 5);
        totalCost += itemPrice * item.quantity;
      }
      
      // Add a random tax (between 0 and 10%)
      const taxRate = Math.random() * 0.10;
      const taxAmount = totalCost * taxRate;
      totalCost += taxAmount;
      
      span.setAttributes({
        'items.count': items.length,
        'calculated.cost': totalCost,
        'tax.amount': taxAmount,
        'processing.time.ms': processingTime,
      });
      
      console.log(`Calculated cost: ${totalCost} for ${items.length} items`);
      
      return Number(totalCost.toFixed(2)); // Round to 2 decimal places
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}