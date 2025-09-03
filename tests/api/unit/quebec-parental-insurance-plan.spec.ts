/**
 * Unit tests for Quebec Parental Insurance Plan (QPIP) module
 * Tests the QPIP rates, maximums, and employment types
 */

import { QPIP, QuebecParentalInsurancePlan, PremiumRates } from '../../../src/taxes/quebec-parental-insurance-plan';

describe('Quebec Parental Insurance Plan (QPIP)', () => {
    describe('Structure validation', () => {
        it('should have the correct interface structure', () => {
            expect(QPIP).toBeDefined();
            expect(typeof QPIP).toBe('object');
            expect(QPIP).toHaveProperty('MAX_INSURABLE_EARNINGS');
            expect(QPIP).toHaveProperty('PREMIUM_RATES');
        });

        it('should implement QuebecParentalInsurancePlan interface correctly', () => {
            const qpip: QuebecParentalInsurancePlan = QPIP;
            expect(qpip.MAX_INSURABLE_EARNINGS).toBeDefined();
            expect(qpip.PREMIUM_RATES).toBeDefined();
        });

        it('should have correct premium rates structure', () => {
            const premiumRates: PremiumRates = QPIP.PREMIUM_RATES;
            expect(premiumRates).toHaveProperty('SELF_EMPLOYED');
            expect(premiumRates).toHaveProperty('SALARIED');
        });
    });

    describe('Maximum insurable earnings', () => {
        it('should have correct maximum insurable earnings for 2025', () => {
            expect(QPIP.MAX_INSURABLE_EARNINGS).toBe(98000);
            expect(typeof QPIP.MAX_INSURABLE_EARNINGS).toBe('number');
        });

        it('should be a positive number', () => {
            expect(QPIP.MAX_INSURABLE_EARNINGS).toBeGreaterThan(0);
        });

        it('should be higher than EI maximum (Quebec-specific program)', () => {
            // QPIP typically has higher maximum than federal EI
            expect(QPIP.MAX_INSURABLE_EARNINGS).toBeGreaterThan(65000);
        });

        it('should be within reasonable range for high earners', () => {
            expect(QPIP.MAX_INSURABLE_EARNINGS).toBeGreaterThan(75000);
            expect(QPIP.MAX_INSURABLE_EARNINGS).toBeLessThan(150000);
        });
    });

    describe('Premium rates', () => {
        it('should have correct self-employed premium rate', () => {
            expect(QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBe(0.00878);
            expect(typeof QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBe('number');
        });

        it('should have correct salaried premium rate', () => {
            expect(QPIP.PREMIUM_RATES.SALARIED).toBe(0.00494);
            expect(typeof QPIP.PREMIUM_RATES.SALARIED).toBe('number');
        });

        it('should have self-employed rate higher than salaried rate', () => {
            expect(QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBeGreaterThan(QPIP.PREMIUM_RATES.SALARIED);
        });

        it('should have rates as valid percentages', () => {
            expect(QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBeGreaterThan(0);
            expect(QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBeLessThan(0.02);
            expect(QPIP.PREMIUM_RATES.SALARIED).toBeGreaterThan(0);
            expect(QPIP.PREMIUM_RATES.SALARIED).toBeLessThan(0.01);
        });
    });

    describe('Calculations', () => {
        it('should calculate correct QPIP premiums for salaried employees', () => {
            const earnings = 60000;
            const expectedPremium = earnings * QPIP.PREMIUM_RATES.SALARIED;
            expect(expectedPremium).toBe(296.4);
        });

        it('should calculate correct QPIP premiums for self-employed', () => {
            const earnings = 60000;
            const expectedPremium = earnings * QPIP.PREMIUM_RATES.SELF_EMPLOYED;
            expect(expectedPremium).toBe(526.8);
        });

        it('should cap premiums at maximum insurable earnings', () => {
            const maxPremiumSalaried = QPIP.MAX_INSURABLE_EARNINGS * QPIP.PREMIUM_RATES.SALARIED;
            const maxPremiumSelfEmployed = QPIP.MAX_INSURABLE_EARNINGS * QPIP.PREMIUM_RATES.SELF_EMPLOYED;
            
            expect(maxPremiumSalaried).toBeCloseTo(484.12, 2);
            expect(maxPremiumSelfEmployed).toBeCloseTo(860.44, 2);
        });

        it('should show significant difference between employment types', () => {
            const earnings = 80000;
            const salariedPremium = earnings * QPIP.PREMIUM_RATES.SALARIED;
            const selfEmployedPremium = earnings * QPIP.PREMIUM_RATES.SELF_EMPLOYED;
            const difference = selfEmployedPremium - salariedPremium;
            
            expect(difference).toBeGreaterThan(0);
            expect(difference).toBeCloseTo(307.2, 2);
        });
    });

    describe('Employment type differences', () => {
        it('should reflect employer-employee cost sharing for salaried workers', () => {
            // Salaried workers split costs with employers, hence lower rate
            const ratioSelfEmployedToSalaried = QPIP.PREMIUM_RATES.SELF_EMPLOYED / QPIP.PREMIUM_RATES.SALARIED;
            expect(ratioSelfEmployedToSalaried).toBeGreaterThan(1.5);
            expect(ratioSelfEmployedToSalaried).toBeLessThan(2.5);
        });
    });

    describe('Data consistency', () => {
        it('should maintain reasonable rate differences between employment types', () => {
            const difference = QPIP.PREMIUM_RATES.SELF_EMPLOYED - QPIP.PREMIUM_RATES.SALARIED;
            expect(difference).toBeGreaterThan(0);
            expect(difference).toBeLessThan(0.01); // Difference should be less than 1%
        });

        it('should be modifiable (not frozen)', () => {
            const originalMaxEarnings = QPIP.MAX_INSURABLE_EARNINGS;
            const originalSalariedRate = QPIP.PREMIUM_RATES.SALARIED;

            // These objects are not frozen, so modifications will work
            (QPIP as any).MAX_INSURABLE_EARNINGS = 100000;
            (QPIP.PREMIUM_RATES as any).SALARIED = 0.006;

            // Restore original values for other tests
            (QPIP as any).MAX_INSURABLE_EARNINGS = originalMaxEarnings;
            (QPIP.PREMIUM_RATES as any).SALARIED = originalSalariedRate;

            expect(QPIP.MAX_INSURABLE_EARNINGS).toBe(originalMaxEarnings);
            expect(QPIP.PREMIUM_RATES.SALARIED).toBe(originalSalariedRate);
        });
    });
});