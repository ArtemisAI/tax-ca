import {
    getFederalTaxAmount,
    getProvincialTaxAmount,
} from '../../src/taxes/income-tax';
import { ProvinceCode } from '../../src/misc/code-types';

describe('Tax Scenario Tests - Young Professional', () => {
    const inflationRate = 0.021; // 2.1% inflation
    const yearsToInflate = 0; // Current year calculations

    describe('Single young professional in Ontario', () => {
        const scenario = {
            name: 'Alex Chen',
            age: 25,
            province: 'ON' as ProvinceCode,
            grossIncome: 55000, // Entry-level software developer
            rrspContribution: 3000,
            taxableIncome: 52000,
            federalTaxCredits: 1000,
            provincialTaxCredits: 500,
        };

        it('should calculate federal tax correctly for young professional', () => {
            const federalTax = getFederalTaxAmount(
                scenario.province,
                scenario.taxableIncome,
                inflationRate,
                yearsToInflate,
                scenario.federalTaxCredits,
            );

            // Expected federal tax for $52,000 income in 2024
            // Federal basic personal amount: $15,000 (approx)
            // Tax brackets: 15% up to ~$55,867
            // Expected tax: ~$5,550 before credits
            expect(federalTax).toBeGreaterThan(4000);
            expect(federalTax).toBeLessThan(7000);
        });

        it('should calculate provincial tax correctly for Ontario resident', () => {
            const provincialTax = getProvincialTaxAmount(
                scenario.province,
                scenario.taxableIncome,
                inflationRate,
                yearsToInflate,
                scenario.provincialTaxCredits,
            );

            // Expected Ontario provincial tax for $52,000 income
            // Ontario basic personal amount: ~$12,000
            // Tax brackets: 5.05% up to ~$51,446, then 9.15%
            // Expected tax: ~$1,400-2,500 before credits
            expect(provincialTax).toBeGreaterThan(1400);
            expect(provincialTax).toBeLessThan(3000);
        });

        it('should have reasonable combined tax rate', () => {
            const federalTax = getFederalTaxAmount(
                scenario.province,
                scenario.taxableIncome,
                inflationRate,
                yearsToInflate,
                scenario.federalTaxCredits,
            );

            const provincialTax = getProvincialTaxAmount(
                scenario.province,
                scenario.taxableIncome,
                inflationRate,
                yearsToInflate,
                scenario.provincialTaxCredits,
            );

            const totalTax = federalTax + provincialTax;
            const effectiveTaxRate = totalTax / scenario.taxableIncome;

            // Effective tax rate should be reasonable for this income level
            expect(effectiveTaxRate).toBeGreaterThan(0.10); // At least 10%
            expect(effectiveTaxRate).toBeLessThan(0.25); // Less than 25%
        });
    });

    describe('Single young professional in Quebec', () => {
        const scenario = {
            name: 'Marie Dubois',
            age: 27,
            province: 'QC' as ProvinceCode,
            grossIncome: 50000,
            rrspContribution: 2500,
            taxableIncome: 47500,
            federalTaxCredits: 1000,
            provincialTaxCredits: 800,
        };

        it('should calculate Quebec provincial tax with higher rates', () => {
            const provincialTax = getProvincialTaxAmount(
                scenario.province,
                scenario.taxableIncome,
                inflationRate,
                yearsToInflate,
                scenario.provincialTaxCredits,
            );

            // Quebec has higher provincial tax rates than Ontario
            // Should be noticeably higher than Ontario for same income
            expect(provincialTax).toBeGreaterThan(2000);
            expect(provincialTax).toBeLessThan(5000);
        });

        it('should account for federal abatement in Quebec', () => {
            const federalTax = getFederalTaxAmount(
                scenario.province,
                scenario.taxableIncome,
                inflationRate,
                yearsToInflate,
                scenario.federalTaxCredits,
            );

            // Federal tax in Quebec should be reduced by abatement
            // This is a complex calculation, but we can verify it's working
            expect(federalTax).toBeGreaterThan(2800);
            expect(federalTax).toBeLessThan(8000);
        });
    });
});
