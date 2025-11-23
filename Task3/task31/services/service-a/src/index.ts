import express from 'express';
import { initTracer } from './tracer';
import { createOrder } from './order';

const app = express();
app.use(express.json());

// Initialize OpenTelemetry
initTracer('service-a');

app.post('/orders', async (req, res) => {
  try {
    const { items } = req.body;
    const order = await createOrder(items);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Service A listening on port ${PORT}`);
});