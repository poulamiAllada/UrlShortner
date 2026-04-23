import express from 'express';
import routes from './src/routes/index.js';

const app = express();

app.use(express.json());

// ✅ Health check — standard in every production service
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

// ✅ 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Centralized error handling middleware — single place for all unhandled errors.
// Must be defined last and must have 4 parameters for Express to recognise it as
// an error handler. Controllers call next(err) to reach here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} —`, err.message);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
