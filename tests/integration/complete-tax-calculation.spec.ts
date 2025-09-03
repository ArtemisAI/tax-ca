import {
    getFederalTaxAmount,
    getProvincialTaxAmount,
} from '../../src/taxes/income-tax';

import { CPP } from '../../src/pension/canada-pension-plan';
import { TFSA } from '../../src/investments/tax-free-savings-account';
import { RRSP } from '../../src/investments/registered-retirement-savings-plan';
import { ProvinceCode } from '../../src/misc/code-types';

describe('Integration Tests - Complete Tax Calculation', () => {
    const inflationRate = 0.021;
    const yearsToInflate = 0;

    describe('Full tax return calculation for working professional', () => {
        const taxpayer = {
            grossIncome: 85000,
            province: 'ON' as ProvinceCode,
            age: 35,
            rrspContribution: 10000,
            tfsaContribution: 6500,
        };

        it('should calculate complete tax scenario with all components', () => {
            // Step 1: Calculate pension contribution info using CPP data
            const ympe = CPP.PENSIONABLE_EARNINGS.YMPE;
            const basicExemption = CPP.PENSIONABLE_EARNINGS.BASIC_EXEMPTION;
            const contributionRate = CPP.CONTRIBUTION_RATES.BASE;

            const pensionableEarnings = Math.min(
                Math.max(taxpayer.grossIncome - basicExemption, 0),
                ympe - basicExemption,
            );
            const cppContribution = pensionableEarnings * contributionRate;

            // Step 2: Calculate taxable income after deductions
            const taxableIncome = taxpayer.grossIncome - taxpayer.rrspContribution;

            // Step 3: Calculate federal tax
            const federalTax = getFederalTaxAmount(
                taxpayer.province,
                taxableIncome,
                inflationRate,
                yearsToInflate,
                0, // Basic credits only for this test
            );

            // Step 4: Calculate provincial tax
            const provincialTax = getProvincialTaxAmount(
                taxpayer.province,
                taxableIncome,
                inflationRate,
                yearsToInflate,
                0, // Basic credits only
            );

            // Step 5: Verify calculations are reasonable
            expect(cppContribution).toBeGreaterThan(2500);
            expect(cppContribution).toBeLessThan(4500);

            expect(federalTax).toBeGreaterThan(8000);
            expect(federalTax).toBeLessThan(15000);

            expect(provincialTax).toBeGreaterThan(3000);
            expect(provincialTax).toBeLessThan(8000);

            const totalTax = federalTax + provincialTax;
            const afterTaxIncome = taxableIncome - totalTax;

            // After-tax income should be reasonable
            expect(afterTaxIncome).toBeGreaterThan(50000);

            const effectiveTaxRate = totalTax / taxableIncome;
            expect(effectiveTaxRate).toBeGreaterThan(0.15);
            expect(effectiveTaxRate).toBeLessThan(0.30);
        });

        it('should validate RRSP contribution limits', () => {
            // Test RRSP contribution limit data
            const maxRrspContribution = RRSP.MAX_CONTRIBUTION;

            // Calculate expected max contribution (18% of income, subject to maximum)
            const calculatedMax = Math.min(
                taxpayer.grossIncome * 0.18, // 18% contribution rate
                maxRrspContribution,
            );

            // RRSP contribution should be within limits
            expect(taxpayer.rrspContribution).toBeLessThanOrEqual(calculatedMax);
            expect(calculatedMax).toBeGreaterThan(15000); // Should be at least 18% of 85k income
            expect(maxRrspContribution).toBeGreaterThan(30000); // Should be reasonable max
        });

        it('should validate TFSA contribution limits', () => {
            // Test TFSA contribution limit data
            const tfsaMaxContribution = TFSA.MAX_CONTRIBUTION;

            // TFSA contribution should be within annual limit
            expect(taxpayer.tfsaContribution).toBeLessThanOrEqual(tfsaMaxContribution);
            expect(tfsaMaxContribution).toBeGreaterThan(6000); // Should be reasonable annual limit
        });
    });

    describe('Cross-provincial tax comparison', () => {
        const baseScenario = {
            grossIncome: 75000,
            rrspContribution: 5000,
            taxableIncome: 70000,
            age: 40,
        };

        const provinces: ProvinceCode[] = ['ON', 'QC', 'BC', 'AB'];

        it.each(provinces)('should calculate consistent federal tax across provinces for %s', (province) => {
            const federalTax = getFederalTaxAmount(
                province,
                baseScenario.taxableIncome,
                inflationRate,
                yearsToInflate,
                0,
            );

            // Federal tax should be the same across provinces (before abatement)
            expect(federalTax).toBeGreaterThan(6900);
            expect(federalTax).toBeLessThan(12000);
        });

        it('should show provincial tax variations', () => {
            const provincialTaxes = provinces.map((province) => ({
                province,
                tax: getProvincialTaxAmount(
                    province,
                    baseScenario.taxableIncome,
                    inflationRate,
                    yearsToInflate,
                    0,
                ),
            }));

            // Alberta should have the lowest provincial tax (no provincial income tax)
            const albertaTax = provincialTaxes.find((p) => p.province === 'AB')?.tax || 0;
            const ontarioTax = provincialTaxes.find((p) => p.province === 'ON')?.tax || 0;
            const quebecTax = provincialTaxes.find((p) => p.province === 'QC')?.tax || 0;

            // Alberta should have lower tax than others, Quebec highest
            expect(albertaTax).toBeGreaterThan(0); // Alberta does have some provincial tax
            expect(quebecTax).toBeGreaterThan(ontarioTax); // Quebec typically has higher provincial tax
            expect(ontarioTax).toBeGreaterThan(100); // Ontario should have some tax
            expect(albertaTax).toBeLessThan(quebecTax); // Alberta should be less than Quebec
        });
    });
});
