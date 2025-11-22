import express from 'express';
import { initTracer } from './tracer';
import { calculateCost } from './cost';

const app = express();
app.use(express.json());

// Initialize OpenTelemetry
initTracer('service-b');

app.post('/calculate-cost', (req, res) => {
  try {
    const { items } = req.body;
    const totalCost = calculateCost(items);
    res.json({ totalCost });
  } catch (error) {
    console.error('Error calculating cost:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Service B listening on port ${PORT}`);
});