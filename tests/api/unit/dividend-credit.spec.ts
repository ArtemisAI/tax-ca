/**
 * Unit tests for Dividend Credit module
 * Tests both eligible and non-eligible dividend tax credits by province
 */

import {
    ELIGIBLE_DIVIDEND,
    NON_ELIGIBLE_DIVIDEND,
    DividendTaxCreditRate,
} from '../../../src/taxes/dividend-credit';
import { ProvinceCode, FederalCode } from '../../../src/misc';

describe('Dividend Credit', () => {
    describe('Structure validation', () => {
        it('should have eligible dividend structure', () => {
            expect(ELIGIBLE_DIVIDEND).toBeDefined();
            expect(typeof ELIGIBLE_DIVIDEND).toBe('object');
            expect(ELIGIBLE_DIVIDEND).toHaveProperty('GROSS_UP');
        });

        it('should have non-eligible dividend structure', () => {
            expect(NON_ELIGIBLE_DIVIDEND).toBeDefined();
            expect(typeof NON_ELIGIBLE_DIVIDEND).toBe('object');
            expect(NON_ELIGIBLE_DIVIDEND).toHaveProperty('GROSS_UP');
        });

        it('should implement DividendTaxCreditRate interface correctly', () => {
            const eligible: DividendTaxCreditRate = ELIGIBLE_DIVIDEND;
            const nonEligible: DividendTaxCreditRate = NON_ELIGIBLE_DIVIDEND;

            expect(eligible.GROSS_UP).toBeDefined();
            expect(nonEligible.GROSS_UP).toBeDefined();
        });
    });

    describe('Gross-up factors', () => {
        it('should have correct eligible dividend gross-up', () => {
            expect(ELIGIBLE_DIVIDEND.GROSS_UP).toBe(1.38);
            expect(typeof ELIGIBLE_DIVIDEND.GROSS_UP).toBe('number');
        });

        it('should have correct non-eligible dividend gross-up', () => {
            expect(NON_ELIGIBLE_DIVIDEND.GROSS_UP).toBe(1.15);
            expect(typeof NON_ELIGIBLE_DIVIDEND.GROSS_UP).toBe('number');
        });

        it('should have higher gross-up for eligible dividends', () => {
            expect(ELIGIBLE_DIVIDEND.GROSS_UP).toBeGreaterThan(NON_ELIGIBLE_DIVIDEND.GROSS_UP);
        });

        it('should have gross-up factors above 1.0', () => {
            expect(ELIGIBLE_DIVIDEND.GROSS_UP).toBeGreaterThan(1.0);
            expect(NON_ELIGIBLE_DIVIDEND.GROSS_UP).toBeGreaterThan(1.0);
        });
    });

    describe('Provincial coverage', () => {
        const provinces: ProvinceCode[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
        const federal: FederalCode = 'CA';

        it('should have federal rates for both dividend types', () => {
            expect(ELIGIBLE_DIVIDEND[federal]).toBeDefined();
            expect(NON_ELIGIBLE_DIVIDEND[federal]).toBeDefined();
            expect(typeof ELIGIBLE_DIVIDEND[federal]).toBe('number');
            expect(typeof NON_ELIGIBLE_DIVIDEND[federal]).toBe('number');
        });

        it('should have rates for all provinces and territories for eligible dividends', () => {
            provinces.forEach((province) => {
                expect(ELIGIBLE_DIVIDEND[province]).toBeDefined();
                expect(typeof ELIGIBLE_DIVIDEND[province]).toBe('number');
            });
        });

        it('should have rates for all provinces and territories for non-eligible dividends', () => {
            provinces.forEach((province) => {
                expect(NON_ELIGIBLE_DIVIDEND[province]).toBeDefined();
                expect(typeof NON_ELIGIBLE_DIVIDEND[province]).toBe('number');
            });
        });
    });

    describe('Federal rates', () => {
        it('should have correct federal eligible dividend rate', () => {
            expect(ELIGIBLE_DIVIDEND.CA).toBe(0.150198);
        });

        it('should have correct federal non-eligible dividend rate', () => {
            expect(NON_ELIGIBLE_DIVIDEND.CA).toBe(0.090301);
        });

        it('should have higher federal rate for eligible dividends', () => {
            expect(ELIGIBLE_DIVIDEND.CA).toBeGreaterThan(NON_ELIGIBLE_DIVIDEND.CA);
        });
    });

    describe('Provincial rate validation', () => {
        const provinces: ProvinceCode[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

        it('should have all rates as positive numbers', () => {
            provinces.forEach((province) => {
                expect(ELIGIBLE_DIVIDEND[province]).toBeGreaterThan(0);
                expect(NON_ELIGIBLE_DIVIDEND[province]).toBeGreaterThan(0);
            });
        });

        it('should have rates below 0.2 (20%)', () => {
            provinces.forEach((province) => {
                expect(ELIGIBLE_DIVIDEND[province]).toBeLessThan(0.2);
                expect(NON_ELIGIBLE_DIVIDEND[province]).toBeLessThan(0.2);
            });
        });

        it('should generally have higher eligible dividend rates', () => {
            const provincesWithHigherEligible = provinces.filter((province) => ELIGIBLE_DIVIDEND[province] > NON_ELIGIBLE_DIVIDEND[province]);

            // Most provinces should have higher eligible dividend rates
            expect(provincesWithHigherEligible.length).toBeGreaterThan(provinces.length * 0.7);
        });
    });

    describe('Specific provincial rates', () => {
        it('should have correct Ontario rates', () => {
            expect(ELIGIBLE_DIVIDEND.ON).toBe(0.1);
            expect(NON_ELIGIBLE_DIVIDEND.ON).toBe(0.029863);
        });

        it('should have correct Quebec rates', () => {
            expect(ELIGIBLE_DIVIDEND.QC).toBe(0.117);
            expect(NON_ELIGIBLE_DIVIDEND.QC).toBe(0.0342);
        });

        it('should have correct Alberta rates', () => {
            expect(ELIGIBLE_DIVIDEND.AB).toBe(0.0812);
            expect(NON_ELIGIBLE_DIVIDEND.AB).toBe(0.0218);
        });

        it('should have correct British Columbia rates', () => {
            expect(ELIGIBLE_DIVIDEND.BC).toBe(0.12);
            expect(NON_ELIGIBLE_DIVIDEND.BC).toBe(0.0196);
        });
    });

    describe('Calculations', () => {
        it('should calculate correct eligible dividend gross-up', () => {
            const dividendAmount = 1000;
            const grossedUpAmount = dividendAmount * ELIGIBLE_DIVIDEND.GROSS_UP;
            expect(grossedUpAmount).toBe(1380);
        });

        it('should calculate correct non-eligible dividend gross-up', () => {
            const dividendAmount = 1000;
            const grossedUpAmount = dividendAmount * NON_ELIGIBLE_DIVIDEND.GROSS_UP;
            expect(grossedUpAmount).toBe(1150);
        });

        it('should calculate correct Ontario tax credit for eligible dividends', () => {
            const grossedUpAmount = 1380;
            const taxCredit = grossedUpAmount * ELIGIBLE_DIVIDEND.ON;
            expect(taxCredit).toBe(138);
        });
    });

    describe('Data consistency', () => {
        it('should maintain reasonable rate relationships', () => {
            // Federal rates should be substantial
            expect(ELIGIBLE_DIVIDEND.CA).toBeGreaterThan(0.1);
            expect(NON_ELIGIBLE_DIVIDEND.CA).toBeGreaterThan(0.05);
        });

        it('should be modifiable (not frozen)', () => {
            const originalEligibleCA = ELIGIBLE_DIVIDEND.CA;
            const originalNonEligibleCA = NON_ELIGIBLE_DIVIDEND.CA;

            // These objects are not frozen, so modifications will work
            (ELIGIBLE_DIVIDEND as any).CA = 0.2;
            (NON_ELIGIBLE_DIVIDEND as any).CA = 0.1;

            // Restore original values for other tests
            (ELIGIBLE_DIVIDEND as any).CA = originalEligibleCA;
            (NON_ELIGIBLE_DIVIDEND as any).CA = originalNonEligibleCA;

            expect(ELIGIBLE_DIVIDEND.CA).toBe(originalEligibleCA);
            expect(NON_ELIGIBLE_DIVIDEND.CA).toBe(originalNonEligibleCA);
        });
    });
});
