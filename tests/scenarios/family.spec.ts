import {
    getFederalTaxAmount,
    getProvincialTaxAmount,
} from '../../src/taxes/income-tax';

import { CPP } from '../../src/pension/canada-pension-plan';
import { ProvinceCode } from '../../src/misc/code-types';

describe('Tax Scenario Tests - Family Scenarios', () => {
    const inflationRate = 0.021;
    const yearsToInflate = 0;

    describe('Young family with two children', () => {
        const scenario = {
            primaryName: 'David Martinez',
            spouseName: 'Sarah Martinez',
            children: 2,
            childAges: [3, 6],
            province: 'ON' as ProvinceCode,
            primaryIncome: 75000,
            spouseIncome: 45000,
            combinedIncome: 120000,
            childcareExpenses: 15000,
            rrspContributions: 8000,
            respContributions: 5000,
            federalTaxCredits: 3000, // Including child tax credits
            provincialTaxCredits: 2000,
        };

        it('should validate CPP contribution data for family earners', () => {
            // Test CPP data structures for working professionals
            const ympe = CPP.PENSIONABLE_EARNINGS.YMPE;
            const basicExemption = CPP.PENSIONABLE_EARNINGS.BASIC_EXEMPTION;
            const contributionRate = CPP.CONTRIBUTION_RATES.BASE;

            // Calculate potential CPP contributions for both earners
            const primaryPensionableEarnings = Math.min(
                Math.max(scenario.primaryIncome - basicExemption, 0),
                ympe - basicExemption,
            );
            const spousePensionableEarnings = Math.min(
                Math.max(scenario.spouseIncome - basicExemption, 0),
                ympe - basicExemption,
            );

            const primaryCppContribution = primaryPensionableEarnings * contributionRate;
            const spouseCppContribution = spousePensionableEarnings * contributionRate;

            expect(primaryCppContribution).toBeGreaterThan(2000);
            expect(primaryCppContribution).toBeLessThan(4500);
            expect(spouseCppContribution).toBeGreaterThan(1500);
            expect(spouseCppContribution).toBeLessThan(3000);
            expect(ympe).toBeGreaterThan(70000); // YMPE should be reasonable
        });

        it('should calculate primary earner federal tax', () => {
            const federalTax = getFederalTaxAmount(
                scenario.province,
                scenario.primaryIncome - (scenario.rrspContributions * 0.6), // Primary earner RRSP portion
                inflationRate,
                yearsToInflate,
                scenario.federalTaxCredits * 0.6, // Approximate primary portion
            );

            // Should be in 20.5% bracket for income over ~$55,867
            expect(federalTax).toBeGreaterThan(6000);
            expect(federalTax).toBeLessThan(15000);
        });

        it('should calculate spouse federal tax', () => {
            const federalTax = getFederalTaxAmount(
                scenario.province,
                scenario.spouseIncome - (scenario.rrspContributions * 0.4), // Spouse RRSP portion
                inflationRate,
                yearsToInflate,
                scenario.federalTaxCredits * 0.4, // Approximate spouse portion
            );

            // Lower income spouse in 15% bracket
            expect(federalTax).toBeGreaterThan(2000);
            expect(federalTax).toBeLessThan(8000);
        });

        it('should benefit from family tax planning', () => {
            // Test income splitting benefits through RRSP contributions
            const totalTaxCredits = scenario.federalTaxCredits + scenario.provincialTaxCredits;
            const totalTaxableIncome = scenario.combinedIncome - scenario.rrspContributions;

            // Family should benefit from progressive tax brackets and credits
            expect(totalTaxCredits).toBeGreaterThan(4000); // Significant family credits
            expect(totalTaxableIncome).toBeLessThan(scenario.combinedIncome); // RRSP reduces taxable income
        });
    });

    describe('Single parent scenario', () => {
        const scenario = {
            name: 'Jennifer Adams',
            children: 1,
            childAge: 8,
            province: 'BC' as ProvinceCode,
            grossIncome: 62000,
            childcareExpenses: 8000,
            taxableIncome: 58000, // After childcare deduction
            federalTaxCredits: 4000, // Enhanced credits for single parent
            provincialTaxCredits: 2500,
        };

        it('should calculate tax with enhanced single parent credits', () => {
            const federalTax = getFederalTaxAmount(
                scenario.province,
                scenario.taxableIncome,
                inflationRate,
                yearsToInflate,
                scenario.federalTaxCredits,
            );

            // Should benefit from eligible dependent credit and other single parent benefits
            expect(federalTax).toBeGreaterThan(1800);
            expect(federalTax).toBeLessThan(10000);
        });

        it('should calculate BC provincial tax', () => {
            const provincialTax = getProvincialTaxAmount(
                scenario.province,
                scenario.taxableIncome,
                inflationRate,
                yearsToInflate,
                scenario.provincialTaxCredits,
            );

            // BC has different tax structure than Ontario
            expect(provincialTax).toBeGreaterThan(0);
            expect(provincialTax).toBeLessThan(6000);
        });

        it('should have reasonable after-tax income for single parent', () => {
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
            const afterTaxIncome = scenario.taxableIncome - totalTax;

            // After-tax income should be reasonable for family support
            expect(afterTaxIncome).toBeGreaterThan(40000);
            expect(afterTaxIncome / scenario.taxableIncome).toBeGreaterThan(0.70); // Less than 30% total tax
        });
    });
});
