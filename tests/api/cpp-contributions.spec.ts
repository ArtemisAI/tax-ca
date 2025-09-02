import request from 'supertest';
import app from '../../api/src/server';

const API_KEY = 'demo-key-123';

describe('Tax Calculation API - CPP Contributions', () => {
  
  describe('POST /api/calculate/cpp-contributions', () => {
    it('should calculate CPP contributions for valid input', async () => {
      const response = await request(app)
        .post('/api/calculate/cpp-contributions')
        .set('X-API-Key', API_KEY)
        .send({
          income: 75000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('income', 75000);
      expect(response.body.data).toHaveProperty('pensionableEarnings');
      expect(response.body.data).toHaveProperty('baseContribution');
      expect(response.body.data).toHaveProperty('enhancementContribution');
      expect(response.body.data).toHaveProperty('totalContribution');
      expect(response.body.data).toHaveProperty('year');
      
      expect(response.body.data.totalContribution).toBeGreaterThan(0);
    });

    it('should return 400 for missing income', async () => {
      const response = await request(app)
        .post('/api/calculate/cpp-contributions')
        .set('X-API-Key', API_KEY)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should calculate contributions with year parameter', async () => {
      const response = await request(app)
        .post('/api/calculate/cpp-contributions')
        .set('X-API-Key', API_KEY)
        .send({
          income: 80000,
          year: 2025
        });

      expect(response.status).toBe(200);
      expect(response.body.data.year).toBe(2025);
    });
  });
});