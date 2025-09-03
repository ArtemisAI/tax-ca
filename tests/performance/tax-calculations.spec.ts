import {
    getFederalTaxAmount,
    getProvincialTaxAmount,
} from '../../src/taxes/income-tax';

import { CPP } from '../../src/pension/canada-pension-plan';
import { ProvinceCode } from '../../src/misc/code-types';

describe('Performance Tests - Tax Calculations', () => {
    const inflationRate = 0.021;
    const yearsToInflate = 0;

    describe('Single calculation performance', () => {
        it('should calculate federal tax within performance threshold', () => {
            const startTime = performance.now();

            for (let i = 0; i < 100; i++) {
                getFederalTaxAmount('ON' as ProvinceCode, 75000, inflationRate, yearsToInflate, 1000);
            }

            const endTime = performance.now();
            const averageTime = (endTime - startTime) / 100;

            // Average single calculation should be under 10ms
            expect(averageTime).toBeLessThan(10);
        });

        it('should calculate provincial tax within performance threshold', () => {
            const startTime = performance.now();

            for (let i = 0; i < 100; i++) {
                getProvincialTaxAmount('ON' as ProvinceCode, 75000, inflationRate, yearsToInflate, 1000);
            }

            const endTime = performance.now();
            const averageTime = (endTime - startTime) / 100;

            // Average single calculation should be under 10ms
            expect(averageTime).toBeLessThan(10);
        });

        it('should calculate CPP contribution data efficiently', () => {
            const startTime = performance.now();

            for (let i = 0; i < 100; i++) {
                // Test accessing CPP data structures efficiently
                const ympe = CPP.PENSIONABLE_EARNINGS.YMPE;
                const basicExemption = CPP.PENSIONABLE_EARNINGS.BASIC_EXEMPTION;
                const contributionRate = CPP.CONTRIBUTION_RATES.BASE;

                const pensionableEarnings = Math.min(
                    Math.max(75000 - basicExemption, 0),
                    ympe - basicExemption,
                );
                // Use the calculation to avoid unused variable warning
                expect(pensionableEarnings * contributionRate).toBeGreaterThan(0);
            }

            const endTime = performance.now();
            const averageTime = (endTime - startTime) / 100;

            // CPP calculations should be very fast
            expect(averageTime).toBeLessThan(5);
        });
    });

    describe('Bulk calculation performance', () => {
        it('should process multiple scenarios efficiently', () => {
            const scenarios = Array.from({ length: 1000 }, (_, i) => ({
                income: 30000 + (i * 100), // Income range from 30k to 130k
                province: (['ON', 'QC', 'BC', 'AB'] as ProvinceCode[])[i % 4],
                credits: 1000 + (i * 10),
            }));

            const startTime = performance.now();

            scenarios.forEach((scenario) => {
                getFederalTaxAmount(
                    scenario.province,
                    scenario.income,
                    inflationRate,
                    yearsToInflate,
                    scenario.credits,
                );
                getProvincialTaxAmount(
                    scenario.province,
                    scenario.income,
                    inflationRate,
                    yearsToInflate,
                    scenario.credits,
                );
            });

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            // 1000 calculations should complete within 1 second
            expect(totalTime).toBeLessThan(1000);
        });

        it('should handle varied income levels efficiently', () => {
            const incomes = [
                25000, 35000, 45000, 55000, 65000, 75000, 85000, 95000,
                105000, 125000, 150000, 200000, 300000, 500000, 1000000,
            ];

            const startTime = performance.now();

            // Test each income level 10 times
            incomes.forEach((income) => {
                for (let i = 0; i < 10; i++) {
                    getFederalTaxAmount('ON' as ProvinceCode, income, inflationRate, yearsToInflate, 1000);
                    getProvincialTaxAmount('ON' as ProvinceCode, income, inflationRate, yearsToInflate, 500);
                }
            });

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            // Should handle all income levels efficiently
            expect(totalTime).toBeLessThan(500);
        });
    });

    describe('Memory usage tests', () => {
        it('should not create memory leaks during repeated calculations', () => {
            const initialMemory = process.memoryUsage().heapUsed;

            // Perform many calculations
            for (let i = 0; i < 10000; i++) {
                const income = 50000 + (i % 100000);
                getFederalTaxAmount('ON' as ProvinceCode, income, inflationRate, yearsToInflate, 1000);

                // Occasionally check memory hasn't grown excessively
                if (i % 1000 === 0) {
                    const currentMemory = process.memoryUsage().heapUsed;
                    const memoryIncrease = currentMemory - initialMemory;

                    // Memory increase should be reasonable (less than 50MB)
                    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
                }
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            // Final memory increase should be minimal
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
        });
    });
});
