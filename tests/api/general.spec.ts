import request from 'supertest';
import app from '../../api/src/server';

describe('Tax Calculation API - General Endpoints', () => {
  
  describe('GET /health', () => {
    it('should return health status without authentication', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /api/docs.json', () => {
    it('should return OpenAPI specification without authentication', async () => {
      const response = await request(app)
        .get('/api/docs.json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('openapi', '3.0.0');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('title');
      expect(response.body).toHaveProperty('paths');
      expect(response.body).toHaveProperty('components');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .set('X-API-Key', 'demo-key-123');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NOT_FOUND');
    });
  });
});