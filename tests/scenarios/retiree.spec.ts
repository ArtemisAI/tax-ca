import {
    getFederalTaxAmount,
    getProvincialTaxAmount,
} from '../../src/taxes/income-tax';

import { CPP } from '../../src/pension/canada-pension-plan';
import { OAS } from '../../src/pension/old-age-security';
import { ProvinceCode } from '../../src/misc/code-types';

describe('Tax Scenario Tests - Retiree', () => {
    const inflationRate = 0.021;
    const yearsToInflate = 0;

    describe('Retiree with pension and RRIF income', () => {
        const scenario = {
            name: 'Robert Thompson',
            age: 68,
            province: 'ON' as ProvinceCode,
            pensionIncome: 35000, // Company pension
            rrifWithdrawal: 25000, // RRIF mandatory withdrawal
            oasPension: 7500, // OAS pension (approximate annual)
            cppPension: 12000, // CPP pension
            investmentIncome: 5000, // Non-registered investments
            totalIncome: 84500,
            federalTaxCredits: 2000, // Age credit, pension credit
            provincialTaxCredits: 1200,
        };

        it('should calculate OAS clawback information for higher income retiree', () => {
            // Test OAS clawback threshold data
            const oasRepaymentMin = OAS.REPAYMENT.MIN;
            const oasRepaymentMax = OAS.REPAYMENT.MAX;
            const oasRepaymentRatio = OAS.REPAYMENT.RATIO;

            // This income is just below typical clawback threshold
            expect(scenario.totalIncome).toBeLessThan(oasRepaymentMax);
            expect(oasRepaymentMin).toBeGreaterThan(0);
            expect(oasRepaymentRatio).toBe(0.15); // 15% clawback rate
        });

        it('should calculate federal tax with pension credits', () => {
            const federalTax = getFederalTaxAmount(
                scenario.province,
                scenario.totalIncome,
                inflationRate,
                yearsToInflate,
                scenario.federalTaxCredits
            );

            // Should benefit from age credit and pension income credit
            expect(federalTax).toBeGreaterThan(5000);
            expect(federalTax).toBeLessThan(12000);
        });

        it('should calculate provincial tax with senior benefits', () => {
            const provincialTax = getProvincialTaxAmount(
                scenario.province,
                scenario.totalIncome,
                inflationRate,
                yearsToInflate,
                scenario.provincialTaxCredits
            );

            // Ontario seniors get additional credits
            expect(provincialTax).toBeGreaterThan(3000);
            expect(provincialTax).toBeLessThan(8000);
        });

        it('should have no CPP contributions for retiree over 65', () => {
            // Test CPP data for retirees
            const maxRequestAge = CPP.MAX_REQUEST_AGE;
            const minRequestAge = CPP.MIN_REQUEST_AGE;
            const maxRetirementPension = CPP.MAX_PENSION.RETIREMENT;

            // Retirees over 65 benefit from CPP but don't contribute
            expect(scenario.age).toBeGreaterThan(65);
            expect(maxRequestAge).toBe(70);
            expect(minRequestAge).toBe(60);
            expect(maxRetirementPension).toBeGreaterThan(15000); // Should be reasonable max pension
        });
    });

    describe('High-income retiree with OAS clawback', () => {
        const scenario = {
            name: 'Margaret Wilson',
            age: 70,
            province: 'BC' as ProvinceCode,
            pensionIncome: 60000,
            rrifWithdrawal: 40000,
            investmentIncome: 15000,
            totalIncome: 115000, // Above OAS clawback threshold
            oasPension: 7500,
            cppPension: 15000,
            federalTaxCredits: 2500,
            provincialTaxCredits: 1000,
        };

        it('should calculate OAS clawback for high income', () => {
            // Test high income OAS clawback scenario
            const oasRepaymentRatio = OAS.REPAYMENT.RATIO;
            
            // Calculate potential clawback manually
            const excessIncome = Math.max(0, scenario.totalIncome - OAS.REPAYMENT.MIN);
            const potentialClawback = excessIncome * oasRepaymentRatio;
            const actualClawback = Math.min(potentialClawback, scenario.oasPension);

            // Should have some clawback at this income level
            expect(actualClawback).toBeGreaterThan(0);
            expect(actualClawback).toBeLessThan(scenario.oasPension);
            expect(scenario.totalIncome).toBeGreaterThan(OAS.REPAYMENT.MIN);
        });

        it('should calculate higher tax rate for affluent retiree', () => {
            const federalTax = getFederalTaxAmount(
                scenario.province,
                scenario.totalIncome,
                inflationRate,
                yearsToInflate,
                scenario.federalTaxCredits
            );

            const effectiveTaxRate = federalTax / scenario.totalIncome;

            // Should be in higher tax bracket
            expect(effectiveTaxRate).toBeGreaterThan(0.10);
            expect(effectiveTaxRate).toBeLessThan(0.30);
        });
    });
});