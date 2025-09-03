/**
 * Unit tests for Public Pension Plan interface
 * Tests the interface structure and its implementations (CPP and QPP)
 */

import { PublicPensionPlan } from '../../../src/pension/public-pension-plan';
import { CPP } from '../../../src/pension/canada-pension-plan';
import { QPP } from '../../../src/pension/quebec-pension-plan';

describe('Public Pension Plan Interface', () => {
    const implementations: Array<{ name: string; plan: PublicPensionPlan }> = [
        { name: 'CPP', plan: CPP },
        { name: 'QPP', plan: QPP },
    ];

    describe('Interface compliance', () => {
        implementations.forEach(({ name, plan }) => {
            describe(`${name} implementation`, () => {
                it('should have all required properties', () => {
                    expect(plan).toHaveProperty('PENSIONABLE_EARNINGS');
                    expect(plan).toHaveProperty('CONTRIBUTION_RATES');
                    expect(plan).toHaveProperty('DEATH_BENEFIT');
                    expect(plan).toHaveProperty('DEFAULT_REFERENCE_AGE');
                    expect(plan).toHaveProperty('FLAT_BENEFIT');
                    expect(plan).toHaveProperty('INDEXATION_RATE_REFERENCES');
                    expect(plan).toHaveProperty('MAX_PENSION');
                    expect(plan).toHaveProperty('MAX_INCOME');
                    expect(plan).toHaveProperty('MAX_REQUEST_AGE');
                    expect(plan).toHaveProperty('MIN_REQUEST_AGE');
                    expect(plan).toHaveProperty('MONTHLY_DELAY');
                    expect(plan).toHaveProperty('REPLACEMENT_FACTOR');
                    expect(plan).toHaveProperty('SURVIVOR_RATES');
                    expect(plan).toHaveProperty('YEARS_TO_FULL_PENSION');
                });

                it('should have all required methods', () => {
                    expect(plan).toHaveProperty('getRequestDateFactor');
                    expect(plan).toHaveProperty('getAverageIndexationRate');
                    expect(typeof plan.getRequestDateFactor).toBe('function');
                    expect(typeof plan.getAverageIndexationRate).toBe('function');
                });

                it('should have correct property types', () => {
                    expect(typeof plan.DEFAULT_REFERENCE_AGE).toBe('number');
                    expect(typeof plan.MAX_REQUEST_AGE).toBe('number');
                    expect(typeof plan.MIN_REQUEST_AGE).toBe('number');
                    expect(typeof plan.REPLACEMENT_FACTOR).toBe('number');
                    expect(typeof plan.YEARS_TO_FULL_PENSION).toBe('number');
                    expect(typeof plan.PENSIONABLE_EARNINGS).toBe('object');
                    expect(typeof plan.CONTRIBUTION_RATES).toBe('object');
                    expect(typeof plan.DEATH_BENEFIT).toBe('object');
                    expect(typeof plan.FLAT_BENEFIT).toBe('object');
                    expect(Array.isArray(plan.INDEXATION_RATE_REFERENCES)).toBe(true);
                    expect(typeof plan.MAX_PENSION).toBe('object');
                    expect(typeof plan.MAX_INCOME).toBe('object');
                    expect(typeof plan.MONTHLY_DELAY).toBe('object');
                    expect(typeof plan.SURVIVOR_RATES).toBe('object');
                });
            });
        });
    });

    describe('Pensionable earnings structure', () => {
        implementations.forEach(({ name, plan }) => {
            describe(`${name} pensionable earnings`, () => {
                it('should have correct structure', () => {
                    expect(plan.PENSIONABLE_EARNINGS).toHaveProperty('BASIC_EXEMPTION');
                    expect(plan.PENSIONABLE_EARNINGS).toHaveProperty('YMPE');
                    expect(plan.PENSIONABLE_EARNINGS).toHaveProperty('YMPE_AVG_5');
                    expect(plan.PENSIONABLE_EARNINGS).toHaveProperty('YAMPE');
                    expect(plan.PENSIONABLE_EARNINGS).toHaveProperty('YAMPE_AVG_5');
                });

                it('should have positive values', () => {
                    expect(plan.PENSIONABLE_EARNINGS.BASIC_EXEMPTION).toBeGreaterThan(0);
                    expect(plan.PENSIONABLE_EARNINGS.YMPE).toBeGreaterThan(0);
                    expect(plan.PENSIONABLE_EARNINGS.YMPE_AVG_5).toBeGreaterThan(0);
                    expect(plan.PENSIONABLE_EARNINGS.YAMPE).toBeGreaterThan(0);
                    expect(plan.PENSIONABLE_EARNINGS.YAMPE_AVG_5).toBeGreaterThan(0);
                });
            });
        });
    });

    describe('Contribution rates structure', () => {
        implementations.forEach(({ name, plan }) => {
            describe(`${name} contribution rates`, () => {
                it('should have correct structure', () => {
                    expect(plan.CONTRIBUTION_RATES).toHaveProperty('BASE');
                    expect(plan.CONTRIBUTION_RATES).toHaveProperty('ENHANCEMENT_STEP_2');
                });

                it('should have valid percentage rates', () => {
                    expect(plan.CONTRIBUTION_RATES.BASE).toBeGreaterThan(0);
                    expect(plan.CONTRIBUTION_RATES.BASE).toBeLessThan(0.2);
                    expect(plan.CONTRIBUTION_RATES.ENHANCEMENT_STEP_2).toBeGreaterThan(0);
                    expect(plan.CONTRIBUTION_RATES.ENHANCEMENT_STEP_2).toBeLessThan(0.2);
                });
            });
        });
    });

    describe('Age-related properties', () => {
        implementations.forEach(({ name, plan }) => {
            describe(`${name} age properties`, () => {
                it('should have logical age relationships', () => {
                    expect(plan.MIN_REQUEST_AGE).toBeLessThan(plan.MAX_REQUEST_AGE);
                    expect(plan.MIN_REQUEST_AGE).toBeGreaterThan(50);
                    expect(plan.MAX_REQUEST_AGE).toBeLessThan(80);
                    expect(plan.DEFAULT_REFERENCE_AGE).toBeGreaterThanOrEqual(plan.MIN_REQUEST_AGE);
                    expect(plan.DEFAULT_REFERENCE_AGE).toBeLessThanOrEqual(plan.MAX_REQUEST_AGE);
                });

                it('should have reasonable years to full pension', () => {
                    expect(plan.YEARS_TO_FULL_PENSION).toBeGreaterThan(30);
                    expect(plan.YEARS_TO_FULL_PENSION).toBeLessThan(50);
                });
            });
        });
    });

    describe('Method functionality', () => {
        implementations.forEach(({ name, plan }) => {
            describe(`${name} methods`, () => {
                it('should calculate average indexation rate', () => {
                    const avgRate = plan.getAverageIndexationRate();
                    expect(typeof avgRate).toBe('number');
                    expect(avgRate).toBeGreaterThan(0);
                    expect(avgRate).toBeLessThan(0.1); // Should be less than 10%
                });

                it('should calculate request date factor', () => {
                    const birthDate = new Date('1960-01-01');
                    const requestDate = new Date('2025-01-01');
                    const factor = plan.getRequestDateFactor(birthDate, requestDate);

                    expect(typeof factor).toBe('number');
                    expect(factor).toBeGreaterThan(0);
                });

                it('should handle request date factor with custom reference date', () => {
                    const birthDate = new Date('1960-01-01');
                    const requestDate = new Date('2025-01-01');
                    const customRefDate = new Date('2024-01-01');
                    const factor = plan.getRequestDateFactor(birthDate, requestDate, customRefDate);

                    expect(typeof factor).toBe('number');
                    expect(factor).toBeGreaterThan(0);
                });
            });
        });
    });

    describe('Death benefit structure', () => {
        implementations.forEach(({ name, plan }) => {
            describe(`${name} death benefit`, () => {
                it('should have correct structure', () => {
                    expect(plan.DEATH_BENEFIT).toHaveProperty('RATE');
                    expect(typeof plan.DEATH_BENEFIT.RATE).toBe('number');
                    expect(plan.DEATH_BENEFIT.RATE).toBeGreaterThan(0);
                });
            });
        });
    });

    describe('Flat benefit structure', () => {
        implementations.forEach(({ name, plan }) => {
            describe(`${name} flat benefit`, () => {
                it('should have all benefit types', () => {
                    expect(plan.FLAT_BENEFIT).toHaveProperty('ORPHAN');
                    expect(plan.FLAT_BENEFIT).toHaveProperty('DISABILITY');
                    expect(plan.FLAT_BENEFIT).toHaveProperty('UNDER_45');
                    expect(plan.FLAT_BENEFIT).toHaveProperty('UNDER_45_WITH_CHILD');
                    expect(plan.FLAT_BENEFIT).toHaveProperty('UNDER_45_DISABLED');
                    expect(plan.FLAT_BENEFIT).toHaveProperty('FROM_45_TO_64');
                    expect(plan.FLAT_BENEFIT).toHaveProperty('OVER_64_WITHOUT_PENSION');
                });

                it('should have positive benefit amounts', () => {
                    expect(plan.FLAT_BENEFIT.ORPHAN).toBeGreaterThan(0);
                    expect(plan.FLAT_BENEFIT.DISABILITY).toBeGreaterThan(0);
                    expect(plan.FLAT_BENEFIT.UNDER_45).toBeGreaterThan(0);
                    expect(plan.FLAT_BENEFIT.UNDER_45_WITH_CHILD).toBeGreaterThan(0);
                    expect(plan.FLAT_BENEFIT.UNDER_45_DISABLED).toBeGreaterThan(0);
                    expect(plan.FLAT_BENEFIT.FROM_45_TO_64).toBeGreaterThan(0);
                    expect(plan.FLAT_BENEFIT.OVER_64_WITHOUT_PENSION).toBeGreaterThan(0);
                });
            });
        });
    });

    describe('Comparison between CPP and QPP', () => {
        it('should have similar but distinct structures', () => {
            expect(CPP.MIN_REQUEST_AGE).toBe(QPP.MIN_REQUEST_AGE);
            // QPP allows requests up to age 72, CPP only to 70
            expect(CPP.MAX_REQUEST_AGE).toBe(70);
            expect(QPP.MAX_REQUEST_AGE).toBe(72);
            // Contribution rates may differ slightly
            expect(Math.abs(CPP.CONTRIBUTION_RATES.BASE - QPP.CONTRIBUTION_RATES.BASE)).toBeLessThan(0.01);
        });

        it('should have different implementation details', () => {
            // They should be separate objects
            expect(CPP).not.toBe(QPP);
            // QPP typically has different contribution rates than CPP
            expect(CPP.CONTRIBUTION_RATES.BASE).not.toBe(QPP.CONTRIBUTION_RATES.BASE);
        });
    });
});
