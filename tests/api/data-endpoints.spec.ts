import request from 'supertest';
import app from '../../api/src/server';

const API_KEY = 'demo-key-123';

describe('Tax Calculation API - Data Endpoints', () => {
  
  describe('GET /api/data/tax-brackets/:year/:province', () => {
    it('should return tax brackets for valid year and province', async () => {
      const response = await request(app)
        .get('/api/data/tax-brackets/2025/ON')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('year', 2025);
      expect(response.body.data).toHaveProperty('province', 'ON');
      expect(response.body.data).toHaveProperty('federal');
      expect(response.body.data).toHaveProperty('provincial');
      expect(response.body.data.federal).toHaveProperty('rates');
      expect(response.body.data.provincial).toHaveProperty('rates');
      expect(Array.isArray(response.body.data.federal.rates)).toBe(true);
      expect(Array.isArray(response.body.data.provincial.rates)).toBe(true);
    });

    it('should return 400 for invalid province', async () => {
      const response = await request(app)
        .get('/api/data/tax-brackets/2025/XX')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_PROVINCE');
    });

    it('should return 400 for invalid year', async () => {
      const response = await request(app)
        .get('/api/data/tax-brackets/1999/ON')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_YEAR');
    });
  });

  describe('GET /api/data/pension-limits/:year', () => {
    it('should return pension limits for valid year', async () => {
      const response = await request(app)
        .get('/api/data/pension-limits/2025')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('year', 2025);
      expect(response.body.data).toHaveProperty('cpp');
      expect(response.body.data).toHaveProperty('qpp');
      expect(response.body.data).toHaveProperty('ei');
      expect(response.body.data.cpp).toHaveProperty('basicExemption');
      expect(response.body.data.cpp).toHaveProperty('ympe');
      expect(response.body.data.ei).toHaveProperty('maxInsurableEarnings');
    });

    it('should return 400 for invalid year', async () => {
      const response = await request(app)
        .get('/api/data/pension-limits/1999')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/data/provinces', () => {
    it('should return list of provinces', async () => {
      const response = await request(app)
        .get('/api/data/provinces')
        .set('X-API-Key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('provinces');
      expect(Array.isArray(response.body.data.provinces)).toBe(true);
      expect(response.body.data.provinces.length).toBeGreaterThan(0);
      
      const firstProvince = response.body.data.provinces[0];
      expect(firstProvince).toHaveProperty('code');
      expect(firstProvince).toHaveProperty('name');
    });
  });
});