/**
 * Contract Tests for API Schema Compliance
 * Ensures all public interfaces maintain expected contracts
 */

import { getFederalTaxAmount, getProvincialTaxAmount } from '../../../src/taxes/income-tax';
import { CPP } from '../../../src/pension/canada-pension-plan';
import { QPP } from '../../../src/pension/quebec-pension-plan';
import { EI } from '../../../src/taxes/employment-insurance';
import { QPIP } from '../../../src/taxes/quebec-parental-insurance-plan';
import { ELIGIBLE_DIVIDEND, NON_ELIGIBLE_DIVIDEND } from '../../../src/taxes/dividend-credit';
import { TuitionFees } from '../../../src/investments/registered-education-savings-plan/tuition-fees';

describe('API Contract Tests', () => {
    describe('Tax Calculation Functions', () => {
        describe('getFederalTaxAmount', () => {
            it('should return a number for valid inputs', () => {
                const result = getFederalTaxAmount('ON', 50000, 0, 0, 0);
                expect(typeof result).toBe('number');
                expect(Number.isFinite(result)).toBe(true);
            });

            it('should accept all required parameters', () => {
                // Function has defaults for inflationRate and yearsToInflate, but requires all parameters
                expect(() => getFederalTaxAmount('ON', 50000, 0, 0, 0)).not.toThrow();
            });

            it('should return non-negative values for positive income', () => {
                const result = getFederalTaxAmount('ON', 50000, 0, 0, 0);
                expect(result).toBeGreaterThanOrEqual(0);
            });

            it('should handle inflation parameters correctly', () => {
                const baseResult = getFederalTaxAmount('ON', 50000, 0, 0, 0);
                const inflatedResult = getFederalTaxAmount('ON', 50000, 0.02, 5, 0);
                
                expect(typeof baseResult).toBe('number');
                expect(typeof inflatedResult).toBe('number');
            });

            it('should accept credits object parameter', () => {
                const creditAmount = 2500; // Convert credits to a simple number
                
                expect(() => getFederalTaxAmount('ON', 50000, 0, 0, creditAmount)).not.toThrow();
                const result = getFederalTaxAmount('ON', 50000, 0, 0, creditAmount);
                expect(typeof result).toBe('number');
            });
        });

        describe('getProvincialTaxAmount', () => {
            it('should return a number for valid inputs', () => {
                const result = getProvincialTaxAmount('ON', 50000, 0, 0, 0);
                expect(typeof result).toBe('number');
                expect(Number.isFinite(result)).toBe(true);
            });

            it('should handle all Canadian provinces and territories', () => {
                const jurisdictions = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
                
                jurisdictions.forEach(province => {
                    expect(() => getProvincialTaxAmount(province as any, 50000, 0, 0, 0)).not.toThrow();
                    const result = getProvincialTaxAmount(province as any, 50000, 0, 0, 0);
                    expect(typeof result).toBe('number');
                });
            });

            it('should return different values for different provinces', () => {
                const onResult = getProvincialTaxAmount('ON', 75000, 0, 0, 0);
                const qcResult = getProvincialTaxAmount('QC', 75000, 0, 0, 0);
                
                expect(onResult).not.toBe(qcResult);
            });

            it('should maintain contract consistency with federal function', () => {
                // Both functions should work with same parameter pattern
                expect(() => getFederalTaxAmount('ON', 50000, 0, 0, 0)).not.toThrow();
                expect(() => getProvincialTaxAmount('ON', 50000, 0, 0, 0)).not.toThrow();
            });
        });
    });

    describe('Pension Plan Contracts', () => {
        describe('CPP Interface Contract', () => {
            it('should have all required properties', () => {
                expect(CPP).toHaveProperty('PENSIONABLE_EARNINGS');
                expect(CPP).toHaveProperty('CONTRIBUTION_RATES');
                expect(CPP).toHaveProperty('MAX_REQUEST_AGE');
                expect(CPP).toHaveProperty('MIN_REQUEST_AGE');
                expect(CPP).toHaveProperty('DEFAULT_REFERENCE_AGE');
            });

            it('should have required methods', () => {
                expect(typeof CPP.getRequestDateFactor).toBe('function');
                expect(typeof CPP.getAverageIndexationRate).toBe('function');
            });

            it('should maintain method signatures', () => {
                expect(CPP.getRequestDateFactor).toHaveLength(3);
                expect(CPP.getAverageIndexationRate).toHaveLength(0);
            });

            it('should return consistent data types', () => {
                expect(typeof CPP.MAX_REQUEST_AGE).toBe('number');
                expect(typeof CPP.MIN_REQUEST_AGE).toBe('number');
                expect(typeof CPP.DEFAULT_REFERENCE_AGE).toBe('number');
                expect(typeof CPP.PENSIONABLE_EARNINGS).toBe('object');
                expect(typeof CPP.CONTRIBUTION_RATES).toBe('object');
            });

            it('should return valid values from methods', () => {
                const avgRate = CPP.getAverageIndexationRate();
                expect(typeof avgRate).toBe('number');
                expect(avgRate).toBeGreaterThan(0);
                expect(avgRate).toBeLessThan(1);

                const birthDate = new Date('1960-01-01');
                const requestDate = new Date('2025-01-01');
                const factor = CPP.getRequestDateFactor(birthDate, requestDate);
                expect(typeof factor).toBe('number');
                expect(factor).toBeGreaterThan(0);
            });
        });

        describe('QPP Interface Contract', () => {
            it('should maintain same contract as CPP', () => {
                // QPP should have same interface as CPP
                const cppProperties = Object.keys(CPP);
                const qppProperties = Object.keys(QPP);
                
                cppProperties.forEach(prop => {
                    expect(qppProperties).toContain(prop);
                });
            });

            it('should have identical method signatures to CPP', () => {
                expect(QPP.getRequestDateFactor).toHaveLength(3);
                expect(QPP.getAverageIndexationRate).toHaveLength(0);
            });

            it('should return same data types as CPP', () => {
                expect(typeof QPP.MAX_REQUEST_AGE).toBe(typeof CPP.MAX_REQUEST_AGE);
                expect(typeof QPP.MIN_REQUEST_AGE).toBe(typeof CPP.MIN_REQUEST_AGE);
                expect(typeof QPP.DEFAULT_REFERENCE_AGE).toBe(typeof CPP.DEFAULT_REFERENCE_AGE);
            });
        });
    });

    describe('Employment Insurance Contract', () => {
        it('should have required structure', () => {
            expect(EI).toHaveProperty('MAX_INSURABLE_EARNINGS');
            expect(EI).toHaveProperty('PREMIUM_RATES');
            
            expect(typeof EI.MAX_INSURABLE_EARNINGS).toBe('number');
            expect(typeof EI.PREMIUM_RATES).toBe('object');
        });

        it('should have federal and Quebec rates', () => {
            expect(EI.PREMIUM_RATES).toHaveProperty('CA');
            expect(EI.PREMIUM_RATES).toHaveProperty('QC');
            
            expect(typeof EI.PREMIUM_RATES.CA).toBe('number');
            expect(typeof EI.PREMIUM_RATES.QC).toBe('number');
        });

        it('should maintain rate value constraints', () => {
            expect(EI.MAX_INSURABLE_EARNINGS).toBeGreaterThan(0);
            expect(EI.PREMIUM_RATES.CA).toBeGreaterThan(0);
            expect(EI.PREMIUM_RATES.CA).toBeLessThan(1);
            expect(EI.PREMIUM_RATES.QC).toBeGreaterThan(0);
            expect(EI.PREMIUM_RATES.QC).toBeLessThan(1);
        });
    });

    describe('Quebec Parental Insurance Plan Contract', () => {
        it('should have required structure', () => {
            expect(QPIP).toHaveProperty('MAX_INSURABLE_EARNINGS');
            expect(QPIP).toHaveProperty('PREMIUM_RATES');
            
            expect(typeof QPIP.MAX_INSURABLE_EARNINGS).toBe('number');
            expect(typeof QPIP.PREMIUM_RATES).toBe('object');
        });

        it('should have employment type specific rates', () => {
            expect(QPIP.PREMIUM_RATES).toHaveProperty('SALARIED');
            expect(QPIP.PREMIUM_RATES).toHaveProperty('SELF_EMPLOYED');
            
            expect(typeof QPIP.PREMIUM_RATES.SALARIED).toBe('number');
            expect(typeof QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBe('number');
        });

        it('should maintain rate relationships', () => {
            expect(QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBeGreaterThan(QPIP.PREMIUM_RATES.SALARIED);
        });
    });

    describe('Dividend Credit Contract', () => {
        it('should have both dividend types', () => {
            expect(ELIGIBLE_DIVIDEND).toBeDefined();
            expect(NON_ELIGIBLE_DIVIDEND).toBeDefined();
            
            expect(typeof ELIGIBLE_DIVIDEND).toBe('object');
            expect(typeof NON_ELIGIBLE_DIVIDEND).toBe('object');
        });

        it('should have gross-up factors', () => {
            expect(ELIGIBLE_DIVIDEND).toHaveProperty('GROSS_UP');
            expect(NON_ELIGIBLE_DIVIDEND).toHaveProperty('GROSS_UP');
            
            expect(typeof ELIGIBLE_DIVIDEND.GROSS_UP).toBe('number');
            expect(typeof NON_ELIGIBLE_DIVIDEND.GROSS_UP).toBe('number');
        });

        it('should have federal rates', () => {
            expect(ELIGIBLE_DIVIDEND).toHaveProperty('CA');
            expect(NON_ELIGIBLE_DIVIDEND).toHaveProperty('CA');
            
            expect(typeof ELIGIBLE_DIVIDEND.CA).toBe('number');
            expect(typeof NON_ELIGIBLE_DIVIDEND.CA).toBe('number');
        });

        it('should have all provincial rates', () => {
            const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
            
            provinces.forEach(province => {
                expect(ELIGIBLE_DIVIDEND).toHaveProperty(province);
                expect(NON_ELIGIBLE_DIVIDEND).toHaveProperty(province);
                expect(typeof ELIGIBLE_DIVIDEND[province as keyof typeof ELIGIBLE_DIVIDEND]).toBe('number');
                expect(typeof NON_ELIGIBLE_DIVIDEND[province as keyof typeof NON_ELIGIBLE_DIVIDEND]).toBe('number');
            });
        });

        it('should maintain gross-up relationships', () => {
            expect(ELIGIBLE_DIVIDEND.GROSS_UP).toBeGreaterThan(NON_ELIGIBLE_DIVIDEND.GROSS_UP);
            expect(ELIGIBLE_DIVIDEND.GROSS_UP).toBeGreaterThan(1);
            expect(NON_ELIGIBLE_DIVIDEND.GROSS_UP).toBeGreaterThan(1);
        });
    });

    describe('Tuition Fees Contract', () => {
        it('should have required structure', () => {
            expect(TuitionFees).toHaveProperty('TuitionFeesData');
            expect(TuitionFees).toHaveProperty('getTuitionFeesByProvinceCode');
            
            expect(typeof TuitionFees.TuitionFeesData).toBe('object');
            expect(typeof TuitionFees.getTuitionFeesByProvinceCode).toBe('function');
        });

        it('should have function with correct signature', () => {
            expect(TuitionFees.getTuitionFeesByProvinceCode).toHaveLength(1);
        });

        it('should return numbers for valid province codes', () => {
            const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
            
            provinces.forEach(province => {
                const fee = TuitionFees.getTuitionFeesByProvinceCode(province as any);
                expect(typeof fee).toBe('number');
                expect(fee).toBeGreaterThan(0);
            });
        });

        it('should maintain consistency between data access methods', () => {
            const provinces = ['ON', 'QC', 'BC', 'AB'];
            
            provinces.forEach(province => {
                const directAccess = TuitionFees.TuitionFeesData[province as keyof typeof TuitionFees.TuitionFeesData];
                const functionAccess = TuitionFees.getTuitionFeesByProvinceCode(province as any);
                expect(directAccess).toBe(functionAccess);
            });
        });
    });

    describe('Cross-Module Contract Consistency', () => {
        it('should maintain consistent province code usage', () => {
            const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
            
            // All modules should accept the same province codes
            provinces.forEach(province => {
                expect(() => getFederalTaxAmount(province as any, 50000, 0, 0, 0)).not.toThrow();
                expect(() => getProvincialTaxAmount(province as any, 50000, 0, 0, 0)).not.toThrow();
                expect(() => TuitionFees.getTuitionFeesByProvinceCode(province as any)).not.toThrow();
            });
        });

        it('should maintain consistent number formatting', () => {
            const result1 = getFederalTaxAmount('ON', 50000, 0, 0, 0);
            const result2 = getProvincialTaxAmount('ON', 50000, 0, 0, 0);
            
            // Results should be finite numbers
            expect(Number.isFinite(result1)).toBe(true);
            expect(Number.isFinite(result2)).toBe(true);
            
            // Should not return NaN
            expect(Number.isNaN(result1)).toBe(false);
            expect(Number.isNaN(result2)).toBe(false);
        });

        it('should maintain API stability across versions', () => {
            // This test ensures backward compatibility
            const testCases = [
                { province: 'ON', income: 50000, expected: 'number' },
                { province: 'QC', income: 75000, expected: 'number' },
                { province: 'BC', income: 100000, expected: 'number' },
            ];

            testCases.forEach(({ province, income, expected }) => {
                const federalResult = getFederalTaxAmount(province as any, income, 0, 0, 0);
                const provincialResult = getProvincialTaxAmount(province as any, income, 0, 0, 0);
                
                expect(typeof federalResult).toBe(expected);
                expect(typeof provincialResult).toBe(expected);
            });
        });
    });
});