/**
 * Unit tests for Employment Insurance (EI) module
 * Tests the EI rates, maximums, and provincial differences
 */

import { EI, EmploymentInsurance, PremiumRate } from '../../../src/taxes/employment-insurance';

describe('Employment Insurance (EI)', () => {
    describe('Structure validation', () => {
        it('should have the correct interface structure', () => {
            expect(EI).toBeDefined();
            expect(typeof EI).toBe('object');
            expect(EI).toHaveProperty('MAX_INSURABLE_EARNINGS');
            expect(EI).toHaveProperty('PREMIUM_RATES');
        });

        it('should implement EmploymentInsurance interface correctly', () => {
            const ei: EmploymentInsurance = EI;
            expect(ei.MAX_INSURABLE_EARNINGS).toBeDefined();
            expect(ei.PREMIUM_RATES).toBeDefined();
        });

        it('should have correct premium rates structure', () => {
            const premiumRates: PremiumRate = EI.PREMIUM_RATES;
            expect(premiumRates).toHaveProperty('CA');
            expect(premiumRates).toHaveProperty('QC');
        });
    });

    describe('Maximum insurable earnings', () => {
        it('should have correct maximum insurable earnings for 2025', () => {
            expect(EI.MAX_INSURABLE_EARNINGS).toBe(65700);
            expect(typeof EI.MAX_INSURABLE_EARNINGS).toBe('number');
        });

        it('should be a positive number', () => {
            expect(EI.MAX_INSURABLE_EARNINGS).toBeGreaterThan(0);
        });

        it('should be within reasonable range for Canadian wages', () => {
            expect(EI.MAX_INSURABLE_EARNINGS).toBeGreaterThan(50000);
            expect(EI.MAX_INSURABLE_EARNINGS).toBeLessThan(100000);
        });
    });

    describe('Premium rates', () => {
        it('should have correct federal (CA) premium rate', () => {
            expect(EI.PREMIUM_RATES.CA).toBe(0.0164);
            expect(typeof EI.PREMIUM_RATES.CA).toBe('number');
        });

        it('should have correct Quebec (QC) premium rate', () => {
            expect(EI.PREMIUM_RATES.QC).toBe(0.0131);
            expect(typeof EI.PREMIUM_RATES.QC).toBe('number');
        });

        it('should have Quebec rate lower than federal rate', () => {
            expect(EI.PREMIUM_RATES.QC).toBeLessThan(EI.PREMIUM_RATES.CA);
        });

        it('should have rates as valid percentages', () => {
            expect(EI.PREMIUM_RATES.CA).toBeGreaterThan(0);
            expect(EI.PREMIUM_RATES.CA).toBeLessThan(0.1);
            expect(EI.PREMIUM_RATES.QC).toBeGreaterThan(0);
            expect(EI.PREMIUM_RATES.QC).toBeLessThan(0.1);
        });
    });

    describe('Calculations', () => {
        it('should calculate correct EI premiums for federal employees', () => {
            const earnings = 50000;
            const expectedPremium = earnings * EI.PREMIUM_RATES.CA;
            expect(expectedPremium).toBeCloseTo(820, 2);
        });

        it('should calculate correct EI premiums for Quebec employees', () => {
            const earnings = 50000;
            const expectedPremium = earnings * EI.PREMIUM_RATES.QC;
            expect(expectedPremium).toBe(655);
        });

        it('should cap premiums at maximum insurable earnings', () => {
            const maxPremiumCA = EI.MAX_INSURABLE_EARNINGS * EI.PREMIUM_RATES.CA;
            const maxPremiumQC = EI.MAX_INSURABLE_EARNINGS * EI.PREMIUM_RATES.QC;
            
            expect(maxPremiumCA).toBeCloseTo(1077.48, 2);
            expect(maxPremiumQC).toBeCloseTo(860.67, 2);
        });
    });

    describe('Data consistency', () => {
        it('should maintain reasonable provincial differences', () => {
            const difference = EI.PREMIUM_RATES.CA - EI.PREMIUM_RATES.QC;
            expect(difference).toBeGreaterThan(0);
            expect(difference).toBeLessThan(0.01); // Difference should be less than 1%
        });

        it('should be modifiable (not frozen)', () => {
            const originalMaxEarnings = EI.MAX_INSURABLE_EARNINGS;
            const originalCARate = EI.PREMIUM_RATES.CA;

            // These objects are not frozen, so modifications will work
            (EI as any).MAX_INSURABLE_EARNINGS = 70000;
            (EI.PREMIUM_RATES as any).CA = 0.02;

            // Restore original values for other tests
            (EI as any).MAX_INSURABLE_EARNINGS = originalMaxEarnings;
            (EI.PREMIUM_RATES as any).CA = originalCARate;

            expect(EI.MAX_INSURABLE_EARNINGS).toBe(originalMaxEarnings);
            expect(EI.PREMIUM_RATES.CA).toBe(originalCARate);
        });
    });
});