import { describe, test, expect, beforeEach } from '@jest/globals';

// Import provincial data for testing
import ontarioData from '../../../data/provinces/ontario.json';
import quebecData from '../../../data/provinces/quebec.json';

// Import test personas
import youngProfessional from '../../../data/personas/young-professional.json';
import seniorExecutive from '../../../data/personas/senior-executive.json';
import recentRetiree from '../../../data/personas/recent-retiree.json';
import establishedRetiree from '../../../data/personas/established-retiree.json';

describe('Provincial Tax Variations API', () => {
    beforeEach(() => {
        // Setup test environment
    });

    describe('Provincial Tax Rate Calculations', () => {
        test('should calculate Ontario tax correctly for different income levels', () => {
            const testIncomes = [25000, 50000, 75000, 100000, 150000, 250000];
            
            testIncomes.forEach(income => {
                const result = calculateProvincialTax(income, 'ON');
                
                expect(result.province).toBe('ON');
                expect(result.taxOwing).toBeGreaterThanOrEqual(0);
                expect(result.marginalRate).toBeGreaterThan(0);
                
                // Verify progressive taxation
                if (income > ontarioData.basicPersonalAmount) {
                    expect(result.taxOwing).toBeGreaterThan(0);
                }
                
                // Verify marginal rates increase with income
                if (income > 100000) {
                    expect(result.marginalRate).toBeGreaterThan(0.10);
                }
            });
        });

        test('should calculate Quebec tax with federal abatement', () => {
            const income = 75000;
            
            const quebecResult = calculateProvincialTax(income, 'QC');
            const ontarioResult = calculateProvincialTax(income, 'ON');
            
            expect(quebecResult.province).toBe('QC');
            expect(quebecResult.federalAbatement).toBe(quebecData.federalAbatement);
            
            // Quebec should have higher provincial tax but lower federal tax
            expect(quebecResult.taxOwing).toBeGreaterThan(ontarioResult.taxOwing);
            expect(quebecResult.federalTaxReduction).toBeGreaterThan(0);
        });

        test('should apply correct basic personal amounts by province', () => {
            const testIncome = 20000; // Above some basic personal amounts, below others
            
            const provinces = [
                { code: 'ON', basicPersonal: ontarioData.basicPersonalAmount },
                { code: 'QC', basicPersonal: quebecData.basicPersonalAmount }
            ];
            
            provinces.forEach(province => {
                const result = calculateProvincialTax(testIncome, province.code);
                
                const expectedTaxableIncome = Math.max(0, testIncome - province.basicPersonal);
                expect(result.taxableIncome).toBeCloseTo(expectedTaxableIncome, 0);
                
                if (testIncome <= province.basicPersonal) {
                    expect(result.taxOwing).toBe(0);
                }
            });
        });
    });

    describe('Provincial Credits and Benefits', () => {
        test('should calculate Ontario health premium correctly', () => {
            const testCases = [
                { income: 15000, expectedPremium: 0 },
                { income: 22500, expectedPremium: 300 },
                { income: 30000, expectedPremium: 450 },
                { income: 42000, expectedPremium: 600 },
                { income: 60000, expectedPremium: 750 },
                { income: 100000, expectedPremium: 900 }
            ];
            
            testCases.forEach(testCase => {
                const result = calculateOntarioHealthPremium(testCase.income);
                expect(result.premium).toBe(testCase.expectedPremium);
            });
        });

        test('should calculate Quebec solidarity tax credit', () => {
            const singlePersonIncome = 20000;
            const coupleIncome = 35000;
            
            const singleCredit = calculateQuebecSolidarityCredit(singlePersonIncome, 'single');
            const coupleCredit = calculateQuebecSolidarityCredit(coupleIncome, 'couple');
            
            expect(singleCredit.amount).toBeGreaterThan(0);
            expect(coupleCredit.amount).toBeGreaterThan(singleCredit.amount);
            
            // Credit should phase out with higher income
            const highIncomeSingle = calculateQuebecSolidarityCredit(50000, 'single');
            expect(highIncomeSingle.amount).toBeLessThan(singleCredit.amount);
        });

        test('should calculate age amount credits by province', () => {
            const seniorIncome = 40000;
            const highIncomeSenior = 80000;
            
            const ontarioAgeCredit = calculateProvincialAgeCredit(seniorIncome, 'ON');
            const quebecAgeCredit = calculateProvincialAgeCredit(seniorIncome, 'QC');
            
            expect(ontarioAgeCredit.amount).toBeGreaterThan(0);
            expect(quebecAgeCredit.amount).toBeGreaterThan(0);
            
            // Credit should be reduced for high-income seniors
            const ontarioHighIncomeCredit = calculateProvincialAgeCredit(highIncomeSenior, 'ON');
            expect(ontarioHighIncomeCredit.amount).toBeLessThan(ontarioAgeCredit.amount);
        });
    });

    describe('Cross-Provincial Comparisons', () => {
        test('should show tax differences between provinces for same taxpayer', () => {
            const testTaxpayer = {
                income: 65000,
                rrspContribution: 5000,
                age: 35,
                maritalStatus: 'single'
            };
            
            const provinces = ['ON', 'QC', 'BC', 'AB'];
            const results = provinces.map(province => ({
                province,
                result: calculateCompleteTax(testTaxpayer, province)
            }));
            
            // Federal tax should be similar (except Quebec with abatement)
            const federalTaxes = results.map(r => r.result.federal.finalTax);
            const nonQuebecFederal = federalTaxes.filter((_, i) => provinces[i] !== 'QC');
            const federalVariance = Math.max(...nonQuebecFederal) - Math.min(...nonQuebecFederal);
            expect(federalVariance).toBeLessThan(50); // Should be very similar
            
            // Provincial taxes should vary significantly
            const provincialTaxes = results.map(r => r.result.provincial.finalTax);
            const provincialVariance = Math.max(...provincialTaxes) - Math.min(...provincialTaxes);
            expect(provincialVariance).toBeGreaterThan(1000);
            
            // Combined rates should show clear differences
            const combinedRates = results.map(r => r.result.combined.marginalRate);
            expect(Math.max(...combinedRates) - Math.min(...combinedRates)).toBeGreaterThan(0.05);
        });

        test('should handle persona tax calculations across provinces', () => {
            const persona = youngProfessional;
            const originalProvince = persona.taxpayer.personalInfo.province;
            
            const provinces = ['ON', 'QC', 'BC', 'AB', 'NS'];
            const results = provinces.map(province => {
                const modifiedPersona = {
                    ...persona,
                    taxpayer: {
                        ...persona.taxpayer,
                        personalInfo: {
                            ...persona.taxpayer.personalInfo,
                            province
                        }
                    }
                };
                
                return {
                    province,
                    result: processPersonaTaxReturn(modifiedPersona)
                };
            });
            
            // All results should be valid
            results.forEach(({ province, result }) => {
                expect(result.provincial.province).toBe(province);
                expect(result.totalIncome).toBeGreaterThan(0);
                expect(result.federal.finalTax).toBeGreaterThanOrEqual(0);
                expect(result.provincial.finalTax).toBeGreaterThanOrEqual(0);
            });
            
            // Quebec should have different federal tax due to abatement
            const quebecResult = results.find(r => r.province === 'QC');
            const ontarioResult = results.find(r => r.province === 'ON');
            
            expect(quebecResult!.result.federal.finalTax).toBeLessThan(
                ontarioResult!.result.federal.finalTax
            );
        });
    });

    describe('High-Income Provincial Variations', () => {
        test('should calculate surtax and high-income provisions', () => {
            const highIncome = 200000;
            
            const ontarioResult = calculateProvincialTax(highIncome, 'ON');
            
            // Ontario surtax should apply
            expect(ontarioResult.surtax).toBeGreaterThan(0);
            expect(ontarioResult.effectiveRate).toBeGreaterThan(0.11);
            
            // Health premium should be at maximum
            const healthPremium = calculateOntarioHealthPremium(highIncome);
            expect(healthPremium.premium).toBe(900);
        });

        test('should handle Quebec high-income taxation', () => {
            const highIncome = 180000;
            
            const quebecResult = calculateProvincialTax(highIncome, 'QC');
            
            // Should be in top Quebec tax bracket
            expect(quebecResult.marginalRate).toBeCloseTo(0.2575, 2);
            
            // Federal abatement should still apply
            expect(quebecResult.federalAbatement).toBe(0.165);
            
            // Health services fund should apply
            const hsf = calculateQuebecHealthServicesFund(highIncome);
            expect(hsf.contribution).toBeGreaterThan(1000);
        });
    });

    describe('Senior-Specific Provincial Provisions', () => {
        test('should calculate senior benefits across provinces', () => {
            const seniorTaxpayer = {
                ...recentRetiree.taxpayer,
                income: recentRetiree.income
            };
            
            const provinces = ['ON', 'QC', 'NS', 'MB'];
            const results = provinces.map(province => {
                const modifiedTaxpayer = {
                    ...seniorTaxpayer,
                    personalInfo: {
                        ...seniorTaxpayer.personalInfo,
                        province
                    }
                };
                
                return {
                    province,
                    result: calculateSeniorTaxBenefits(modifiedTaxpayer)
                };
            });
            
            // All provinces should provide age-related benefits
            results.forEach(({ province, result }) => {
                expect(result.ageCredit).toBeGreaterThan(0);
                expect(result.pensionIncomeCredit).toBeGreaterThan(0);
                
                // Some provinces have additional senior benefits
                if (province === 'ON') {
                    expect(result.seniorHomeownersCredit).toBeDefined();
                }
            });
        });
    });

    describe('Performance Across Provinces', () => {
        test('should calculate provincial taxes efficiently', () => {
            const testIncome = 75000;
            const provinces = ['ON', 'QC', 'BC', 'AB', 'SK', 'MB', 'NS', 'NB', 'PE', 'NL'];
            
            const startTime = performance.now();
            
            const results = provinces.map(province => {
                const iterationStart = performance.now();
                const result = calculateProvincialTax(testIncome, province);
                const iterationTime = performance.now() - iterationStart;
                
                expect(iterationTime).toBeLessThan(25); // Each calculation under 25ms
                return result;
            });
            
            const totalTime = performance.now() - startTime;
            
            expect(totalTime).toBeLessThan(250); // All provinces under 250ms
            expect(results).toHaveLength(10);
            
            // All results should be valid
            results.forEach((result, index) => {
                expect(result.province).toBe(provinces[index]);
                expect(result.taxOwing).toBeGreaterThanOrEqual(0);
            });
        });
    });
});

// Mock calculation functions (would be replaced with actual implementation)

function calculateProvincialTax(income: number, province: string) {
    const provincialData = getProvincialData(province);
    const basicPersonal = provincialData.basicPersonalAmount;
    const taxableIncome = Math.max(0, income - basicPersonal);
    
    let tax = 0;
    let marginalRate = 0;
    
    for (const bracket of provincialData.taxBrackets) {
        const bracketMin = bracket.min;
        const bracketMax = bracket.max || Infinity;
        
        if (taxableIncome > bracketMin) {
            const taxableInBracket = Math.min(taxableIncome - bracketMin, bracketMax - bracketMin);
            tax += taxableInBracket * bracket.rate;
            
            if (taxableIncome > bracketMin && taxableIncome <= bracketMax) {
                marginalRate = bracket.rate;
            }
        }
    }
    
    // Apply surtax if applicable
    let surtax = 0;
    if (province === 'ON' && provincialData.surtax) {
        if (tax > provincialData.surtax.threshold1) {
            surtax += Math.min(tax - provincialData.surtax.threshold1, 
                             provincialData.surtax.threshold2 - provincialData.surtax.threshold1) * 
                     provincialData.surtax.rate1;
        }
        if (tax > provincialData.surtax.threshold2) {
            surtax += (tax - provincialData.surtax.threshold2) * provincialData.surtax.rate2;
        }
    }
    
    const totalTax = tax + surtax;
    const basicPersonalCredit = basicPersonal * (provincialData.taxBrackets[0]?.rate || 0.05);
    const netTax = Math.max(0, totalTax - basicPersonalCredit);
    
    return {
        province,
        taxableIncome,
        taxOwing: totalTax,
        surtax,
        nonRefundableCredits: basicPersonalCredit,
        netTax,
        finalTax: netTax,
        marginalRate,
        effectiveRate: income > 0 ? totalTax / income : 0,
        federalAbatement: province === 'QC' ? quebecData.federalAbatement : 0,
        federalTaxReduction: province === 'QC' ? income * 0.15 * quebecData.federalAbatement : 0
    };
}

function getProvincialData(province: string) {
    const defaultData = {
        basicPersonalAmount: 12000,
        taxBrackets: [
            { min: 0, max: 50000, rate: 0.10 }
        ]
    };
    
    switch (province) {
        case 'ON': return ontarioData;
        case 'QC': return quebecData;
        default: return defaultData;
    }
}

function calculateOntarioHealthPremium(income: number) {
    if (!ontarioData.healthPremium) {
        return { premium: 0 };
    }
    
    for (const bracket of ontarioData.healthPremium.brackets) {
        if (income >= bracket.min && (bracket.max === null || income < bracket.max)) {
            return { premium: bracket.premium };
        }
    }
    
    return { premium: 0 };
}

function calculateQuebecSolidarityCredit(income: number, status: 'single' | 'couple') {
    const creditData = quebecData.refundableCredits?.solidarity?.[status];
    if (!creditData) {
        return { amount: 0 };
    }
    
    let credit = creditData.maxCredit;
    if (income > creditData.incomeThreshold) {
        const reduction = (income - creditData.incomeThreshold) * creditData.clawbackRate;
        credit = Math.max(0, credit - reduction);
    }
    
    return { amount: credit };
}

function calculateProvincialAgeCredit(income: number, province: string) {
    const provincialData = getProvincialData(province);
    const ageCredit = provincialData.credits?.age;
    
    if (!ageCredit) {
        return { amount: 0 };
    }
    
    let credit = ageCredit.maxAmount * ageCredit.creditRate;
    
    if (income > ageCredit.incomeThreshold) {
        const reduction = (income - ageCredit.incomeThreshold) * (ageCredit.clawbackRate || 0.15);
        credit = Math.max(0, credit - reduction);
    }
    
    return { amount: credit };
}

function calculateQuebecHealthServicesFund(income: number) {
    const hsfData = quebecData.contributions?.healthServices;
    if (!hsfData || income <= hsfData.threshold) {
        return { contribution: 0 };
    }
    
    const contribution = Math.max(0, (income - hsfData.exemption) * hsfData.rate);
    return { contribution };
}

function calculateCompleteTax(taxpayer: any, province: string) {
    // Simplified complete tax calculation
    const federal = {
        finalTax: taxpayer.income * 0.15 * (province === 'QC' ? 0.835 : 1)
    };
    
    const provincial = calculateProvincialTax(taxpayer.income, province);
    
    return {
        federal,
        provincial,
        combined: {
            marginalRate: 0.15 + provincial.marginalRate
        }
    };
}

function processPersonaTaxReturn(persona: any) {
    // Simplified persona processing
    const totalIncome = calculatePersonaIncome(persona.income);
    const province = persona.taxpayer.personalInfo.province;
    
    return {
        totalIncome,
        federal: { finalTax: totalIncome * 0.12 * (province === 'QC' ? 0.835 : 1) },
        provincial: calculateProvincialTax(totalIncome, province)
    };
}

function calculatePersonaIncome(income: any) {
    let total = 0;
    
    if (income.employment) {
        total += income.employment.reduce((sum: number, emp: any) => sum + emp.grossIncome, 0);
    }
    
    if (income.pension) {
        total += Object.values(income.pension).reduce((sum: number, amount: any) => sum + (amount || 0), 0);
    }
    
    if (income.investment) {
        total += Object.values(income.investment).reduce((sum: number, amount: any) => sum + (amount || 0), 0);
    }
    
    return total;
}

function calculateSeniorTaxBenefits(taxpayer: any) {
    const province = taxpayer.personalInfo.province;
    const income = calculatePersonaIncome(taxpayer.income);
    
    return {
        ageCredit: calculateProvincialAgeCredit(income, province).amount,
        pensionIncomeCredit: 300, // Simplified
        seniorHomeownersCredit: province === 'ON' ? 200 : 0
    };
}