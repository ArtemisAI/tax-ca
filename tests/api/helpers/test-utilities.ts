/**
 * Testing Utilities and Helper Functions
 * Common utilities for tax calculation testing
 */

import { UserPersona } from '../fixtures/user-personas';
import { getFederalTaxAmount, getProvincialTaxAmount } from '../../../src/taxes/income-tax';

export interface TaxCalculationResult {
    federalTax: number;
    provincialTax: number;
    totalTax: number;
    effectiveRate: number;
    marginalRate: number;
    afterTaxIncome: number;
    totalIncome: number;
}

export interface PerformanceMetrics {
    executionTime: number;
    memoryUsage: {
        before: number;
        after: number;
        increase: number;
    };
    calculationsPerSecond: number;
}

/**
 * Calculate comprehensive tax information for a persona
 */
export function calculateTaxForPersona(persona: UserPersona): TaxCalculationResult {
    const totalIncome = Object.values(persona.income).reduce((sum, amount) => sum + amount, 0);
    
    const federalTax = getFederalTaxAmount(
        persona.province as any,
        totalIncome,
        0,
        0,
        0,
    );
    
    const provincialTax = getProvincialTaxAmount(
        persona.province as any,
        totalIncome,
        0,
        0,
        0,
    );
    
    const totalTax = federalTax + provincialTax;
    const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;
    const afterTaxIncome = totalIncome - totalTax;
    
    // Calculate marginal rate by testing small income increase
    const marginTestIncome = totalIncome + 1000;
    const marginFederalTax = getFederalTaxAmount(
        persona.province as any,
        marginTestIncome,
        0,
        0,
        0,
    );
    const marginProvincialTax = getProvincialTaxAmount(
        persona.province as any,
        marginTestIncome,
        0,
        0,
        0,
    );
    const marginTotalTax = marginFederalTax + marginProvincialTax;
    const marginalRate = ((marginTotalTax - totalTax) / 1000) * 100;
    
    return {
        federalTax,
        provincialTax,
        totalTax,
        effectiveRate,
        marginalRate,
        afterTaxIncome,
        totalIncome,
    };
}

/**
 * Measure performance of tax calculations
 */
export function measurePerformance(fn: () => void, iterations: number = 1000): PerformanceMetrics {
    // Force garbage collection if available
    if (global.gc) {
        global.gc();
    }
    
    const memoryBefore = process.memoryUsage().heapUsed;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    
    const endTime = performance.now();
    const memoryAfter = process.memoryUsage().heapUsed;
    
    const executionTime = endTime - startTime;
    const calculationsPerSecond = (iterations / executionTime) * 1000;
    
    return {
        executionTime,
        memoryUsage: {
            before: memoryBefore,
            after: memoryAfter,
            increase: memoryAfter - memoryBefore,
        },
        calculationsPerSecond,
    };
}

/**
 * Validate tax calculation results for reasonableness
 */
export function validateTaxResult(result: TaxCalculationResult): boolean {
    // Basic validation checks
    if (result.federalTax < 0 || result.provincialTax < 0) {
        return false;
    }
    
    if (result.totalTax !== result.federalTax + result.provincialTax) {
        return false;
    }
    
    if (result.afterTaxIncome !== result.totalIncome - result.totalTax) {
        return false;
    }
    
    // Effective rate should be reasonable
    if (result.effectiveRate < 0 || result.effectiveRate > 60) {
        return false;
    }
    
    // Marginal rate should be reasonable
    if (result.marginalRate < 0 || result.marginalRate > 55) {
        return false;
    }
    
    // High earners should pay more tax
    if (result.totalIncome > 100000 && result.effectiveRate < 15) {
        return false;
    }
    
    // Low earners should pay less tax
    if (result.totalIncome < 30000 && result.effectiveRate > 25) {
        return false;
    }
    
    return true;
}

/**
 * Compare tax results between provinces
 */
export function compareProvinces(persona: UserPersona, provinces: string[]): Record<string, TaxCalculationResult> {
    const results: Record<string, TaxCalculationResult> = {};
    
    provinces.forEach(province => {
        const modifiedPersona = { ...persona, province };
        results[province] = calculateTaxForPersona(modifiedPersona);
    });
    
    return results;
}

/**
 * Generate test expectations for known scenarios
 */
export function generateExpectations(persona: UserPersona): Partial<TaxCalculationResult> {
    const totalIncome = Object.values(persona.income).reduce((sum, amount) => sum + amount, 0);
    
    // Generate reasonable expectations based on income level and demographics
    let expectedEffectiveRate: number;
    
    if (totalIncome < 20000) {
        expectedEffectiveRate = 5; // Very low
    } else if (totalIncome < 50000) {
        expectedEffectiveRate = 15; // Low to moderate
    } else if (totalIncome < 100000) {
        expectedEffectiveRate = 25; // Moderate
    } else if (totalIncome < 200000) {
        expectedEffectiveRate = 35; // High
    } else {
        expectedEffectiveRate = 45; // Very high
    }
    
    // Adjust for province
    if (persona.province === 'QC') {
        expectedEffectiveRate += 5; // Quebec has higher rates
    } else if (persona.province === 'AB') {
        expectedEffectiveRate -= 3; // Alberta has lower rates
    }
    
    // Adjust for age (seniors may have benefits)
    if (persona.age >= 65) {
        expectedEffectiveRate -= 3;
    }
    
    const expectedTotalTax = totalIncome * (expectedEffectiveRate / 100);
    
    return {
        effectiveRate: expectedEffectiveRate,
        totalTax: expectedTotalTax,
        afterTaxIncome: totalIncome - expectedTotalTax,
    };
}

/**
 * Assert tax calculation within tolerance
 */
export function assertTaxWithinTolerance(
    actual: TaxCalculationResult,
    expected: Partial<TaxCalculationResult>,
    tolerance: number = 0.1, // 10% tolerance
): void {
    if (expected.totalTax !== undefined) {
        const diff = Math.abs(actual.totalTax - expected.totalTax);
        const maxDiff = expected.totalTax * tolerance;
        expect(diff).toBeLessThanOrEqual(maxDiff);
    }
    
    if (expected.effectiveRate !== undefined) {
        const diff = Math.abs(actual.effectiveRate - expected.effectiveRate);
        const maxDiff = expected.effectiveRate * tolerance;
        expect(diff).toBeLessThanOrEqual(maxDiff);
    }
    
    if (expected.afterTaxIncome !== undefined) {
        const diff = Math.abs(actual.afterTaxIncome - expected.afterTaxIncome);
        const maxDiff = expected.afterTaxIncome * tolerance;
        expect(diff).toBeLessThanOrEqual(maxDiff);
    }
}

/**
 * Create test data matrix for comprehensive testing
 */
export function createTestMatrix(): Array<{ income: number; province: string; description: string }> {
    const incomes = [15000, 30000, 50000, 75000, 100000, 150000, 250000];
    const provinces = ['ON', 'QC', 'BC', 'AB'];
    const matrix: Array<{ income: number; province: string; description: string }> = [];
    
    incomes.forEach(income => {
        provinces.forEach(province => {
            matrix.push({
                income,
                province,
                description: `${income.toLocaleString()} income in ${province}`,
            });
        });
    });
    
    return matrix;
}

/**
 * Stress test helper for performance validation
 */
export function stressTest(testFunction: () => void, options: {
    iterations?: number;
    maxExecutionTime?: number;
    maxMemoryIncrease?: number;
} = {}): boolean {
    const {
        iterations = 10000,
        maxExecutionTime = 5000, // 5 seconds
        maxMemoryIncrease = 50 * 1024 * 1024, // 50MB
    } = options;
    
    const metrics = measurePerformance(testFunction, iterations);
    
    // Check execution time
    if (metrics.executionTime > maxExecutionTime) {
        return false;
    }
    
    // Check memory usage
    if (metrics.memoryUsage.increase > maxMemoryIncrease) {
        return false;
    }
    
    // Check performance degradation
    if (metrics.calculationsPerSecond < 100) { // Minimum 100 calculations per second
        return false;
    }
    
    return true;
}

/**
 * Format test results for reporting
 */
export function formatTestResults(results: TaxCalculationResult[]): string {
    let report = '\\nTax Calculation Test Results:\\n';
    report += '================================\\n';
    
    results.forEach((result, index) => {
        report += `Test ${index + 1}:\\n`;
        report += `  Total Income: $${result.totalIncome.toLocaleString()}\\n`;
        report += `  Federal Tax: $${result.federalTax.toLocaleString()}\\n`;
        report += `  Provincial Tax: $${result.provincialTax.toLocaleString()}\\n`;
        report += `  Total Tax: $${result.totalTax.toLocaleString()}\\n`;
        report += `  Effective Rate: ${result.effectiveRate.toFixed(2)}%\\n`;
        report += `  Marginal Rate: ${result.marginalRate.toFixed(2)}%\\n`;
        report += `  After-Tax Income: $${result.afterTaxIncome.toLocaleString()}\\n`;
        report += '\\n';
    });
    
    return report;
}

/**
 * Benchmark against known tax calculator results
 */
export function benchmarkAgainstKnownResults(persona: UserPersona, expectedResult: TaxCalculationResult): {
    passed: boolean;
    differences: Record<string, number>;
} {
    const actualResult = calculateTaxForPersona(persona);
    
    const differences = {
        federalTax: Math.abs(actualResult.federalTax - expectedResult.federalTax),
        provincialTax: Math.abs(actualResult.provincialTax - expectedResult.provincialTax),
        totalTax: Math.abs(actualResult.totalTax - expectedResult.totalTax),
        effectiveRate: Math.abs(actualResult.effectiveRate - expectedResult.effectiveRate),
    };
    
    // Consider test passed if differences are within 5%
    const tolerance = 0.05;
    const passed = Object.entries(differences).every(([key, diff]) => {
        const expected = expectedResult[key as keyof TaxCalculationResult] as number;
        return diff <= expected * tolerance;
    });
    
    return { passed, differences };
}