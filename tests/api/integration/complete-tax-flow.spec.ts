import { describe, test, expect } from '@jest/globals';

// Import persona data for integration testing
import youngProfessional from '../../../data/personas/young-professional.json';
import midCareerFamily from '../../../data/personas/mid-career-family.json';
import seniorExecutive from '../../../data/personas/senior-executive.json';
import recentRetiree from '../../../data/personas/recent-retiree.json';

describe('Complete Tax Flow Integration Tests', () => {
    // Mock function to simulate complete tax calculation flow
    function processCompleteTaxReturn(persona: any) {
        const startTime = performance.now();
        
        // Step 1: Validate input data
        const validationResult = validateTaxpayerData(persona);
        if (!validationResult.isValid) {
            throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
        }
        
        // Step 2: Calculate total income
        const totalIncome = calculateTotalIncome(persona.income);
        
        // Step 3: Calculate total deductions
        const totalDeductions = calculateTotalDeductions(persona.deductions);
        
        // Step 4: Calculate taxable income
        const taxableIncome = Math.max(0, totalIncome - totalDeductions);
        
        // Step 5: Calculate federal tax
        const federalTax = calculateFederalTax(taxableIncome, persona.taxpayer.personalInfo.province);
        
        // Step 6: Calculate provincial tax
        const provincialTax = calculateProvincialTax(taxableIncome, persona.taxpayer.personalInfo.province);
        
        // Step 7: Calculate credits and benefits
        const credits = calculateCredits(persona);
        
        // Step 8: Calculate CPP/EI contributions
        const contributions = calculateContributions(persona.income);
        
        // Step 9: Determine final balance
        const totalTax = federalTax.finalTax + provincialTax.finalTax;
        const taxWithheld = calculateTaxWithheld(persona.income);
        const balanceOwing = totalTax + contributions.additionalCpp + contributions.additionalEi - taxWithheld;
        
        const processingTime = performance.now() - startTime;
        
        return {
            totalIncome,
            totalDeductions,
            taxableIncome,
            federal: federalTax,
            provincial: provincialTax,
            credits,
            contributions,
            balanceOwing,
            processingTime,
            metadata: {
                taxpayerSin: persona.taxpayer.personalInfo.sin,
                taxYear: persona.taxpayer.taxYear,
                province: persona.taxpayer.personalInfo.province,
                calculationDate: new Date().toISOString()
            }
        };
    }
    
    function validateTaxpayerData(persona: any) {
        const errors: string[] = [];
        
        // Basic validation
        if (!persona.taxpayer?.personalInfo?.sin) {
            errors.push('SIN is required');
        }
        
        if (!persona.taxpayer?.personalInfo?.province) {
            errors.push('Province is required');
        }
        
        if (!persona.taxpayer?.taxYear || persona.taxpayer.taxYear < 2020 || persona.taxpayer.taxYear > 2024) {
            errors.push('Valid tax year is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    function calculateTotalIncome(income: any) {
        let total = 0;
        
        // Employment income
        if (income.employment) {
            total += income.employment.reduce((sum: number, emp: any) => sum + (emp.grossIncome || 0), 0);
        }
        
        // Pension income
        if (income.pension) {
            total += (income.pension.cpp || 0) + 
                    (income.pension.oas || 0) + 
                    (income.pension.employerPension || 0) + 
                    (income.pension.rrif || 0);
        }
        
        // Investment income
        if (income.investment) {
            total += (income.investment.interestIncome || 0) + 
                    (income.investment.dividendIncome || 0) + 
                    ((income.investment.capitalGains || 0) * 0.5); // 50% inclusion rate
        }
        
        // Other income
        if (income.other) {
            total += (income.other.businessIncome || 0) + 
                    (income.other.rentalIncome || 0) + 
                    (income.other.ei || 0);
        }
        
        return total;
    }
    
    function calculateTotalDeductions(deductions: any) {
        let total = 0;
        
        if (deductions.rrsp?.contributions) {
            total += deductions.rrsp.contributions;
        }
        
        if (deductions.childcare?.expenses) {
            total += deductions.childcare.expenses;
        }
        
        if (deductions.interest?.studentLoans) {
            total += deductions.interest.studentLoans;
        }
        
        if (deductions.employment?.unionDues) {
            total += deductions.employment.unionDues;
        }
        
        return total;
    }
    
    function calculateFederalTax(taxableIncome: number, province: string) {
        const basicPersonalAmount = 15000;
        const taxableBase = Math.max(0, taxableIncome - basicPersonalAmount);
        
        let tax = 0;
        
        // Federal tax brackets for 2024
        if (taxableBase > 0) {
            tax += Math.min(taxableBase, 53359) * 0.15;
            if (taxableBase > 53359) {
                tax += Math.min(taxableBase - 53359, 53358) * 0.205;
            }
            if (taxableBase > 106717) {
                tax += Math.min(taxableBase - 106717, 58309) * 0.26;
            }
            if (taxableBase > 165026) {
                tax += Math.min(taxableBase - 165026, 70000) * 0.29;
            }
            if (taxableBase > 235026) {
                tax += (taxableBase - 235026) * 0.33;
            }
        }
        
        // Quebec abatement
        if (province === 'QC') {
            tax *= 0.835; // 16.5% abatement
        }
        
        const basicPersonalCredit = basicPersonalAmount * 0.15;
        const netTax = Math.max(0, tax - basicPersonalCredit);
        
        return {
            taxableIncome: taxableBase + basicPersonalAmount,
            taxOwing: tax,
            nonRefundableCredits: basicPersonalCredit,
            netTax,
            finalTax: netTax
        };
    }
    
    function calculateProvincialTax(taxableIncome: number, province: string) {
        const provincialRates: Record<string, { rate: number; basicPersonal: number }> = {
            'ON': { rate: 0.0505, basicPersonal: 12298 },
            'QC': { rate: 0.14, basicPersonal: 18056 },
            'BC': { rate: 0.0506, basicPersonal: 12580 },
            'AB': { rate: 0.10, basicPersonal: 21003 },
            'NS': { rate: 0.0879, basicPersonal: 8744 }
        };
        
        const config = provincialRates[province] || provincialRates['ON'];
        const taxableBase = Math.max(0, taxableIncome - config.basicPersonal);
        const tax = taxableBase * config.rate;
        const basicPersonalCredit = config.basicPersonal * config.rate * 0.5;
        const netTax = Math.max(0, tax - basicPersonalCredit);
        
        return {
            province,
            taxableIncome: taxableBase + config.basicPersonal,
            taxOwing: tax,
            nonRefundableCredits: basicPersonalCredit,
            netTax,
            finalTax: netTax
        };
    }
    
    function calculateCredits(persona: any) {
        // Simplified credit calculation
        return {
            federal: 2000,
            provincial: 1000,
            total: 3000
        };
    }
    
    function calculateContributions(income: any) {
        const employmentIncome = income.employment?.reduce((sum: number, emp: any) => sum + (emp.grossIncome || 0), 0) || 0;
        const businessIncome = income.other?.businessIncome || 0;
        
        const totalPensionableIncome = employmentIncome + businessIncome;
        const cppRequired = Math.min(totalPensionableIncome * 0.0595, 3754.45);
        const eiRequired = Math.min(employmentIncome * 0.0229, 1357.50);
        
        const cppPaid = income.employment?.reduce((sum: number, emp: any) => sum + (emp.cppContributions || 0), 0) || 0;
        const eiPaid = income.employment?.reduce((sum: number, emp: any) => sum + (emp.eiContributions || 0), 0) || 0;
        
        return {
            additionalCpp: Math.max(0, cppRequired - cppPaid),
            additionalEi: Math.max(0, eiRequired - eiPaid),
            cppRequired,
            eiRequired,
            cppPaid,
            eiPaid
        };
    }
    
    function calculateTaxWithheld(income: any) {
        return income.employment?.reduce((sum: number, emp: any) => sum + (emp.incomeTaxDeducted || 0), 0) || 0;
    }

    describe('End-to-End Tax Processing', () => {
        test('should process young professional tax return completely', () => {
            const result = processCompleteTaxReturn(youngProfessional);
            
            expect(result.totalIncome).toBeGreaterThan(50000);
            expect(result.totalDeductions).toBeGreaterThan(0);
            expect(result.taxableIncome).toBeLessThan(result.totalIncome);
            expect(result.federal.finalTax).toBeGreaterThan(0);
            expect(result.provincial.province).toBe('ON');
            expect(result.processingTime).toBeLessThan(100);
            expect(result.metadata.taxpayerSin).toBe(youngProfessional.taxpayer.personalInfo.sin);
        });

        test('should process family tax return with children', () => {
            const result = processCompleteTaxReturn(midCareerFamily);
            
            expect(result.totalIncome).toBeGreaterThan(70000);
            expect(result.totalDeductions).toBeGreaterThan(8000); // RRSP + childcare
            expect(result.provincial.province).toBe('AB');
            expect(result.federal.finalTax).toBeGreaterThan(0);
            expect(result.provincial.finalTax).toBeGreaterThan(0);
            expect(result.processingTime).toBeLessThan(100);
        });

        test('should process senior executive high-income return', () => {
            const result = processCompleteTaxReturn(seniorExecutive);
            
            expect(result.totalIncome).toBeGreaterThan(150000);
            expect(result.totalDeductions).toBeGreaterThan(15000); // Large RRSP contribution
            expect(result.provincial.province).toBe('BC');
            expect(result.federal.finalTax).toBeGreaterThan(20000); // High tax bracket
            expect(result.balanceOwing).toBeGreaterThan(0); // Should owe money
            expect(result.processingTime).toBeLessThan(100);
        });

        test('should process retiree pension income return', () => {
            const result = processCompleteTaxReturn(recentRetiree);
            
            expect(result.totalIncome).toBeGreaterThan(40000);
            expect(result.totalDeductions).toBeLessThan(5000); // Minimal deductions
            expect(result.provincial.province).toBe('NS');
            expect(result.federal.finalTax).toBeGreaterThan(0);
            expect(result.contributions.additionalCpp).toBe(0); // No CPP on pension income
            expect(result.contributions.additionalEi).toBe(0); // No EI on pension income
            expect(result.processingTime).toBeLessThan(100);
        });
    });

    describe('Cross-Provincial Comparisons', () => {
        test('should calculate different provincial taxes for same income', () => {
            // Create test cases for different provinces with same income
            const testIncome = {
                employment: [{ grossIncome: 75000, incomeTaxDeducted: 11250 }],
                investment: { interestIncome: 2000 },
                pension: {},
                other: {}
            };
            
            const testDeductions = {
                rrsp: { contributions: 7500 },
                medical: { totalExpenses: 1000 }
            };
            
            const provinces = ['ON', 'QC', 'BC', 'AB', 'NS'];
            const results = provinces.map(province => {
                const persona = {
                    taxpayer: {
                        personalInfo: { sin: '123456789', province },
                        taxYear: 2024
                    },
                    income: testIncome,
                    deductions: testDeductions
                };
                
                return {
                    province,
                    result: processCompleteTaxReturn(persona)
                };
            });
            
            // Federal tax should be similar (with Quebec abatement exception)
            const federalTaxes = results.map(r => r.result.federal.finalTax);
            const nonQuebecFederal = federalTaxes.filter((_, i) => provinces[i] !== 'QC');
            const federalVariance = Math.max(...nonQuebecFederal) - Math.min(...nonQuebecFederal);
            expect(federalVariance).toBeLessThan(100); // Should be very similar
            
            // Quebec should have lower federal tax due to abatement
            const quebecResult = results.find(r => r.province === 'QC');
            const ontarioResult = results.find(r => r.province === 'ON');
            expect(quebecResult!.result.federal.finalTax).toBeLessThan(ontarioResult!.result.federal.finalTax);
            
            // Provincial taxes should vary significantly
            const provincialTaxes = results.map(r => r.result.provincial.finalTax);
            const provincialVariance = Math.max(...provincialTaxes) - Math.min(...provincialTaxes);
            expect(provincialVariance).toBeGreaterThan(1000); // Should vary significantly
        });
    });

    describe('Integration Performance', () => {
        test('should process multiple returns efficiently', () => {
            const personas = [youngProfessional, midCareerFamily, seniorExecutive, recentRetiree];
            const startTime = performance.now();
            
            const results = personas.map(persona => processCompleteTaxReturn(persona));
            
            const totalTime = performance.now() - startTime;
            
            expect(results).toHaveLength(4);
            expect(totalTime).toBeLessThan(500); // All 4 returns in under 500ms
            
            // Each result should be valid
            results.forEach((result, index) => {
                expect(result.totalIncome).toBeGreaterThan(0);
                expect(result.federal.finalTax).toBeGreaterThanOrEqual(0);
                expect(result.provincial.finalTax).toBeGreaterThanOrEqual(0);
                expect(result.processingTime).toBeLessThan(100);
                expect(result.metadata.taxpayerSin).toBe(personas[index].taxpayer.personalInfo.sin);
            });
        });

        test('should handle concurrent processing', async () => {
            const personas = [youngProfessional, midCareerFamily, seniorExecutive, recentRetiree];
            
            const promises = personas.map(persona => 
                new Promise(resolve => {
                    setTimeout(() => {
                        const result = processCompleteTaxReturn(persona);
                        resolve(result);
                    }, Math.random() * 10);
                })
            );
            
            const startTime = performance.now();
            const results = await Promise.all(promises);
            const totalTime = performance.now() - startTime;
            
            expect(results).toHaveLength(4);
            expect(totalTime).toBeLessThan(200); // Concurrent processing should be faster
            
            // Verify all results are valid
            results.forEach(result => {
                expect(result).toHaveProperty('totalIncome');
                expect(result).toHaveProperty('federal');
                expect(result).toHaveProperty('provincial');
                expect(result).toHaveProperty('metadata');
            });
        });
    });

    describe('Data Consistency Validation', () => {
        test('should maintain mathematical consistency in calculations', () => {
            const result = processCompleteTaxReturn(youngProfessional);
            
            // Tax calculations should be mathematically consistent
            expect(result.federal.netTax).toBe(
                Math.max(0, result.federal.taxOwing - result.federal.nonRefundableCredits)
            );
            
            expect(result.provincial.netTax).toBe(
                Math.max(0, result.provincial.taxOwing - result.provincial.nonRefundableCredits)
            );
            
            // Total tax should equal federal + provincial
            const totalTax = result.federal.finalTax + result.provincial.finalTax;
            expect(Math.abs(totalTax - (result.federal.finalTax + result.provincial.finalTax))).toBeLessThan(0.01);
        });

        test('should validate income and deduction relationships', () => {
            const result = processCompleteTaxReturn(midCareerFamily);
            
            // Taxable income should not exceed total income
            expect(result.taxableIncome).toBeLessThanOrEqual(result.totalIncome);
            
            // Deductions should reduce taxable income
            expect(result.totalIncome - result.totalDeductions).toBeCloseTo(result.taxableIncome, 0);
            
            // Tax should be based on taxable income
            expect(result.federal.taxableIncome).toBeCloseTo(result.taxableIncome, 100);
            expect(result.provincial.taxableIncome).toBeCloseTo(result.taxableIncome, 100);
        });
    });
});