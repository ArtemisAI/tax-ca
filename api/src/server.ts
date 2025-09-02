import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { authenticate, errorHandler, notFoundHandler, generalLimiter } from './middleware';
import { swaggerSpec } from './docs/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
app.use('/api', generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no authentication required)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API documentation (no authentication required for easier access)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Canadian Tax API Documentation'
}));

// Serve OpenAPI spec as JSON
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

// Authentication middleware for all /api routes (except docs)
app.use('/api', authenticate);

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Tax Calculation API server running on port ${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/api/docs`);
    console.log(`🔍 OpenAPI spec available at http://localhost:${PORT}/api/docs.json`);
  });
}

export default app;