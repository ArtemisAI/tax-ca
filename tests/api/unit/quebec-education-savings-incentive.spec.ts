/**
 * Unit tests for Quebec Education Savings Incentive module
 * Tests the QESI rates, maximums, and income-based calculations
 */

import { QuebecEducationSavingsIncentive } from '../../../src/investments/registered-education-savings-plan/quebec-education-savings-incentive';

describe('Quebec Education Savings Incentive (QESI)', () => {
    describe('Structure validation', () => {
        it('should have the correct structure', () => {
            expect(QuebecEducationSavingsIncentive).toBeDefined();
            expect(typeof QuebecEducationSavingsIncentive).toBe('object');
        });

        it('should have required grant properties', () => {
            expect(QuebecEducationSavingsIncentive).toHaveProperty('MAX_GRANT');
            expect(QuebecEducationSavingsIncentive).toHaveProperty('MAX_BENEFICIARY_AGE');
            expect(QuebecEducationSavingsIncentive).toHaveProperty('MAX_AMOUNT_YEARLY_FOR_GRANT');
            expect(QuebecEducationSavingsIncentive).toHaveProperty('YEARLY_GRANT_PERCENT');
        });

        it('should have supplemental grant properties', () => {
            expect(QuebecEducationSavingsIncentive).toHaveProperty('MAX_AMOUNT_FOR_SUPP_GRANT');
            expect(QuebecEducationSavingsIncentive).toHaveProperty('SUPP_GRANT_PERCENT');
        });
    });

    describe('Grant limits and maximums', () => {
        it('should have correct maximum grant amount', () => {
            expect(QuebecEducationSavingsIncentive.MAX_GRANT).toBe(3600);
            expect(typeof QuebecEducationSavingsIncentive.MAX_GRANT).toBe('number');
        });

        it('should have correct maximum beneficiary age', () => {
            expect(QuebecEducationSavingsIncentive.MAX_BENEFICIARY_AGE).toBe(17);
            expect(typeof QuebecEducationSavingsIncentive.MAX_BENEFICIARY_AGE).toBe('number');
        });

        it('should have correct yearly grant contribution limit', () => {
            expect(QuebecEducationSavingsIncentive.MAX_AMOUNT_YEARLY_FOR_GRANT).toBe(2500);
            expect(typeof QuebecEducationSavingsIncentive.MAX_AMOUNT_YEARLY_FOR_GRANT).toBe('number');
        });

        it('should have correct supplemental grant limit', () => {
            expect(QuebecEducationSavingsIncentive.MAX_AMOUNT_FOR_SUPP_GRANT).toBe(500);
            expect(typeof QuebecEducationSavingsIncentive.MAX_AMOUNT_FOR_SUPP_GRANT).toBe('number');
        });
    });

    describe('Grant percentages', () => {
        it('should have correct yearly grant percentage', () => {
            expect(QuebecEducationSavingsIncentive.YEARLY_GRANT_PERCENT).toBe(0.1);
            expect(typeof QuebecEducationSavingsIncentive.YEARLY_GRANT_PERCENT).toBe('number');
        });

        it('should have supplemental grant percentages structure', () => {
            expect(QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT).toBeDefined();
            expect(typeof QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT).toBe('object');
            expect(QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT).toHaveProperty('LOW_INCOME');
            expect(QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT).toHaveProperty('MEDIUM_INCOME');
        });

        it('should have correct supplemental grant rates', () => {
            expect(QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT.LOW_INCOME).toBe(0.1);
            expect(QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT.MEDIUM_INCOME).toBe(0.05);
        });

        it('should have higher rate for low income families', () => {
            expect(QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT.LOW_INCOME)
                .toBeGreaterThan(QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT.MEDIUM_INCOME);
        });
    });

    describe('Age and eligibility validation', () => {
        it('should have reasonable maximum age for children', () => {
            expect(QuebecEducationSavingsIncentive.MAX_BENEFICIARY_AGE).toBeGreaterThan(0);
            expect(QuebecEducationSavingsIncentive.MAX_BENEFICIARY_AGE).toBeLessThan(18);
        });

        it('should align with Quebec education system', () => {
            // Age 17 is typically the last year of secondary education in Quebec
            expect(QuebecEducationSavingsIncentive.MAX_BENEFICIARY_AGE).toBe(17);
        });
    });

    describe('Grant calculations', () => {
        it('should calculate correct base grant for maximum contribution', () => {
            const maxContribution = QuebecEducationSavingsIncentive.MAX_AMOUNT_YEARLY_FOR_GRANT;
            const expectedGrant = maxContribution * QuebecEducationSavingsIncentive.YEARLY_GRANT_PERCENT;
            expect(expectedGrant).toBe(250);
        });

        it('should calculate correct supplemental grant for low income', () => {
            const maxSuppContribution = QuebecEducationSavingsIncentive.MAX_AMOUNT_FOR_SUPP_GRANT;
            const expectedGrant = maxSuppContribution * QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT.LOW_INCOME;
            expect(expectedGrant).toBe(50);
        });

        it('should calculate correct supplemental grant for medium income', () => {
            const maxSuppContribution = QuebecEducationSavingsIncentive.MAX_AMOUNT_FOR_SUPP_GRANT;
            const expectedGrant = maxSuppContribution * QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT.MEDIUM_INCOME;
            expect(expectedGrant).toBe(25);
        });

        it('should not exceed maximum grant over lifetime', () => {
            const yearsEligible = 18; // 0 to 17 years old
            const maxYearlyGrant = QuebecEducationSavingsIncentive.MAX_AMOUNT_YEARLY_FOR_GRANT * 
                                   QuebecEducationSavingsIncentive.YEARLY_GRANT_PERCENT;
            const maxPossibleGrant = maxYearlyGrant * yearsEligible;
            
            // The actual maximum should be enforced at the lifetime level
            expect(QuebecEducationSavingsIncentive.MAX_GRANT).toBeLessThan(maxPossibleGrant);
        });
    });

    describe('Income-based benefits', () => {
        it('should provide additional benefits for lower income families', () => {
            const lowIncomeRate = QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT.LOW_INCOME;
            const mediumIncomeRate = QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT.MEDIUM_INCOME;
            
            expect(lowIncomeRate).toBeGreaterThan(mediumIncomeRate);
            expect(lowIncomeRate).toBeGreaterThan(0);
            expect(mediumIncomeRate).toBeGreaterThan(0);
        });

        it('should have reasonable percentage rates', () => {
            expect(QuebecEducationSavingsIncentive.YEARLY_GRANT_PERCENT).toBeLessThan(0.5);
            expect(QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT.LOW_INCOME).toBeLessThan(0.5);
            expect(QuebecEducationSavingsIncentive.SUPP_GRANT_PERCENT.MEDIUM_INCOME).toBeLessThan(0.5);
        });
    });

    describe('Data consistency', () => {
        it('should maintain reasonable relationships between limits', () => {
            expect(QuebecEducationSavingsIncentive.MAX_AMOUNT_FOR_SUPP_GRANT)
                .toBeLessThan(QuebecEducationSavingsIncentive.MAX_AMOUNT_YEARLY_FOR_GRANT);
        });

        it('should be modifiable (not frozen)', () => {
            const originalMaxGrant = QuebecEducationSavingsIncentive.MAX_GRANT;
            const originalYearlyPercent = QuebecEducationSavingsIncentive.YEARLY_GRANT_PERCENT;

            // This object is not frozen, so modifications will work
            (QuebecEducationSavingsIncentive as any).MAX_GRANT = 4000;

            // Restore original value for other tests
            (QuebecEducationSavingsIncentive as any).MAX_GRANT = originalMaxGrant;

            expect(QuebecEducationSavingsIncentive.MAX_GRANT).toBe(originalMaxGrant);
            expect(QuebecEducationSavingsIncentive.YEARLY_GRANT_PERCENT).toBe(originalYearlyPercent);
        });
    });
});