import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Performance monitoring utilities
interface PerformanceMetrics {
    executionTime: number;
    memoryUsage: number;
    iterations: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    successRate: number;
}

interface MemorySnapshot {
    used: number;
    total: number;
    external: number;
}

class PerformanceMonitor {
    private startTime: number = 0;
    private startMemory: MemorySnapshot | null = null;
    private iterations: number = 0;
    private times: number[] = [];
    private errors: number = 0;

    start(): void {
        this.startTime = performance.now();
        this.startMemory = this.getMemoryUsage();
        this.iterations = 0;
        this.times = [];
        this.errors = 0;
    }

    recordIteration(executionTime: number, hasError: boolean = false): void {
        this.iterations++;
        this.times.push(executionTime);
        if (hasError) {
            this.errors++;
        }
    }

    getMetrics(): PerformanceMetrics {
        const totalTime = performance.now() - this.startTime;
        const averageTime = this.times.length > 0 ? this.times.reduce((a, b) => a + b, 0) / this.times.length : 0;
        const minTime = this.times.length > 0 ? Math.min(...this.times) : 0;
        const maxTime = this.times.length > 0 ? Math.max(...this.times) : 0;
        
        const currentMemory = this.getMemoryUsage();
        const memoryUsage = this.startMemory ? currentMemory.used - this.startMemory.used : 0;
        
        return {
            executionTime: totalTime,
            memoryUsage,
            iterations: this.iterations,
            averageTime,
            minTime,
            maxTime,
            successRate: this.iterations > 0 ? (this.iterations - this.errors) / this.iterations : 0
        };
    }

    private getMemoryUsage(): MemorySnapshot {
        const memUsage = process.memoryUsage();
        return {
            used: memUsage.heapUsed,
            total: memUsage.heapTotal,
            external: memUsage.external
        };
    }
}

// Mock tax calculation function for performance testing
function mockTaxCalculation(params: any): any {
    // Simulate calculation work with some processing time
    const start = performance.now();
    
    // Simulate varying complexity based on input
    const complexity = (params.totalIncome || 50000) / 10000;
    const iterations = Math.floor(complexity * 100);
    
    // Simulate work
    let result = 0;
    for (let i = 0; i < iterations; i++) {
        result += Math.sqrt(i * params.totalIncome);
    }
    
    // Return realistic tax calculation result
    const taxableIncome = Math.max(0, (params.totalIncome || 0) - 15000);
    const federalTax = taxableIncome * 0.15;
    const provincialTax = taxableIncome * 0.10;
    
    return {
        federal: {
            taxableIncome,
            taxOwing: federalTax,
            nonRefundableCredits: 2250,
            netTax: Math.max(0, federalTax - 2250),
            refundableCredits: 0,
            finalTax: Math.max(0, federalTax - 2250)
        },
        provincial: {
            province: params.province || 'ON',
            taxableIncome,
            taxOwing: provincialTax,
            nonRefundableCredits: 1200,
            netTax: Math.max(0, provincialTax - 1200),
            refundableCredits: 0,
            finalTax: Math.max(0, provincialTax - 1200)
        },
        combined: {
            totalTaxOwing: federalTax + provincialTax,
            totalCredits: 3450,
            netTaxOwing: Math.max(0, federalTax + provincialTax - 3450),
            marginalRate: 0.25,
            averageRate: (federalTax + provincialTax) / (params.totalIncome || 1)
        },
        processingTime: performance.now() - start
    };
}

describe('API Performance Tests', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
        monitor = new PerformanceMonitor();
    });

    afterEach(() => {
        // Force garbage collection if available (for testing environments)
        if (global.gc) {
            global.gc();
        }
    });

    describe('Single Calculation Performance', () => {
        test('should calculate simple tax case within 50ms', () => {
            const startTime = performance.now();
            
            const result = mockTaxCalculation({
                province: 'ON',
                taxYear: 2024,
                totalIncome: 50000,
                rrspContribution: 5000
            });
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            expect(executionTime).toBeLessThan(50);
            expect(result.federal.taxOwing).toBeGreaterThan(0);
            expect(result.provincial.province).toBe('ON');
        });

        test('should calculate complex tax case within 200ms', () => {
            const startTime = performance.now();
            
            const result = mockTaxCalculation({
                province: 'QC',
                taxYear: 2024,
                totalIncome: 150000,
                rrspContribution: 10000,
                childcareExpenses: 8000,
                dividendIncome: 5000,
                capitalGains: 10000,
                pensionIncome: 20000,
                numberOfChildren: 2
            });
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            expect(executionTime).toBeLessThan(200);
            expect(result.combined.totalTaxOwing).toBeGreaterThan(0);
        });

        test('should handle edge cases efficiently', () => {
            const testCases = [
                { totalIncome: 0, description: 'zero income' },
                { totalIncome: 1000000, description: 'very high income' },
                { totalIncome: 15000, description: 'basic personal amount' },
                { totalIncome: 53359, description: 'first tax bracket limit' }
            ];

            testCases.forEach(testCase => {
                const startTime = performance.now();
                
                const result = mockTaxCalculation({
                    province: 'ON',
                    taxYear: 2024,
                    totalIncome: testCase.totalIncome
                });
                
                const endTime = performance.now();
                const executionTime = endTime - startTime;
                
                expect(executionTime).toBeLessThan(100);
                expect(result).toBeDefined();
            });
        });
    });

    describe('Bulk Processing Performance', () => {
        test('should process 100 calculations within 2 seconds', () => {
            monitor.start();
            const calculations = 100;
            
            for (let i = 0; i < calculations; i++) {
                const iterationStart = performance.now();
                
                const result = mockTaxCalculation({
                    province: 'ON',
                    taxYear: 2024,
                    totalIncome: 40000 + (i * 500), // Vary income
                    rrspContribution: 2000 + (i * 50)
                });
                
                const iterationTime = performance.now() - iterationStart;
                monitor.recordIteration(iterationTime);
                
                expect(result).toBeDefined();
            }
            
            const metrics = monitor.getMetrics();
            
            expect(metrics.executionTime).toBeLessThan(2000); // Total time under 2 seconds
            expect(metrics.averageTime).toBeLessThan(20); // Average under 20ms
            expect(metrics.iterations).toBe(calculations);
            expect(metrics.successRate).toBe(1); // 100% success rate
        });

        test('should process 1000 calculations within 10 seconds', () => {
            monitor.start();
            const calculations = 1000;
            const batchSize = 100;
            
            for (let batch = 0; batch < calculations / batchSize; batch++) {
                const batchResults = [];
                
                for (let i = 0; i < batchSize; i++) {
                    const iterationStart = performance.now();
                    
                    const result = mockTaxCalculation({
                        province: ['ON', 'QC', 'BC', 'AB'][i % 4],
                        taxYear: 2024,
                        totalIncome: 30000 + (i * 200),
                        rrspContribution: 1000 + (i * 20)
                    });
                    
                    const iterationTime = performance.now() - iterationStart;
                    monitor.recordIteration(iterationTime);
                    
                    batchResults.push(result);
                }
                
                expect(batchResults).toHaveLength(batchSize);
            }
            
            const metrics = monitor.getMetrics();
            
            expect(metrics.executionTime).toBeLessThan(10000); // Total time under 10 seconds
            expect(metrics.iterations).toBe(calculations);
            expect(metrics.successRate).toBe(1);
            expect(metrics.averageTime).toBeLessThan(10); // Average under 10ms for bulk processing
        });

        test('should maintain performance with varied complexity', () => {
            monitor.start();
            const testCases = [
                { income: 25000, complexity: 'simple' },
                { income: 75000, complexity: 'medium', children: 1 },
                { income: 150000, complexity: 'complex', children: 2, investments: true },
                { income: 300000, complexity: 'very complex', children: 3, investments: true, business: true }
            ];
            
            testCases.forEach((testCase, index) => {
                for (let i = 0; i < 25; i++) { // 25 iterations per complexity level
                    const iterationStart = performance.now();
                    
                    const result = mockTaxCalculation({
                        province: 'ON',
                        taxYear: 2024,
                        totalIncome: testCase.income,
                        numberOfChildren: testCase.children || 0,
                        dividendIncome: testCase.investments ? 5000 : 0,
                        businessIncome: testCase.business ? 20000 : 0
                    });
                    
                    const iterationTime = performance.now() - iterationStart;
                    monitor.recordIteration(iterationTime);
                    
                    expect(result).toBeDefined();
                }
            });
            
            const metrics = monitor.getMetrics();
            
            expect(metrics.iterations).toBe(100);
            expect(metrics.successRate).toBe(1);
            expect(metrics.maxTime).toBeLessThan(100); // Even complex cases under 100ms
        });
    });

    describe('Concurrent Processing Performance', () => {
        test('should handle concurrent calculations efficiently', async () => {
            const concurrentRequests = 50;
            const promises: Promise<any>[] = [];
            
            monitor.start();
            
            for (let i = 0; i < concurrentRequests; i++) {
                const promise = new Promise((resolve) => {
                    const iterationStart = performance.now();
                    
                    // Simulate async operation
                    setTimeout(() => {
                        const result = mockTaxCalculation({
                            province: ['ON', 'QC', 'BC', 'AB'][i % 4],
                            taxYear: 2024,
                            totalIncome: 45000 + (i * 1000)
                        });
                        
                        const iterationTime = performance.now() - iterationStart;
                        monitor.recordIteration(iterationTime);
                        
                        resolve(result);
                    }, Math.random() * 10); // Random delay 0-10ms
                });
                
                promises.push(promise);
            }
            
            const results = await Promise.all(promises);
            const metrics = monitor.getMetrics();
            
            expect(results).toHaveLength(concurrentRequests);
            expect(metrics.successRate).toBe(1);
            expect(metrics.executionTime).toBeLessThan(1000); // Complete within 1 second
        });

        test('should maintain performance under simulated load', async () => {
            const users = 20;
            const requestsPerUser = 10;
            const allPromises: Promise<any>[] = [];
            
            monitor.start();
            
            // Simulate multiple users making multiple requests
            for (let user = 0; user < users; user++) {
                for (let request = 0; request < requestsPerUser; request++) {
                    const promise = new Promise((resolve) => {
                        const iterationStart = performance.now();
                        
                        setTimeout(() => {
                            const result = mockTaxCalculation({
                                province: 'ON',
                                taxYear: 2024,
                                totalIncome: 40000 + (user * 2000) + (request * 500)
                            });
                            
                            const iterationTime = performance.now() - iterationStart;
                            monitor.recordIteration(iterationTime);
                            
                            resolve(result);
                        }, Math.random() * 20); // Random delay 0-20ms
                    });
                    
                    allPromises.push(promise);
                }
            }
            
            const results = await Promise.all(allPromises);
            const metrics = monitor.getMetrics();
            
            expect(results).toHaveLength(users * requestsPerUser);
            expect(metrics.successRate).toBe(1);
            expect(metrics.executionTime).toBeLessThan(2000); // Complete within 2 seconds
            
            // Calculate throughput
            const throughput = metrics.iterations / (metrics.executionTime / 1000); // requests per second
            expect(throughput).toBeGreaterThan(100); // At least 100 requests per second
        });
    });

    describe('Memory Usage Performance', () => {
        test('should not leak memory during repeated calculations', () => {
            const initialMemory = process.memoryUsage().heapUsed;
            const iterations = 1000;
            
            monitor.start();
            
            for (let i = 0; i < iterations; i++) {
                const iterationStart = performance.now();
                
                const result = mockTaxCalculation({
                    province: 'ON',
                    taxYear: 2024,
                    totalIncome: 50000 + (i % 100) * 1000
                });
                
                const iterationTime = performance.now() - iterationStart;
                monitor.recordIteration(iterationTime);
                
                // Occasionally force garbage collection in test environment
                if (i % 100 === 0 && global.gc) {
                    global.gc();
                }
            }
            
            // Force final garbage collection
            if (global.gc) {
                global.gc();
            }
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            const metrics = monitor.getMetrics();
            
            expect(metrics.iterations).toBe(iterations);
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
        });

        test('should handle large datasets efficiently', () => {
            const largeDataset = Array.from({ length: 100 }, (_, i) => ({
                province: ['ON', 'QC', 'BC', 'AB'][i % 4],
                taxYear: 2024,
                totalIncome: 30000 + (i * 1000),
                rrspContribution: 2000 + (i * 50),
                numberOfChildren: i % 3
            }));
            
            monitor.start();
            
            const results = largeDataset.map((params, index) => {
                const iterationStart = performance.now();
                
                const result = mockTaxCalculation(params);
                
                const iterationTime = performance.now() - iterationStart;
                monitor.recordIteration(iterationTime);
                
                return result;
            });
            
            const metrics = monitor.getMetrics();
            
            expect(results).toHaveLength(100);
            expect(metrics.iterations).toBe(100);
            expect(metrics.successRate).toBe(1);
            expect(metrics.executionTime).toBeLessThan(1000); // Complete within 1 second
            expect(metrics.memoryUsage).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
        });
    });

    describe('Stress Testing', () => {
        test('should handle extreme input values', () => {
            const extremeCases = [
                { totalIncome: 0.01, description: 'minimal income' },
                { totalIncome: 10000000, description: 'extreme high income' },
                { totalIncome: 999999999, description: 'maximum reasonable income' }
            ];
            
            monitor.start();
            
            extremeCases.forEach(testCase => {
                const iterationStart = performance.now();
                
                let hasError = false;
                try {
                    const result = mockTaxCalculation({
                        province: 'ON',
                        taxYear: 2024,
                        totalIncome: testCase.totalIncome
                    });
                    
                    expect(result).toBeDefined();
                    expect(result.federal.taxableIncome).toBeGreaterThanOrEqual(0);
                } catch (error) {
                    hasError = true;
                    console.log(`Error with ${testCase.description}:`, error);
                }
                
                const iterationTime = performance.now() - iterationStart;
                monitor.recordIteration(iterationTime, hasError);
                
                expect(iterationTime).toBeLessThan(500); // Should handle even extreme cases quickly
            });
            
            const metrics = monitor.getMetrics();
            expect(metrics.successRate).toBeGreaterThan(0.8); // At least 80% success rate
        });

        test('should maintain responsiveness under sustained load', async () => {
            const duration = 5000; // 5 seconds
            const startTime = performance.now();
            let requests = 0;
            
            monitor.start();
            
            while (performance.now() - startTime < duration) {
                const iterationStart = performance.now();
                
                const result = mockTaxCalculation({
                    province: ['ON', 'QC', 'BC', 'AB'][requests % 4],
                    taxYear: 2024,
                    totalIncome: 40000 + ((requests % 100) * 1000)
                });
                
                const iterationTime = performance.now() - iterationStart;
                monitor.recordIteration(iterationTime);
                
                requests++;
                
                // Brief pause to simulate real-world usage
                await new Promise(resolve => setTimeout(resolve, Math.random() * 2));
            }
            
            const metrics = monitor.getMetrics();
            const throughput = metrics.iterations / (duration / 1000);
            
            expect(metrics.iterations).toBeGreaterThan(100); // At least 100 requests in 5 seconds
            expect(throughput).toBeGreaterThan(20); // At least 20 requests per second
            expect(metrics.successRate).toBe(1);
            expect(metrics.averageTime).toBeLessThan(50); // Average response time under 50ms
        });
    });
});