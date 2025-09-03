/**
 * Enhanced Performance Tests
 * Tests specific performance benchmarks: < 500ms response, > 1000 req/min throughput
 */

import { getFederalTaxAmount, getProvincialTaxAmount } from '../../../src/taxes/income-tax';
import { generatePerformanceTestData, generateRandomPersona } from '../fixtures/data-generator';
import { measurePerformance, calculateTaxForPersona } from '../helpers/test-utilities';
import { ALL_PERSONAS } from '../fixtures/user-personas';

describe('Enhanced Performance Tests', () => {
    describe('Response Time Requirements (< 500ms)', () => {
        it('should calculate single tax amount in under 500ms', () => {
            const startTime = performance.now();
            getFederalTaxAmount('ON', 75000, 0, 0, 0);
            const endTime = performance.now();
            
            const responseTime = endTime - startTime;
            expect(responseTime).toBeLessThan(500);
        });

        it('should complete comprehensive tax calculation in under 500ms', () => {
            const persona = ALL_PERSONAS[0];
            
            const startTime = performance.now();
            calculateTaxForPersona(persona);
            const endTime = performance.now();
            
            const responseTime = endTime - startTime;
            expect(responseTime).toBeLessThan(500);
        });

        it('should handle complex scenarios within 500ms', () => {
            const complexPersona = generateRandomPersona('business');
            
            const startTime = performance.now();
            
            // Perform multiple calculations for complex scenario
            calculateTaxForPersona(complexPersona);
            getFederalTaxAmount(complexPersona.province as any, 100000, 0.02, 5, 0);
            getProvincialTaxAmount(complexPersona.province as any, 150000, 0.025, 3, 0);
            
            const endTime = performance.now();
            
            const responseTime = endTime - startTime;
            expect(responseTime).toBeLessThan(500);
        });

        it('should maintain performance under stress conditions', () => {
            const iterations = 100;
            const times: number[] = [];
            
            for (let i = 0; i < iterations; i++) {
                const startTime = performance.now();
                getFederalTaxAmount('ON', 50000 + (i * 1000), 0, 0, 0);
                const endTime = performance.now();
                times.push(endTime - startTime);
            }
            
            // Check that 95% of calculations are under 500ms
            times.sort((a, b) => a - b);
            const p95Index = Math.floor(iterations * 0.95);
            const p95Time = times[p95Index];
            
            expect(p95Time).toBeLessThan(500);
        });
    });

    describe('Throughput Requirements (> 1000 req/min)', () => {
        it('should achieve over 1000 calculations per minute', () => {
            const testDuration = 60000; // 1 minute in milliseconds
            const targetThroughput = 1000;
            
            let calculationCount = 0;
            const startTime = performance.now();
            
            while (performance.now() - startTime < testDuration) {
                getFederalTaxAmount('ON', 50000, 0, 0, 0);
                calculationCount++;
                
                // Safety break to prevent infinite loop in test environment
                if (calculationCount > 100000) break;
            }
            
            const actualDuration = performance.now() - startTime;
            const actualThroughput = (calculationCount / actualDuration) * 60000;
            
            expect(actualThroughput).toBeGreaterThan(targetThroughput);
        });

        it('should handle concurrent-like processing efficiently', () => {
            const batchSize = 1000;
            const personas = generatePerformanceTestData(batchSize);
            
            const startTime = performance.now();
            
            personas.forEach(persona => {
                const totalIncome = Object.values(persona.income).reduce((sum, amount) => sum + amount, 0);
                getFederalTaxAmount(persona.province as any, totalIncome, 0, 0, 0);
            });
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            const throughput = (batchSize / duration) * 60000; // per minute
            
            expect(throughput).toBeGreaterThan(1000);
        });

        it('should maintain throughput with mixed calculation types', () => {
            const iterations = 2000;
            const provinces = ['ON', 'QC', 'BC', 'AB'];
            const incomes = [30000, 50000, 75000, 100000, 150000];
            
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                const province = provinces[i % provinces.length];
                const income = incomes[i % incomes.length];
                
                if (i % 2 === 0) {
                    getFederalTaxAmount(province as any, income, 0, 0, 0);
                } else {
                    getProvincialTaxAmount(province as any, income, 0, 0, 0);
                }
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            const throughput = (iterations / duration) * 60000; // per minute
            
            expect(throughput).toBeGreaterThan(1000);
        });

        it('should scale efficiently with increased load', () => {
            const loadLevels = [100, 500, 1000, 2000];
            const throughputs: number[] = [];
            
            loadLevels.forEach(loadLevel => {
                const metrics = measurePerformance(() => {
                    getFederalTaxAmount('ON', 50000, 0, 0, 0);
                }, loadLevel);
                
                throughputs.push(metrics.calculationsPerSecond * 60); // per minute
            });
            
            // Throughput should remain above 1000/min even at highest load
            throughputs.forEach(throughput => {
                expect(throughput).toBeGreaterThan(1000);
            });
            
            // Performance degradation should be minimal (< 50% between min and max load)
            const minThroughput = Math.min(...throughputs);
            const maxThroughput = Math.max(...throughputs);
            const degradation = (maxThroughput - minThroughput) / maxThroughput;
            
            expect(degradation).toBeLessThan(0.5);
        });
    });

    describe('Memory Efficiency', () => {
        it('should maintain memory usage below 100MB for typical scenarios', () => {
            const iterations = 10000;
            
            const metrics = measurePerformance(() => {
                const persona = generateRandomPersona('young');
                calculateTaxForPersona(persona);
            }, iterations);
            
            const memoryIncreaseMB = metrics.memoryUsage.increase / (1024 * 1024);
            expect(memoryIncreaseMB).toBeLessThan(100);
        });

        it('should not have memory leaks during extended operation', () => {
            const baseline = process.memoryUsage().heapUsed;
            
            // Run calculations for extended period
            for (let i = 0; i < 50000; i++) {
                getFederalTaxAmount('ON', 50000 + i, 0, 0, 0);
                
                // Force garbage collection periodically if available
                if (i % 10000 === 0 && global.gc) {
                    global.gc();
                }
            }
            
            // Force final garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            const final = process.memoryUsage().heapUsed;
            const increase = (final - baseline) / (1024 * 1024); // MB
            
            // Memory increase should be minimal (< 10MB) after GC
            expect(increase).toBeLessThan(10);
        });

        it('should handle large datasets efficiently', () => {
            const largeDataset = generatePerformanceTestData(10000);
            const initialMemory = process.memoryUsage().heapUsed;
            
            largeDataset.forEach(persona => {
                const totalIncome = Object.values(persona.income).reduce((sum, amount) => sum + amount, 0);
                getFederalTaxAmount(persona.province as any, totalIncome, 0, 0, 0);
            });
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024); // MB
            
            // Should process 10k records with < 50MB memory increase
            expect(memoryIncrease).toBeLessThan(50);
        });
    });

    describe('Scalability Tests', () => {
        it('should maintain performance with increasing complexity', () => {
            const complexityLevels = [
                { inflationRate: 0, years: 0 },
                { inflationRate: 0.02, years: 5 },
                { inflationRate: 0.025, years: 10 },
                { inflationRate: 0.03, years: 15 },
            ];
            
            const performanceResults: number[] = [];
            
            complexityLevels.forEach(({ inflationRate, years }) => {
                const metrics = measurePerformance(() => {
                    getFederalTaxAmount('ON', 75000, inflationRate, years, 0);
                }, 1000);
                
                performanceResults.push(metrics.calculationsPerSecond);
            });
            
            // Performance should not degrade significantly with complexity
            const minPerformance = Math.min(...performanceResults);
            const maxPerformance = Math.max(...performanceResults);
            const degradation = (maxPerformance - minPerformance) / maxPerformance;
            
            expect(degradation).toBeLessThan(0.3); // Less than 30% degradation
            expect(minPerformance).toBeGreaterThan(100); // Minimum performance threshold
        });

        it('should handle all provinces efficiently', () => {
            const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
            const provincialPerformance: Record<string, number> = {};
            
            provinces.forEach(province => {
                const metrics = measurePerformance(() => {
                    getFederalTaxAmount(province as any, 60000, 0, 0, 0);
                    getProvincialTaxAmount(province as any, 60000, 0, 0, 0);
                }, 1000);
                
                provincialPerformance[province] = metrics.calculationsPerSecond;
            });
            
            // All provinces should meet minimum performance requirements
            Object.values(provincialPerformance).forEach(performance => {
                expect(performance).toBeGreaterThan(100);
            });
            
            // Performance variance between provinces should be minimal
            const performances = Object.values(provincialPerformance);
            const minPerf = Math.min(...performances);
            const maxPerf = Math.max(...performances);
            const variance = (maxPerf - minPerf) / maxPerf;
            
            expect(variance).toBeLessThan(0.5); // Less than 50% variance
        });
    });

    describe('Real-world Performance Scenarios', () => {
        it('should handle peak load simulation', () => {
            // Simulate peak tax season load
            const peakLoadIterations = 5000;
            const personas = ALL_PERSONAS;
            let completedCalculations = 0;
            
            const startTime = performance.now();
            
            for (let i = 0; i < peakLoadIterations; i++) {
                const persona = personas[i % personas.length];
                calculateTaxForPersona(persona);
                completedCalculations++;
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            const throughput = (completedCalculations / duration) * 60000; // per minute
            
            expect(throughput).toBeGreaterThan(1000);
            expect(duration).toBeLessThan(300000); // Should complete in under 5 minutes
        });

        it('should maintain responsiveness during bulk processing', () => {
            const bulkData = generatePerformanceTestData(2000);
            const responseTimes: number[] = [];
            
            bulkData.forEach(persona => {
                const startTime = performance.now();
                calculateTaxForPersona(persona);
                const endTime = performance.now();
                responseTimes.push(endTime - startTime);
            });
            
            // 95% of calculations should be under 500ms
            responseTimes.sort((a, b) => a - b);
            const p95Index = Math.floor(responseTimes.length * 0.95);
            const p95ResponseTime = responseTimes[p95Index];
            
            expect(p95ResponseTime).toBeLessThan(500);
            
            // Average response time should be well under 500ms
            const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
            expect(avgResponseTime).toBeLessThan(100);
        });
    });
});