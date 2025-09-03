import { describe, test, expect } from '@jest/globals';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Import schemas
import taxpayerSchema from '../../../data/schemas/taxpayer-schema.json';
import incomeSchema from '../../../data/schemas/income-schema.json';
import deductionsSchema from '../../../data/schemas/deductions-schema.json';
import creditsSchema from '../../../data/schemas/credits-schema.json';
import taxResultSchema from '../../../data/schemas/tax-result-schema.json';

// Import test data
import youngProfessionalData from '../../../data/personas/young-professional.json';
import midCareerFamilyData from '../../../data/personas/mid-career-family.json';

describe('Input Validation Tests', () => {
    let ajv: Ajv;
    
    beforeEach(() => {
        ajv = new Ajv({ allErrors: true });
        addFormats(ajv);
    });

    describe('Taxpayer Information Validation', () => {
        test('should validate correct taxpayer data', () => {
            const validate = ajv.compile(taxpayerSchema);
            const testData = youngProfessionalData.taxpayer;
            
            const isValid = validate(testData);
            
            if (!isValid) {
                console.log('Validation errors:', validate.errors);
            }
            
            expect(isValid).toBe(true);
        });

        test('should reject invalid SIN format', () => {
            const validate = ajv.compile(taxpayerSchema);
            const invalidData = {
                ...youngProfessionalData.taxpayer,
                personalInfo: {
                    ...youngProfessionalData.taxpayer.personalInfo,
                    sin: '12345' // Invalid - too short
                }
            };
            
            const isValid = validate(invalidData);
            expect(isValid).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors?.[0].schemaPath).toContain('pattern');
        });

        test('should reject invalid province codes', () => {
            const validate = ajv.compile(taxpayerSchema);
            const invalidData = {
                ...youngProfessionalData.taxpayer,
                personalInfo: {
                    ...youngProfessionalData.taxpayer.personalInfo,
                    province: 'XX' // Invalid province
                }
            };
            
            const isValid = validate(invalidData);
            expect(isValid).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors?.[0].schemaPath).toContain('enum');
        });

        test('should reject invalid postal code format', () => {
            const validate = ajv.compile(taxpayerSchema);
            const invalidData = {
                ...youngProfessionalData.taxpayer,
                personalInfo: {
                    ...youngProfessionalData.taxpayer.personalInfo,
                    postalCode: 'M5V3A8' // Missing space
                }
            };
            
            const isValid = validate(invalidData);
            expect(isValid).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors?.[0].schemaPath).toContain('pattern');
        });

        test('should reject invalid tax year', () => {
            const validate = ajv.compile(taxpayerSchema);
            
            // Test year too old
            const oldYearData = {
                ...youngProfessionalData.taxpayer,
                taxYear: 2019
            };
            
            expect(validate(oldYearData)).toBe(false);
            
            // Test year too far in future
            const futureYearData = {
                ...youngProfessionalData.taxpayer,
                taxYear: 2030
            };
            
            expect(validate(futureYearData)).toBe(false);
        });

        test('should require all mandatory fields', () => {
            const validate = ajv.compile(taxpayerSchema);
            const incompleteData = {
                personalInfo: {
                    sin: '123456789',
                    firstName: 'John'
                    // Missing required fields
                },
                taxYear: 2024
            };
            
            const isValid = validate(incompleteData);
            expect(isValid).toBe(false);
            expect(validate.errors?.length).toBeGreaterThan(1);
        });
    });

    describe('Income Validation', () => {
        test('should validate correct income data', () => {
            const validate = ajv.compile(incomeSchema);
            const testData = youngProfessionalData.income;
            
            const isValid = validate(testData);
            
            if (!isValid) {
                console.log('Income validation errors:', validate.errors);
            }
            
            expect(isValid).toBe(true);
        });

        test('should validate family income data', () => {
            const validate = ajv.compile(incomeSchema);
            const testData = midCareerFamilyData.income;
            
            const isValid = validate(testData);
            
            if (!isValid) {
                console.log('Family income validation errors:', validate.errors);
            }
            
            expect(isValid).toBe(true);
        });

        test('should reject negative income values', () => {
            const validate = ajv.compile(incomeSchema);
            const invalidData = {
                employment: [{
                    grossIncome: -1000 // Negative income
                }]
            };
            
            const isValid = validate(invalidData);
            expect(isValid).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors?.[0].schemaPath).toContain('minimum');
        });

        test('should reject unreasonably high values', () => {
            const validate = ajv.compile(incomeSchema);
            const invalidData = {
                employment: [{
                    grossIncome: 50000000 // Unreasonably high
                }]
            };
            
            const isValid = validate(invalidData);
            expect(isValid).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors?.[0].schemaPath).toContain('maximum');
        });

        test('should validate pension income within reasonable ranges', () => {
            const validate = ajv.compile(incomeSchema);
            
            // Valid pension data
            const validData = {
                pension: {
                    cpp: 15000,
                    oas: 7500,
                    employerPension: 25000
                }
            };
            expect(validate(validData)).toBe(true);
            
            // Invalid - CPP too high
            const invalidData = {
                pension: {
                    cpp: 25000 // Above maximum CPP
                }
            };
            expect(validate(invalidData)).toBe(false);
        });

        test('should validate investment income structure', () => {
            const validate = ajv.compile(incomeSchema);
            
            const validData = {
                investment: {
                    interestIncome: 1000,
                    dividendIncome: 2000,
                    eligibleDividends: 1500,
                    capitalGains: 5000,
                    capitalLosses: 1000
                }
            };
            
            expect(validate(validData)).toBe(true);
        });
    });

    describe('Deductions Validation', () => {
        test('should validate correct deductions data', () => {
            const validate = ajv.compile(deductionsSchema);
            const testData = youngProfessionalData.deductions;
            
            const isValid = validate(testData);
            
            if (!isValid) {
                console.log('Deductions validation errors:', validate.errors);
            }
            
            expect(isValid).toBe(true);
        });

        test('should validate family deductions data', () => {
            const validate = ajv.compile(deductionsSchema);
            const testData = midCareerFamilyData.deductions;
            
            const isValid = validate(testData);
            
            if (!isValid) {
                console.log('Family deductions validation errors:', validate.errors);
            }
            
            expect(isValid).toBe(true);
        });

        test('should reject excessive RRSP contributions', () => {
            const validate = ajv.compile(deductionsSchema);
            const invalidData = {
                rrsp: {
                    contributions: 150000 // Above maximum
                }
            };
            
            const isValid = validate(invalidData);
            expect(isValid).toBe(false);
            expect(validate.errors).toHaveLength(1);
            expect(validate.errors?.[0].schemaPath).toContain('maximum');
        });

        test('should validate childcare expense structure', () => {
            const validate = ajv.compile(deductionsSchema);
            
            const validData = {
                childcare: {
                    expenses: 8000,
                    children: [
                        { age: 5, disability: false },
                        { age: 10, disability: true }
                    ]
                }
            };
            
            expect(validate(validData)).toBe(true);
            
            // Invalid child age
            const invalidData = {
                childcare: {
                    expenses: 8000,
                    children: [
                        { age: 25 } // Too old for childcare
                    ]
                }
            };
            
            expect(validate(invalidData)).toBe(false);
        });

        test('should reject negative deduction amounts', () => {
            const validate = ajv.compile(deductionsSchema);
            const invalidData = {
                medical: {
                    totalExpenses: -500
                }
            };
            
            expect(validate(invalidData)).toBe(false);
        });
    });

    describe('Tax Result Validation', () => {
        test('should validate tax calculation result structure', () => {
            const validate = ajv.compile(taxResultSchema);
            
            const mockResult = {
                federal: {
                    taxableIncome: 52950,
                    taxOwing: 7942.50,
                    nonRefundableCredits: 2208,
                    netTax: 5734.50,
                    refundableCredits: 0,
                    finalTax: 5734.50
                },
                provincial: {
                    province: 'ON',
                    taxableIncome: 52950,
                    taxOwing: 3392.25,
                    nonRefundableCredits: 1154,
                    netTax: 2238.25,
                    refundableCredits: 0,
                    finalTax: 2238.25
                },
                combined: {
                    totalTaxOwing: 11334.75,
                    totalCredits: 3362,
                    netTaxOwing: 7972.75,
                    marginalRate: 0.2965,
                    averageRate: 0.1505
                },
                cpp: {
                    contributionRequired: 3754.45,
                    contributionPaid: 3754.45,
                    additionalContribution: 0,
                    maxContribution: 3754.45
                },
                ei: {
                    contributionRequired: 1049.12,
                    contributionPaid: 1049.12,
                    additionalContribution: 0,
                    maxContribution: 1357.50
                },
                summary: {
                    totalIncome: 58150,
                    totalDeductions: 5200,
                    taxableIncome: 52950,
                    totalTaxCredits: 8700,
                    balanceOwing: -727.37,
                    effectiveRate: 0.1375
                },
                metadata: {
                    calculationDate: '2024-01-15T10:30:00Z',
                    taxYear: 2024,
                    version: '1.0.0'
                }
            };
            
            const isValid = validate(mockResult);
            
            if (!isValid) {
                console.log('Tax result validation errors:', validate.errors);
            }
            
            expect(isValid).toBe(true);
        });

        test('should reject results with invalid rates', () => {
            const validate = ajv.compile(taxResultSchema);
            
            const invalidResult = {
                federal: {
                    taxableIncome: 50000,
                    taxOwing: 7500,
                    nonRefundableCredits: 2000,
                    netTax: 5500,
                    refundableCredits: 0,
                    finalTax: 5500
                },
                provincial: {
                    province: 'ON',
                    taxableIncome: 50000,
                    taxOwing: 2500,
                    nonRefundableCredits: 1000,
                    netTax: 1500,
                    refundableCredits: 0,
                    finalTax: 1500
                },
                combined: {
                    totalTaxOwing: 10000,
                    totalCredits: 3000,
                    netTaxOwing: 7000,
                    marginalRate: 1.5, // Invalid - over 100%
                    averageRate: 0.14
                },
                cpp: {
                    contributionRequired: 3500,
                    contributionPaid: 3500,
                    additionalContribution: 0,
                    maxContribution: 3754.45
                },
                ei: {
                    contributionRequired: 900,
                    contributionPaid: 900,
                    additionalContribution: 0,
                    maxContribution: 1357.50
                },
                summary: {
                    totalIncome: 50000,
                    totalDeductions: 0,
                    taxableIncome: 50000,
                    totalTaxCredits: 7500,
                    balanceOwing: -500,
                    effectiveRate: 0.13
                },
                metadata: {
                    calculationDate: '2024-01-15T10:30:00Z',
                    taxYear: 2024,
                    version: '1.0.0'
                }
            };
            
            const isValid = validate(invalidResult);
            expect(isValid).toBe(false);
            expect(validate.errors?.some(error => 
                error.schemaPath.includes('marginalRate') && 
                error.schemaPath.includes('maximum')
            )).toBe(true);
        });

        test('should require all mandatory result fields', () => {
            const validate = ajv.compile(taxResultSchema);
            
            const incompleteResult = {
                federal: {
                    taxableIncome: 50000,
                    taxOwing: 7500
                    // Missing required fields
                },
                provincial: {
                    province: 'ON',
                    taxableIncome: 50000
                    // Missing required fields
                }
                // Missing combined, cpp, ei, summary, metadata
            };
            
            const isValid = validate(incompleteResult);
            expect(isValid).toBe(false);
            expect(validate.errors?.length).toBeGreaterThan(5);
        });
    });

    describe('Cross-Field Validation', () => {
        test('should validate RRSP contribution against available room', () => {
            // This would typically be done in business logic, not schema validation
            const taxpayerData = youngProfessionalData;
            const rrspContribution = taxpayerData.deductions.rrsp?.contributions || 0;
            const availableRoom = taxpayerData.deductions.rrsp?.availableRoom || 0;
            const carriedForward = taxpayerData.deductions.rrsp?.carriedForwardRoom || 0;
            
            const totalAvailableRoom = availableRoom + carriedForward;
            
            expect(rrspContribution).toBeLessThanOrEqual(totalAvailableRoom);
        });

        test('should validate childcare expenses against income and limits', () => {
            const familyData = midCareerFamilyData;
            const childcareExpenses = familyData.deductions.childcare?.expenses || 0;
            const children = familyData.deductions.childcare?.children || [];
            
            // Basic validation - actual limits would be more complex
            expect(childcareExpenses).toBeGreaterThanOrEqual(0);
            expect(children.length).toBeGreaterThan(0);
            
            // Per-child limits (simplified)
            const maxPerChild = children.map(child => child.age < 7 ? 8000 : 5000);
            const totalMaxChildcare = maxPerChild.reduce((sum, max) => sum + max, 0);
            
            expect(childcareExpenses).toBeLessThanOrEqual(totalMaxChildcare);
        });

        test('should validate tax year consistency', () => {
            const taxpayerData = youngProfessionalData;
            const taxYear = taxpayerData.taxYear;
            
            // All data should be for the same tax year
            expect(taxYear).toBe(2024);
            
            // Birth date should be reasonable for tax year
            const birthDate = new Date(taxpayerData.taxpayer.personalInfo.dateOfBirth);
            const taxYearDate = new Date(taxYear, 0, 1);
            const ageAtTaxYear = taxYearDate.getFullYear() - birthDate.getFullYear();
            
            expect(ageAtTaxYear).toBeGreaterThan(0);
            expect(ageAtTaxYear).toBeLessThan(150);
        });
    });

    describe('Performance Validation', () => {
        test('should validate schemas quickly', () => {
            const startTime = performance.now();
            
            // Compile all schemas
            const taxpayerValidate = ajv.compile(taxpayerSchema);
            const incomeValidate = ajv.compile(incomeSchema);
            const deductionsValidate = ajv.compile(deductionsSchema);
            const creditsValidate = ajv.compile(creditsSchema);
            const resultValidate = ajv.compile(taxResultSchema);
            
            // Validate test data
            taxpayerValidate(youngProfessionalData.taxpayer);
            incomeValidate(youngProfessionalData.income);
            deductionsValidate(youngProfessionalData.deductions);
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            expect(executionTime).toBeLessThan(50); // Should complete quickly
        });

        test('should handle multiple validations efficiently', () => {
            const validate = ajv.compile(taxpayerSchema);
            const iterations = 100;
            
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                validate(youngProfessionalData.taxpayer);
            }
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            
            expect(totalTime).toBeLessThan(500); // 100 validations in under 500ms
        });
    });
});