import request from 'supertest';
import app from '../../api/src/server';

const API_KEY = 'demo-key-123';

describe('Tax Calculation API - Income Tax Endpoint', () => {
  
  describe('POST /api/calculate/income-tax', () => {
    it('should calculate income tax for valid input', async () => {
      const response = await request(app)
        .post('/api/calculate/income-tax')
        .set('X-API-Key', API_KEY)
        .send({
          grossIncome: 75000,
          province: 'ON'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('grossIncome', 75000);
      expect(response.body.data).toHaveProperty('province', 'ON');
      expect(response.body.data).toHaveProperty('federalTax');
      expect(response.body.data).toHaveProperty('provincialTax');
      expect(response.body.data).toHaveProperty('totalTax');
      expect(response.body.data).toHaveProperty('afterTaxIncome');
      expect(response.body.data).toHaveProperty('effectiveTaxRate');
      expect(response.body.data).toHaveProperty('marginalTaxRate');
      
      expect(typeof response.body.data.federalTax).toBe('number');
      expect(typeof response.body.data.provincialTax).toBe('number');
      expect(typeof response.body.data.totalTax).toBe('number');
      expect(response.body.data.totalTax).toBeGreaterThan(0);
    });

    it('should return 400 for missing grossIncome', async () => {
      const response = await request(app)
        .post('/api/calculate/income-tax')
        .set('X-API-Key', API_KEY)
        .send({
          province: 'ON'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
    });

    it('should return 400 for invalid province', async () => {
      const response = await request(app)
        .post('/api/calculate/income-tax')
        .set('X-API-Key', API_KEY)
        .send({
          grossIncome: 75000,
          province: 'XX'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing API key', async () => {
      const response = await request(app)
        .post('/api/calculate/income-tax')
        .send({
          grossIncome: 75000,
          province: 'ON'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('MISSING_API_KEY');
    });

    it('should return 401 for invalid API key', async () => {
      const response = await request(app)
        .post('/api/calculate/income-tax')
        .set('X-API-Key', 'invalid-key')
        .send({
          grossIncome: 75000,
          province: 'ON'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_API_KEY');
    });

    it('should calculate income tax with optional parameters', async () => {
      const response = await request(app)
        .post('/api/calculate/income-tax')
        .set('X-API-Key', API_KEY)
        .send({
          grossIncome: 100000,
          province: 'BC',
          year: 2025,
          inflationRate: 0.02,
          yearsToInflate: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.province).toBe('BC');
    });
  });
});