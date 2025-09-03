/**
 * Unit tests for RESP Beneficiary module
 * Tests the beneficiary age limits for education savings plans
 */

import { Beneficiary } from '../../../src/investments/registered-education-savings-plan/beneficiary';

describe('RESP Beneficiary', () => {
    describe('Structure validation', () => {
        it('should have the correct interface structure', () => {
            expect(Beneficiary).toBeDefined();
            expect(typeof Beneficiary).toBe('object');
            expect(Beneficiary).toHaveProperty('MAX_AGE');
        });

        it('should implement Beneficiary interface correctly', () => {
            expect(Beneficiary.MAX_AGE).toBeDefined();
            expect(typeof Beneficiary.MAX_AGE).toBe('number');
        });
    });

    describe('Maximum age validation', () => {
        it('should have correct maximum age', () => {
            expect(Beneficiary.MAX_AGE).toBe(35);
        });

        it('should be a positive number', () => {
            expect(Beneficiary.MAX_AGE).toBeGreaterThan(0);
        });

        it('should be within reasonable range for education', () => {
            expect(Beneficiary.MAX_AGE).toBeGreaterThan(18);
            expect(Beneficiary.MAX_AGE).toBeLessThan(50);
        });
    });

    describe('Age-related scenarios', () => {
        it('should allow young adults to be beneficiaries', () => {
            const youngAdultAge = 22;
            expect(youngAdultAge).toBeLessThanOrEqual(Beneficiary.MAX_AGE);
        });

        it('should allow mature students to be beneficiaries', () => {
            const matureStudentAge = 30;
            expect(matureStudentAge).toBeLessThanOrEqual(Beneficiary.MAX_AGE);
        });

        it('should exclude very old potential students', () => {
            const tooOldAge = 40;
            expect(tooOldAge).toBeGreaterThan(Beneficiary.MAX_AGE);
        });
    });

    describe('Educational context validation', () => {
        it('should accommodate extended education periods', () => {
            // Allows for scenarios where someone might start post-secondary education later
            // or pursue multiple degrees/programs
            expect(Beneficiary.MAX_AGE).toBeGreaterThan(25);
        });

        it('should align with typical post-secondary completion ages', () => {
            // Most people complete post-secondary education by mid-20s to early 30s
            expect(Beneficiary.MAX_AGE).toBeLessThan(40);
        });
    });

    describe('Data consistency', () => {
        it('should be modifiable (not frozen)', () => {
            const originalMaxAge = Beneficiary.MAX_AGE;

            // This object is not frozen, so modifications will work
            (Beneficiary as any).MAX_AGE = 40;

            // Restore original value for other tests
            (Beneficiary as any).MAX_AGE = originalMaxAge;

            expect(Beneficiary.MAX_AGE).toBe(originalMaxAge);
        });

        it('should maintain consistency with Canadian RESP regulations', () => {
            // Based on Canadian RESP rules, beneficiaries must be under 36 when plan terminates
            expect(Beneficiary.MAX_AGE).toBe(35);
        });
    });
});
