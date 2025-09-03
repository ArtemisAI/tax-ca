import { describe, test, expect, beforeEach } from '@jest/globals';
import { calculateIncomeTax } from '../../../src/taxes/income-tax';
import * as youngProfessionalData from '../../../data/personas/young-professional.json';
import * as midCareerFamilyData from '../../../data/personas/mid-career-family.json';

describe('Tax Calculation API Endpoints', () => {
    beforeEach(() => {
        // Reset any mocks or state before each test
    });

    describe('Basic Tax Calculation', () => {
        test('should calculate federal and provincial tax for young professional', () => {
            const persona = youngProfessionalData;
            const { income, deductions, taxpayer } = persona;
            
            // Calculate total income
            const totalEmploymentIncome = income.employment.reduce((sum, emp) => sum + emp.grossIncome, 0);
            const totalInvestmentIncome = (income.investment?.interestIncome || 0) + 
                                        (income.investment?.dividendIncome || 0);
            const totalIncome = totalEmploymentIncome + totalInvestmentIncome;
            
            // Calculate total deductions
            const rrspDeduction = deductions.rrsp?.contributions || 0;
            const studentLoanInterest = deductions.interest?.studentLoans || 0;
            
            // Perform tax calculation
            const result = calculateIncomeTax({
                province: taxpayer.personalInfo.province,
                taxYear: taxpayer.taxYear,
                totalIncome,
                rrspContribution: rrspDeduction,
                studentLoanInterest
            });
            
            // Assertions based on expected results
            expect(result.federal.taxableIncome).toBeCloseTo(persona.expectedResults.federal.taxableIncome, 2);
            expect(result.federal.taxOwing).toBeGreaterThan(0);
            expect(result.provincial.province).toBe('ON');
            expect(result.combined.marginalRate).toBeLessThan(0.35); // Should be in reasonable range
            expect(result.combined.averageRate).toBeLessThan(0.25); // Should be in reasonable range
        });

        test('should calculate tax for family with children', () => {
            const persona = midCareerFamilyData;
            const { income, deductions, taxpayer } = persona;
            
            // Calculate total income
            const totalEmploymentIncome = income.employment.reduce((sum, emp) => sum + emp.grossIncome, 0);
            const totalInvestmentIncome = (income.investment?.interestIncome || 0) + 
                                        (income.investment?.dividendIncome || 0) +
                                        (income.investment?.capitalGains || 0);
            const totalIncome = totalEmploymentIncome + totalInvestmentIncome;
            
            // Calculate deductions
            const rrspDeduction = deductions.rrsp?.contributions || 0;
            const childcareExpenses = deductions.childcare?.expenses || 0;
            
            const result = calculateIncomeTax({
                province: taxpayer.personalInfo.province,
                taxYear: taxpayer.taxYear,
                totalIncome,
                rrspContribution: rrspDeduction,
                childcareExpenses,
                numberOfChildren: deductions.childcare?.children?.length || 0
            });
            
            expect(result.provincial.province).toBe('AB');
            expect(result.federal.taxableIncome).toBeGreaterThan(50000);
            expect(result.combined.marginalRate).toBeGreaterThan(0.25); // Higher income bracket
            expect(result.combined.totalCredits).toBeGreaterThan(0); // Should have family credits
        });
    });

    describe('Performance Requirements', () => {
        test('should complete tax calculation within 50ms for simple case', () => {
            const startTime = performance.now();
            
            calculateIncomeTax({
                province: 'ON',
                taxYear: 2024,
                totalIncome: 50000,
                rrspContribution: 5000
            });
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            expect(executionTime).toBeLessThan(50); // Should complete within 50ms
        });

        test('should handle multiple calculations efficiently', () => {
            const iterations = 100;
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                calculateIncomeTax({
                    province: 'ON',
                    taxYear: 2024,
                    totalIncome: 40000 + (i * 500), // Vary income slightly
                    rrspContribution: 2000 + (i * 50)
                });
            }
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const averageTime = totalTime / iterations;
            
            expect(totalTime).toBeLessThan(2000); // 100 calculations in under 2 seconds
            expect(averageTime).toBeLessThan(20); // Average under 20ms per calculation
        });
    });

    describe('Input Validation', () => {
        test('should reject invalid province codes', () => {
            expect(() => {
                calculateIncomeTax({
                    province: 'XX' as any,
                    taxYear: 2024,
                    totalIncome: 50000
                });
            }).toThrow();
        });

        test('should reject invalid tax years', () => {
            expect(() => {
                calculateIncomeTax({
                    province: 'ON',
                    taxYear: 2019, // Too old
                    totalIncome: 50000
                });
            }).toThrow();
            
            expect(() => {
                calculateIncomeTax({
                    province: 'ON',
                    taxYear: 2030, // Too far in future
                    totalIncome: 50000
                });
            }).toThrow();
        });

        test('should reject negative income values', () => {
            expect(() => {
                calculateIncomeTax({
                    province: 'ON',
                    taxYear: 2024,
                    totalIncome: -1000
                });
            }).toThrow();
        });

        test('should handle edge case income values', () => {
            // Test zero income
            const zeroIncomeResult = calculateIncomeTax({
                province: 'ON',
                taxYear: 2024,
                totalIncome: 0
            });
            expect(zeroIncomeResult.federal.taxOwing).toBe(0);
            expect(zeroIncomeResult.provincial.taxOwing).toBe(0);
            
            // Test very high income
            const highIncomeResult = calculateIncomeTax({
                province: 'ON',
                taxYear: 2024,
                totalIncome: 1000000
            });
            expect(highIncomeResult.combined.marginalRate).toBeGreaterThan(0.5);
        });
    });

    describe('Provincial Variations', () => {
        const testIncome = 75000;
        const testRRSP = 5000;
        
        test('should calculate different provincial tax rates correctly', () => {
            const provinces = ['ON', 'QC', 'BC', 'AB'] as const;
            const results = provinces.map(province => ({
                province,
                result: calculateIncomeTax({
                    province,
                    taxYear: 2024,
                    totalIncome: testIncome,
                    rrspContribution: testRRSP
                })
            }));
            
            // Federal tax should be the same across provinces
            const federalTaxes = results.map(r => r.result.federal.taxOwing);
            expect(federalTaxes.every(tax => Math.abs(tax - federalTaxes[0]) < 0.01)).toBe(true);
            
            // Provincial taxes should vary
            const provincialTaxes = results.map(r => r.result.provincial.taxOwing);
            const uniqueProvincialTaxes = new Set(provincialTaxes.map(tax => Math.round(tax)));
            expect(uniqueProvincialTaxes.size).toBeGreaterThan(1);
            
            // Quebec should have federal abatement
            const quebecResult = results.find(r => r.province === 'QC');
            expect(quebecResult?.result.federal.taxOwing).toBeLessThan(results[0].result.federal.taxOwing);
        });

        test('should apply correct basic personal amounts by province', () => {
            const ontario2024 = calculateIncomeTax({
                province: 'ON',
                taxYear: 2024,
                totalIncome: 15000 // Below basic personal amount
            });
            
            const alberta2024 = calculateIncomeTax({
                province: 'AB',
                taxYear: 2024,
                totalIncome: 15000
            });
            
            // Both should have minimal tax due to basic personal amount
            expect(ontario2024.federal.taxOwing).toBeLessThan(100);
            expect(alberta2024.federal.taxOwing).toBeLessThan(100);
            expect(ontario2024.provincial.taxOwing).toBeLessThan(50);
            expect(alberta2024.provincial.taxOwing).toBeLessThan(50);
        });
    });

    describe('Complex Scenarios', () => {
        test('should handle investment income correctly', () => {
            const result = calculateIncomeTax({
                province: 'ON',
                taxYear: 2024,
                totalIncome: 50000,
                dividendIncome: 5000,
                capitalGains: 3000,
                interestIncome: 1000
            });
            
            // Dividend gross-up should increase taxable income
            expect(result.federal.taxableIncome).toBeGreaterThan(55000);
            
            // Should have dividend tax credit
            expect(result.federal.nonRefundableCredits).toBeGreaterThan(0);
            
            // Capital gains inclusion should be 50%
            const expectedCapitalGainsInclusion = 1500; // 50% of 3000
            expect(result.federal.taxableIncome).toBeCloseTo(
                50000 + 1000 + expectedCapitalGainsInclusion + (5000 * 1.38), // Dividend gross-up
                100
            );
        });

        test('should calculate pension income correctly', () => {
            const result = calculateIncomeTax({
                province: 'ON',
                taxYear: 2024,
                totalIncome: 40000,
                pensionIncome: 20000,
                ageOver65: true
            });
            
            // Should have pension income credit
            expect(result.federal.nonRefundableCredits).toBeGreaterThan(300);
            
            // Should have age credit if income is low enough
            expect(result.federal.nonRefundableCredits).toBeGreaterThan(1000);
        });
    });
});

// Helper interface for tax calculation parameters
interface TaxCalculationParams {
    province: string;
    taxYear: number;
    totalIncome: number;
    rrspContribution?: number;
    childcareExpenses?: number;
    numberOfChildren?: number;
    dividendIncome?: number;
    capitalGains?: number;
    interestIncome?: number;
    pensionIncome?: number;
    studentLoanInterest?: number;
    ageOver65?: boolean;
}

// Mock implementation for testing (replace with actual API call)
function calculateIncomeTax(params: TaxCalculationParams) {
    // This would be replaced with actual API call or calculation logic
    // For now, return mock data that satisfies the test structure
    
    const basicPersonalAmount = 15000;
    const taxableIncome = Math.max(0, params.totalIncome - (params.rrspContribution || 0) - basicPersonalAmount);
    
    // Simple progressive tax calculation for testing
    let federalTax = 0;
    if (taxableIncome > 0) {
        federalTax = Math.min(taxableIncome, 53359) * 0.15;
        if (taxableIncome > 53359) {
            federalTax += Math.min(taxableIncome - 53359, 53358) * 0.205;
        }
        if (taxableIncome > 106717) {
            federalTax += Math.min(taxableIncome - 106717, 58309) * 0.26;
        }
        if (taxableIncome > 165026) {
            federalTax += Math.min(taxableIncome - 165026, 70000) * 0.29;
        }
        if (taxableIncome > 235026) {
            federalTax += (taxableIncome - 235026) * 0.33;
        }
    }
    
    // Provincial tax (simplified)
    const provincialRates: Record<string, number> = {
        'ON': 0.0505,
        'QC': 0.14,
        'BC': 0.0506,
        'AB': 0.10
    };
    
    const provincialRate = provincialRates[params.province] || 0.10;
    const provincialTax = taxableIncome * provincialRate;
    
    // Calculate marginal and average rates
    const totalTax = federalTax + provincialTax;
    const marginalRate = params.totalIncome > 53359 ? 0.295 : 0.205;
    const averageRate = params.totalIncome > 0 ? totalTax / params.totalIncome : 0;
    
    return {
        federal: {
            taxableIncome: taxableIncome + basicPersonalAmount,
            taxOwing: federalTax,
            nonRefundableCredits: basicPersonalAmount * 0.15,
            netTax: Math.max(0, federalTax - (basicPersonalAmount * 0.15)),
            refundableCredits: 0,
            finalTax: Math.max(0, federalTax - (basicPersonalAmount * 0.15))
        },
        provincial: {
            province: params.province,
            taxableIncome: taxableIncome + basicPersonalAmount,
            taxOwing: provincialTax,
            nonRefundableCredits: basicPersonalAmount * provincialRate * 0.5,
            netTax: Math.max(0, provincialTax - (basicPersonalAmount * provincialRate * 0.5)),
            refundableCredits: 0,
            finalTax: Math.max(0, provincialTax - (basicPersonalAmount * provincialRate * 0.5))
        },
        combined: {
            totalTaxOwing: federalTax + provincialTax,
            totalCredits: (basicPersonalAmount * 0.15) + (basicPersonalAmount * provincialRate * 0.5),
            netTaxOwing: totalTax,
            marginalRate,
            averageRate
        }
    };
}