import {
    ELIGIBLE_DIVIDEND,
    NON_ELIGIBLE_DIVIDEND,
} from '../../src/taxes/dividend-credit';
import { ProvinceCode } from '../../src/misc/code-types';

describe('Scenario Tests - Dividend Tax Credits', () => {
    describe('Eligible Dividend Scenarios', () => {
        it('should calculate correct tax credits for Ontario investor with eligible dividends', () => {
            const province: ProvinceCode = 'ON';
            const dividendIncome = 5000;
            
            // Step 1: Calculate gross-up amount
            const grossUpRate = ELIGIBLE_DIVIDEND.GROSS_UP;
            const grossedUpAmount = dividendIncome * grossUpRate;
            const grossUpIncrease = grossedUpAmount - dividendIncome;
            
            // Step 2: Calculate federal tax credit
            const federalCreditRate = ELIGIBLE_DIVIDEND.CA;
            const federalCredit = grossedUpAmount * federalCreditRate;
            
            // Step 3: Calculate provincial tax credit
            const provincialCreditRate = ELIGIBLE_DIVIDEND[province];
            const provincialCredit = grossedUpAmount * provincialCreditRate;
            
            // Step 4: Calculate total tax credit
            const totalCredit = federalCredit + provincialCredit;
            
            // Validation: Ensure calculations are reasonable
            expect(grossUpRate).toBe(1.38);
            expect(grossedUpAmount).toBeCloseTo(6900, 2);
            expect(grossUpIncrease).toBeCloseTo(1900, 2);
            expect(federalCredit).toBeCloseTo(1036.37, 2);
            expect(provincialCredit).toBeCloseTo(690, 2);
            expect(totalCredit).toBeCloseTo(1726.37, 2);
            
            // The total credit should be substantial, though may not exceed gross-up in all provinces
            expect(totalCredit).toBeGreaterThan(dividendIncome * 0.25); // At least 25% of original dividend
        });

        it('should calculate correct tax credits for Quebec investor with eligible dividends', () => {
            const province: ProvinceCode = 'QC';
            const dividendIncome = 10000;
            
            const grossedUpAmount = dividendIncome * ELIGIBLE_DIVIDEND.GROSS_UP;
            const federalCredit = grossedUpAmount * ELIGIBLE_DIVIDEND.CA;
            const provincialCredit = grossedUpAmount * ELIGIBLE_DIVIDEND[province];
            const totalCredit = federalCredit + provincialCredit;
            
            expect(grossedUpAmount).toBeCloseTo(13800, 2);
            expect(federalCredit).toBeCloseTo(2072.73, 2);
            expect(provincialCredit).toBeCloseTo(1614.60, 2);
            expect(totalCredit).toBeCloseTo(3687.33, 2);
        });

        it('should validate all provinces have positive eligible dividend credit rates', () => {
            const provinces: ProvinceCode[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
            
            provinces.forEach(province => {
                const rate = ELIGIBLE_DIVIDEND[province];
                expect(rate).toBeGreaterThan(0);
                expect(rate).toBeLessThan(0.2); // Reasonable upper bound
            });
        });
    });

    describe('Non-Eligible Dividend Scenarios', () => {
        it('should calculate correct tax credits for British Columbia investor with non-eligible dividends', () => {
            const province: ProvinceCode = 'BC';
            const dividendIncome = 3000;
            
            const grossedUpAmount = dividendIncome * NON_ELIGIBLE_DIVIDEND.GROSS_UP;
            const grossUpIncrease = grossedUpAmount - dividendIncome;
            const federalCredit = grossedUpAmount * NON_ELIGIBLE_DIVIDEND.CA;
            const provincialCredit = grossedUpAmount * NON_ELIGIBLE_DIVIDEND[province];
            const totalCredit = federalCredit + provincialCredit;
            
            expect(grossedUpAmount).toBeCloseTo(3450, 2);
            expect(grossUpIncrease).toBeCloseTo(450, 2);
            expect(federalCredit).toBeCloseTo(311.54, 2);
            expect(provincialCredit).toBeCloseTo(67.62, 2);
            expect(totalCredit).toBeCloseTo(379.16, 2);
            
            // Non-eligible dividends typically provide lower benefits
            expect(totalCredit).toBeLessThan(grossUpIncrease + dividendIncome * 0.1);
        });

        it('should calculate correct tax credits for Alberta small business dividends', () => {
            const province: ProvinceCode = 'AB';
            const dividendIncome = 8000;
            
            const grossedUpAmount = dividendIncome * NON_ELIGIBLE_DIVIDEND.GROSS_UP;
            const federalCredit = grossedUpAmount * NON_ELIGIBLE_DIVIDEND.CA;
            const provincialCredit = grossedUpAmount * NON_ELIGIBLE_DIVIDEND[province];
            const totalCredit = federalCredit + provincialCredit;
            
            expect(grossedUpAmount).toBeCloseTo(9200, 2);
            expect(federalCredit).toBeCloseTo(830.77, 2);
            expect(provincialCredit).toBeCloseTo(200.56, 2);
            expect(totalCredit).toBeCloseTo(1031.33, 2);
        });

        it('should validate non-eligible dividend rates are lower than eligible rates', () => {
            const provinces: ProvinceCode[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
            
            provinces.forEach(province => {
                const eligibleRate = ELIGIBLE_DIVIDEND[province];
                const nonEligibleRate = NON_ELIGIBLE_DIVIDEND[province];
                
                expect(nonEligibleRate).toBeGreaterThan(0);
                expect(nonEligibleRate).toBeLessThan(eligibleRate);
            });
        });
    });

    describe('Comparative Analysis Scenarios', () => {
        it('should demonstrate tax advantage of eligible vs non-eligible dividends', () => {
            const province: ProvinceCode = 'ON';
            const dividendAmount = 5000;
            
            // Eligible dividend calculation
            const eligibleGrossedUp = dividendAmount * ELIGIBLE_DIVIDEND.GROSS_UP;
            const eligibleFederalCredit = eligibleGrossedUp * ELIGIBLE_DIVIDEND.CA;
            const eligibleProvincialCredit = eligibleGrossedUp * ELIGIBLE_DIVIDEND[province];
            const eligibleTotalCredit = eligibleFederalCredit + eligibleProvincialCredit;
            
            // Non-eligible dividend calculation
            const nonEligibleGrossedUp = dividendAmount * NON_ELIGIBLE_DIVIDEND.GROSS_UP;
            const nonEligibleFederalCredit = nonEligibleGrossedUp * NON_ELIGIBLE_DIVIDEND.CA;
            const nonEligibleProvincialCredit = nonEligibleGrossedUp * NON_ELIGIBLE_DIVIDEND[province];
            const nonEligibleTotalCredit = nonEligibleFederalCredit + nonEligibleProvincialCredit;
            
            // Eligible dividends should provide higher tax credits
            expect(eligibleTotalCredit).toBeGreaterThan(nonEligibleTotalCredit);
            expect(eligibleGrossedUp).toBeGreaterThan(nonEligibleGrossedUp);
            
            const creditDifference = eligibleTotalCredit - nonEligibleTotalCredit;
            expect(creditDifference).toBeGreaterThan(500); // Significant advantage
        });

        it('should calculate cross-provincial dividend tax treatment comparison', () => {
            const dividendAmount = 10000;
            const provinces: ProvinceCode[] = ['ON', 'QC', 'BC', 'AB'];
            const results: Array<{province: ProvinceCode; totalCredit: number}> = [];
            
            provinces.forEach(province => {
                const grossedUpAmount = dividendAmount * ELIGIBLE_DIVIDEND.GROSS_UP;
                const federalCredit = grossedUpAmount * ELIGIBLE_DIVIDEND.CA;
                const provincialCredit = grossedUpAmount * ELIGIBLE_DIVIDEND[province];
                const totalCredit = federalCredit + provincialCredit;
                
                results.push({ province, totalCredit });
            });
            
            // Validate all results are positive and reasonable
            results.forEach(result => {
                expect(result.totalCredit).toBeGreaterThan(1000);
                expect(result.totalCredit).toBeLessThan(5000);
            });
            
            // Find the province with the highest credit
            const maxCredit = Math.max(...results.map(r => r.totalCredit));
            const minCredit = Math.min(...results.map(r => r.totalCredit));
            
            // There should be meaningful differences between provinces
            expect(maxCredit - minCredit).toBeGreaterThan(100);
        });
    });

    describe('Edge Case Scenarios', () => {
        it('should handle zero dividend income', () => {
            const province: ProvinceCode = 'ON';
            const dividendIncome = 0;
            
            const grossedUpAmount = dividendIncome * ELIGIBLE_DIVIDEND.GROSS_UP;
            const federalCredit = grossedUpAmount * ELIGIBLE_DIVIDEND.CA;
            const provincialCredit = grossedUpAmount * ELIGIBLE_DIVIDEND[province];
            
            expect(grossedUpAmount).toBe(0);
            expect(federalCredit).toBe(0);
            expect(provincialCredit).toBe(0);
        });

        it('should handle very large dividend amounts', () => {
            const province: ProvinceCode = 'ON';
            const dividendIncome = 1000000; // $1M in dividends
            
            const grossedUpAmount = dividendIncome * ELIGIBLE_DIVIDEND.GROSS_UP;
            const federalCredit = grossedUpAmount * ELIGIBLE_DIVIDEND.CA;
            const provincialCredit = grossedUpAmount * ELIGIBLE_DIVIDEND[province];
            const totalCredit = federalCredit + provincialCredit;
            
            expect(grossedUpAmount).toBeCloseTo(1380000, 0);
            expect(totalCredit).toBeCloseTo(345273.24, 2);
            expect(totalCredit).toBeGreaterThan(dividendIncome * 0.3); // Substantial credit
        });

        it('should validate dividend credit rate structure integrity', () => {
            // Ensure all required properties exist and are valid
            expect(ELIGIBLE_DIVIDEND.GROSS_UP).toBe(1.38);
            expect(NON_ELIGIBLE_DIVIDEND.GROSS_UP).toBe(1.15);
            
            // Check that federal rates exist
            expect(ELIGIBLE_DIVIDEND.CA).toBeGreaterThan(0);
            expect(NON_ELIGIBLE_DIVIDEND.CA).toBeGreaterThan(0);
            
            // Validate gross-up factors are different
            expect(ELIGIBLE_DIVIDEND.GROSS_UP).toBeGreaterThan(NON_ELIGIBLE_DIVIDEND.GROSS_UP);
        });
    });
});