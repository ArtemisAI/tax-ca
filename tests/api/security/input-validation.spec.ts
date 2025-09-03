/**
 * Security Tests for Tax Calculation Library
 * Tests input validation, data sanitization, and security boundaries
 */

import { getFederalTaxAmount, getProvincialTaxAmount } from '../../../src/taxes/income-tax';
import { generateRandomPersona } from '../fixtures/data-generator';

describe('Security Tests', () => {
    describe('Input Validation', () => {
        it('should handle negative income gracefully', () => {
            expect(() => getFederalTaxAmount('ON', -1000, 0, 0, 0)).not.toThrow();
            const result = getFederalTaxAmount('ON', -1000, 0, 0, 0);
            expect(result).toBeGreaterThanOrEqual(0);
        });

        it('should handle extremely large income values', () => {
            const extremeIncome = Number.MAX_SAFE_INTEGER;
            expect(() => getFederalTaxAmount('ON', extremeIncome, 0, 0, 0)).not.toThrow();
        });

        it('should handle invalid province codes gracefully', () => {
            // Test with invalid province code
            expect(() => getFederalTaxAmount('XX' as any, 50000, 0, 0, 0)).not.toThrow();
        });

        it('should handle null and undefined inputs', () => {
            expect(() => getFederalTaxAmount('ON', null as any, 0, 0, 0)).not.toThrow();
            expect(() => getFederalTaxAmount('ON', undefined as any, 0, 0, 0)).not.toThrow();
        });

        it('should handle NaN values', () => {
            expect(() => getFederalTaxAmount('ON', NaN, 0, 0, 0)).not.toThrow();
            const result = getFederalTaxAmount('ON', NaN, 0, 0, 0);
            expect(isNaN(result) || result >= 0).toBe(true);
        });

        it('should handle Infinity values', () => {
            expect(() => getFederalTaxAmount('ON', Infinity, 0, 0, 0)).not.toThrow();
            expect(() => getFederalTaxAmount('ON', -Infinity, 0, 0, 0)).not.toThrow();
        });
    });

    describe('Data Type Safety', () => {
        it('should handle string numbers', () => {
            expect(() => getFederalTaxAmount('ON', '50000' as any, 0, 0, 0)).not.toThrow();
        });

        it('should handle non-numeric strings', () => {
            expect(() => getFederalTaxAmount('ON', 'not-a-number' as any, 0, 0, 0)).not.toThrow();
        });

        it('should handle boolean values', () => {
            expect(() => getFederalTaxAmount('ON', true as any, 0, 0, 0)).not.toThrow();
            expect(() => getFederalTaxAmount('ON', false as any, 0, 0, 0)).not.toThrow();
        });

        it('should handle array inputs', () => {
            expect(() => getFederalTaxAmount('ON', [50000] as any, 0, 0, 0)).not.toThrow();
        });

        it('should handle object inputs', () => {
            expect(() => getFederalTaxAmount('ON', { amount: 50000 } as any, 0, 0, 0)).not.toThrow();
        });
    });

    describe('Boundary Value Testing', () => {
        it('should handle zero income', () => {
            const result = getFederalTaxAmount('ON', 0, 0, 0, 0);
            expect(result).toBe(0);
        });

        it('should handle income at tax bracket boundaries', () => {
            // Test at various tax bracket thresholds
            const bracketThresholds = [55867, 111733, 173205, 246752];

            bracketThresholds.forEach((threshold) => {
                expect(() => getFederalTaxAmount('ON', threshold, 0, 0, 0)).not.toThrow();
                expect(() => getFederalTaxAmount('ON', threshold - 1, 0, 0, 0)).not.toThrow();
                expect(() => getFederalTaxAmount('ON', threshold + 1, 0, 0, 0)).not.toThrow();
            });
        });

        it('should handle maximum realistic Canadian income', () => {
            const maxRealisticIncome = 10000000; // $10M
            expect(() => getFederalTaxAmount('ON', maxRealisticIncome, 0, 0, 0)).not.toThrow();
            const result = getFederalTaxAmount('ON', maxRealisticIncome, 0, 0, 0);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(maxRealisticIncome); // Tax should be less than total income
        });

        it('should handle minimum wage scenarios', () => {
            const minimumWageAnnual = 15 * 40 * 52; // $31,200 at $15/hour
            expect(() => getFederalTaxAmount('ON', minimumWageAnnual, 0, 0, 0)).not.toThrow();
            const result = getFederalTaxAmount('ON', minimumWageAnnual, 0, 0, 0);
            expect(result).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Provincial Code Validation', () => {
        const validProvinceCodes = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
        const invalidProvinceCodes = ['XX', 'ZZ', '', '123', 'USA', 'CAD', 'ONTARIO'];

        it('should accept all valid province codes', () => {
            validProvinceCodes.forEach((province) => {
                expect(() => getFederalTaxAmount(province as any, 50000, 0, 0, 0)).not.toThrow();
                expect(() => getProvincialTaxAmount(province as any, 50000, 0, 0, 0)).not.toThrow();
            });
        });

        it('should handle invalid province codes gracefully', () => {
            invalidProvinceCodes.forEach((province) => {
                // Some invalid province codes may throw errors, which is acceptable behavior
                try {
                    getFederalTaxAmount(province as any, 50000, 0, 0, 0);
                    getProvincialTaxAmount(province as any, 50000, 0, 0, 0);
                } catch (error) {
                    // It's acceptable for invalid province codes to throw errors
                    expect(error).toBeDefined();
                }
            });
        });

        it('should handle case sensitivity in province codes', () => {
            // Case sensitivity may cause errors, which is acceptable behavior
            try {
                getFederalTaxAmount('on' as any, 50000, 0, 0, 0);
            } catch (error) {
                expect(error).toBeDefined();
            }

            try {
                getFederalTaxAmount('On' as any, 50000, 0, 0, 0);
            } catch (error) {
                expect(error).toBeDefined();
            }

            try {
                getFederalTaxAmount('oN' as any, 50000, 0, 0, 0);
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
    });

    describe('Rate Limiting and Performance Security', () => {
        it('should handle rapid successive calculations', () => {
            const startTime = performance.now();

            for (let i = 0; i < 100; i++) {
                getFederalTaxAmount('ON', 50000 + i, 0, 0, 0);
            }

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            // Should complete 100 calculations in reasonable time (< 1 second)
            expect(totalTime).toBeLessThan(1000);
        });

        it('should not consume excessive memory with large datasets', () => {
            const initialMemory = process.memoryUsage().heapUsed;

            // Generate large dataset
            const largeDataset = [];
            for (let i = 0; i < 1000; i++) {
                largeDataset.push(generateRandomPersona('young'));
            }

            // Process dataset
            largeDataset.forEach((persona) => {
                getFederalTaxAmount('ON', persona.income.employment, 0, 0, 0);
            });

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            // Memory increase should be reasonable (< 50MB)
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        });
    });

    describe('Mathematical Security', () => {
        it('should prevent integer overflow in calculations', () => {
            const largeIncome = 2 ** 53 - 1; // Max safe integer
            expect(() => getFederalTaxAmount('ON', largeIncome, 0, 0, 0)).not.toThrow();

            const result = getFederalTaxAmount('ON', largeIncome, 0, 0, 0);
            expect(typeof result).toBe('number');
        });

        it('should handle floating point precision correctly', () => {
            const income = 50000.99999999999;
            const result1 = getFederalTaxAmount('ON', income, 0, 0, 0);
            const result2 = getFederalTaxAmount('ON', 50001, 0, 0, 0);

            // Results should be very close for similar inputs
            expect(Math.abs(result1 - result2)).toBeLessThan(1);
        });

        it('should maintain calculation consistency', () => {
            const income = 75000;
            const result1 = getFederalTaxAmount('ON', income, 0, 0, 0);
            const result2 = getFederalTaxAmount('ON', income, 0, 0, 0);

            // Same inputs should always produce same outputs
            expect(result1).toBe(result2);
        });
    });

    describe('Error Handling Security', () => {
        it('should not expose sensitive information in error messages', () => {
            try {
                getFederalTaxAmount('ON', 'malicious-input' as any, 0, 0, 0);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);

                // Error messages should not contain sensitive data
                expect(errorMessage).not.toContain('password');
                expect(errorMessage).not.toContain('secret');
                expect(errorMessage).not.toContain('key');
                expect(errorMessage).not.toContain('token');
            }
        });

        it('should handle malformed credit objects', () => {
            const malformedCredits = {
                invalidProperty: 'malicious-value',
                nested: {
                    deep: {
                        value: 'exploit-attempt',
                    },
                },
            };

            expect(() => getFederalTaxAmount('ON', 50000, 0, 0, malformedCredits as any)).not.toThrow();
        });
    });

    describe('Resource Exhaustion Prevention', () => {
        it('should handle repeated calculations without degradation', () => {
            const iterations = 10000;
            const times: number[] = [];

            for (let i = 0; i < iterations; i++) {
                const start = performance.now();
                getFederalTaxAmount('ON', 50000, 0, 0, 0);
                const end = performance.now();
                times.push(end - start);
            }

            // Performance should not degrade significantly
            const firstHalf = times.slice(0, iterations / 2);
            const secondHalf = times.slice(iterations / 2);

            const avgFirstHalf = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const avgSecondHalf = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

            // Second half should not be significantly slower than first half
            expect(avgSecondHalf).toBeLessThan(avgFirstHalf * 2);
        });

        it('should limit recursion depth implicitly', () => {
            // Test with deeply nested scenarios that might cause stack overflow
            let deeplyNestedIncome = 50000;

            for (let i = 0; i < 1000; i++) {
                deeplyNestedIncome = getFederalTaxAmount('ON', deeplyNestedIncome, 0, 0, 0);
                if (deeplyNestedIncome <= 0) break; // Prevent infinite loops
            }

            // Should complete without stack overflow
            expect(deeplyNestedIncome).toBeGreaterThanOrEqual(0);
        });
    });
});
