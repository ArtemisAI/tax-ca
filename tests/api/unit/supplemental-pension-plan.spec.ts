/**
 * Unit tests for Supplemental Pension Plan (SPP) module
 * Tests the SPP constants and structure
 */

import { SPP, SupplementalPensionPlan } from '../../../src/pension/supplemental-pension-plan';

describe('Supplemental Pension Plan (SPP)', () => {
    describe('Structure validation', () => {
        it('should have the correct interface structure', () => {
            expect(SPP).toBeDefined();
            expect(typeof SPP).toBe('object');
            expect(SPP).toHaveProperty('MAX_BRIDGE_BENEFIT_AGE');
            expect(SPP).toHaveProperty('MIN_AGE');
        });

        it('should implement SupplementalPensionPlan interface correctly', () => {
            const spp: SupplementalPensionPlan = SPP;
            expect(spp.MAX_BRIDGE_BENEFIT_AGE).toBeDefined();
            expect(spp.MIN_AGE).toBeDefined();
        });
    });

    describe('Age constants', () => {
        it('should have correct maximum bridge benefit age', () => {
            expect(SPP.MAX_BRIDGE_BENEFIT_AGE).toBe(65);
            expect(typeof SPP.MAX_BRIDGE_BENEFIT_AGE).toBe('number');
        });

        it('should have correct minimum age', () => {
            expect(SPP.MIN_AGE).toBe(55);
            expect(typeof SPP.MIN_AGE).toBe('number');
        });

        it('should have logical age relationship', () => {
            expect(SPP.MIN_AGE).toBeLessThan(SPP.MAX_BRIDGE_BENEFIT_AGE);
        });
    });

    describe('Data consistency', () => {
        it('should have valid age ranges for pension planning', () => {
            expect(SPP.MIN_AGE).toBeGreaterThanOrEqual(50);
            expect(SPP.MIN_AGE).toBeLessThanOrEqual(60);
            expect(SPP.MAX_BRIDGE_BENEFIT_AGE).toBeGreaterThanOrEqual(60);
            expect(SPP.MAX_BRIDGE_BENEFIT_AGE).toBeLessThanOrEqual(70);
        });

        it('should be modifiable (not frozen)', () => {
            const originalMinAge = SPP.MIN_AGE;
            const originalMaxAge = SPP.MAX_BRIDGE_BENEFIT_AGE;

            // These objects are not frozen, so modifications will work
            (SPP as any).MIN_AGE = 50;
            (SPP as any).MAX_BRIDGE_BENEFIT_AGE = 70;

            // Restore original values for other tests
            (SPP as any).MIN_AGE = originalMinAge;
            (SPP as any).MAX_BRIDGE_BENEFIT_AGE = originalMaxAge;

            expect(SPP.MIN_AGE).toBe(originalMinAge);
            expect(SPP.MAX_BRIDGE_BENEFIT_AGE).toBe(originalMaxAge);
        });
    });
});
