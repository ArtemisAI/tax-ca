import { QPIP } from '../../src/taxes/quebec-parental-insurance-plan';

describe('Scenario Tests - Quebec Parental Insurance Plan (QPIP)', () => {
    describe('QPIP Premium Calculation for Salaried Workers', () => {
        it('should calculate correct QPIP premiums for Quebec salaried employee', () => {
            const grossIncome = 55000;
            const employmentType = 'SALARIED';
            
            // Step 1: Determine insurable earnings (capped at maximum)
            const insurableEarnings = Math.min(grossIncome, QPIP.MAX_INSURABLE_EARNINGS);
            
            // Step 2: Calculate QPIP premium for salaried worker
            const premiumRate = QPIP.PREMIUM_RATES[employmentType];
            const qpipPremium = insurableEarnings * premiumRate;
            
            expect(insurableEarnings).toBe(55000);
            expect(premiumRate).toBe(0.00494);
            expect(qpipPremium).toBeCloseTo(271.70, 2);
            
            // Validate the premium is reasonable (less than 1% of income)
            expect(qpipPremium / grossIncome).toBeLessThan(0.01);
        });

        it('should apply maximum insurable earnings cap for high-income salaried worker', () => {
            const grossIncome = 120000;
            const employmentType = 'SALARIED';
            
            const insurableEarnings = Math.min(grossIncome, QPIP.MAX_INSURABLE_EARNINGS);
            const qpipPremium = insurableEarnings * QPIP.PREMIUM_RATES[employmentType];
            
            expect(insurableEarnings).toBe(QPIP.MAX_INSURABLE_EARNINGS);
            expect(insurableEarnings).toBe(98000);
            expect(qpipPremium).toBeCloseTo(484.12, 2);
            
            // Premium should be calculated only on the capped amount
            const uncappedPremium = grossIncome * QPIP.PREMIUM_RATES[employmentType];
            expect(qpipPremium).toBeLessThan(uncappedPremium);
        });

        it('should calculate QPIP premiums for part-time salaried worker', () => {
            const grossIncome = 25000;
            const employmentType = 'SALARIED';
            
            const insurableEarnings = Math.min(grossIncome, QPIP.MAX_INSURABLE_EARNINGS);
            const qpipPremium = insurableEarnings * QPIP.PREMIUM_RATES[employmentType];
            
            expect(insurableEarnings).toBe(25000);
            expect(qpipPremium).toBeCloseTo(123.50, 2);
            
            // Ensure premium rate is applied correctly for lower incomes
            expect(qpipPremium / grossIncome).toBeCloseTo(0.00494, 5);
        });
    });

    describe('QPIP Premium Calculation for Self-Employed Workers', () => {
        it('should calculate correct QPIP premiums for Quebec self-employed worker', () => {
            const grossIncome = 65000;
            const employmentType = 'SELF_EMPLOYED';
            
            const insurableEarnings = Math.min(grossIncome, QPIP.MAX_INSURABLE_EARNINGS);
            const premiumRate = QPIP.PREMIUM_RATES[employmentType];
            const qpipPremium = insurableEarnings * premiumRate;
            
            expect(insurableEarnings).toBe(65000);
            expect(premiumRate).toBe(0.00878);
            expect(qpipPremium).toBeCloseTo(570.70, 2);
            
            // Self-employed rate should be higher than salaried rate
            expect(QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBeGreaterThan(QPIP.PREMIUM_RATES.SALARIED);
        });

        it('should calculate maximum QPIP premium for self-employed worker', () => {
            const grossIncome = 150000;
            const employmentType = 'SELF_EMPLOYED';
            
            const insurableEarnings = Math.min(grossIncome, QPIP.MAX_INSURABLE_EARNINGS);
            const qpipPremium = insurableEarnings * QPIP.PREMIUM_RATES[employmentType];
            
            expect(insurableEarnings).toBe(98000);
            expect(qpipPremium).toBeCloseTo(860.44, 2);
            
            // This should be the maximum possible QPIP premium for self-employed
            const maxPremium = QPIP.MAX_INSURABLE_EARNINGS * QPIP.PREMIUM_RATES.SELF_EMPLOYED;
            expect(qpipPremium).toBe(maxPremium);
        });

        it('should demonstrate premium difference between salaried and self-employed', () => {
            const testIncomes = [40000, 60000, 80000, 100000];
            
            testIncomes.forEach(income => {
                const insurableEarnings = Math.min(income, QPIP.MAX_INSURABLE_EARNINGS);
                
                const salariedPremium = insurableEarnings * QPIP.PREMIUM_RATES.SALARIED;
                const selfEmployedPremium = insurableEarnings * QPIP.PREMIUM_RATES.SELF_EMPLOYED;
                
                // Self-employed should always pay more
                expect(selfEmployedPremium).toBeGreaterThan(salariedPremium);
                
                const difference = selfEmployedPremium - salariedPremium;
                expect(difference).toBeGreaterThan(0);
                
                // Calculate the ratio
                const ratio = selfEmployedPremium / salariedPremium;
                expect(ratio).toBeCloseTo(1.777, 3); // Approximately 77.7% higher
            });
        });
    });

    describe('QPIP Maximum Insurable Earnings Scenarios', () => {
        it('should validate current maximum insurable earnings', () => {
            expect(QPIP.MAX_INSURABLE_EARNINGS).toBe(98000);
            expect(QPIP.MAX_INSURABLE_EARNINGS).toBeGreaterThan(90000);
            expect(QPIP.MAX_INSURABLE_EARNINGS).toBeLessThan(150000);
        });

        it('should calculate maximum QPIP premiums for each employment type', () => {
            const maxPremiumSalaried = QPIP.MAX_INSURABLE_EARNINGS * QPIP.PREMIUM_RATES.SALARIED;
            const maxPremiumSelfEmployed = QPIP.MAX_INSURABLE_EARNINGS * QPIP.PREMIUM_RATES.SELF_EMPLOYED;
            
            expect(maxPremiumSalaried).toBeCloseTo(484.12, 2);
            expect(maxPremiumSelfEmployed).toBeCloseTo(860.44, 2);
            
            // Maximum premiums should be reasonable
            expect(maxPremiumSalaried).toBeLessThan(1000);
            expect(maxPremiumSelfEmployed).toBeLessThan(1500);
        });

        it('should demonstrate QPIP premium progression across income levels', () => {
            const incomes = [20000, 50000, 75000, 100000, 150000];
            const results: Array<{
                income: number; 
                salariedPremium: number; 
                selfEmployedPremium: number;
            }> = [];
            
            incomes.forEach(income => {
                const insurableEarnings = Math.min(income, QPIP.MAX_INSURABLE_EARNINGS);
                const salariedPremium = insurableEarnings * QPIP.PREMIUM_RATES.SALARIED;
                const selfEmployedPremium = insurableEarnings * QPIP.PREMIUM_RATES.SELF_EMPLOYED;
                
                results.push({ income, salariedPremium, selfEmployedPremium });
            });
            
            // Validate premium progression
            for (let i = 1; i < results.length; i++) {
                const current = results[i];
                const previous = results[i-1];
                
                // Premiums should increase or stay the same (due to cap)
                expect(current.salariedPremium).toBeGreaterThanOrEqual(previous.salariedPremium);
                expect(current.selfEmployedPremium).toBeGreaterThanOrEqual(previous.selfEmployedPremium);
                
                // Self-employed premiums should always be higher
                expect(current.selfEmployedPremium).toBeGreaterThan(current.salariedPremium);
            }
        });
    });

    describe('Real-World QPIP Scenarios', () => {
        it('should calculate annual QPIP contributions for typical Quebec worker', () => {
            // Scenario: Average Quebec worker earning $50,000
            const grossIncome = 50000;
            const employmentType = 'SALARIED';
            
            const insurableEarnings = Math.min(grossIncome, QPIP.MAX_INSURABLE_EARNINGS);
            const annualQpipPremium = insurableEarnings * QPIP.PREMIUM_RATES[employmentType];
            const monthlyQpipPremium = annualQpipPremium / 12;
            
            expect(annualQpipPremium).toBeCloseTo(247, 2);
            expect(monthlyQpipPremium).toBeCloseTo(20.58, 2);
            
            // Validate this is a reasonable amount for a worker to contribute
            const annualTakeHomeImpact = annualQpipPremium / grossIncome;
            expect(annualTakeHomeImpact).toBeLessThan(0.01); // Less than 1% of gross income
        });

        it('should calculate QPIP for Quebec entrepreneur', () => {
            // Scenario: Self-employed business owner earning $80,000
            const grossIncome = 80000;
            const employmentType = 'SELF_EMPLOYED';
            
            const insurableEarnings = Math.min(grossIncome, QPIP.MAX_INSURABLE_EARNINGS);
            const annualQpipPremium = insurableEarnings * QPIP.PREMIUM_RATES[employmentType];
            
            // Compare to what they would pay as salaried worker
            const salariedPremium = insurableEarnings * QPIP.PREMIUM_RATES.SALARIED;
            const additionalCost = annualQpipPremium - salariedPremium;
            
            expect(annualQpipPremium).toBeCloseTo(702.40, 2);
            expect(salariedPremium).toBeCloseTo(395.20, 2);
            expect(additionalCost).toBeCloseTo(307.20, 2);
            
            // Additional cost should be meaningful but not prohibitive
            expect(additionalCost / grossIncome).toBeLessThan(0.005); // Less than 0.5% of income
        });

        it('should calculate QPIP for high-income Quebec professional', () => {
            // Scenario: High-income professional earning $120,000
            const grossIncome = 120000;
            const employmentType = 'SALARIED';
            
            const insurableEarnings = Math.min(grossIncome, QPIP.MAX_INSURABLE_EARNINGS);
            const annualQpipPremium = insurableEarnings * QPIP.PREMIUM_RATES[employmentType];
            
            expect(insurableEarnings).toBe(98000); // Capped at maximum
            expect(annualQpipPremium).toBeCloseTo(484.12, 2);
            
            // Premium should be capped, so effective rate decreases for high earners
            const effectiveRate = annualQpipPremium / grossIncome;
            expect(effectiveRate).toBeLessThan(QPIP.PREMIUM_RATES.SALARIED);
        });

        it('should calculate QPIP for young Quebec worker starting career', () => {
            // Scenario: Recent graduate earning $35,000
            const grossIncome = 35000;
            const employmentType = 'SALARIED';
            
            const insurableEarnings = Math.min(grossIncome, QPIP.MAX_INSURABLE_EARNINGS);
            const annualQpipPremium = insurableEarnings * QPIP.PREMIUM_RATES[employmentType];
            const biweeklyPremium = annualQpipPremium / 26; // 26 pay periods
            
            expect(annualQpipPremium).toBeCloseTo(172.90, 2);
            expect(biweeklyPremium).toBeCloseTo(6.65, 2);
            
            // Should be a manageable amount for someone starting their career
            expect(biweeklyPremium).toBeLessThan(20);
        });
    });

    describe('QPIP Comparative Analysis', () => {
        it('should compare QPIP burden across different income levels', () => {
            const incomes = [30000, 50000, 70000, 100000];
            const burdenAnalysis: Array<{
                income: number;
                salariedBurden: number;
                selfEmployedBurden: number;
            }> = [];
            
            incomes.forEach(income => {
                const insurableEarnings = Math.min(income, QPIP.MAX_INSURABLE_EARNINGS);
                const salariedPremium = insurableEarnings * QPIP.PREMIUM_RATES.SALARIED;
                const selfEmployedPremium = insurableEarnings * QPIP.PREMIUM_RATES.SELF_EMPLOYED;
                
                const salariedBurden = salariedPremium / income;
                const selfEmployedBurden = selfEmployedPremium / income;
                
                burdenAnalysis.push({ income, salariedBurden, selfEmployedBurden });
            });
            
            // Validate burden decreases for higher incomes (due to cap)
            burdenAnalysis.forEach((analysis, index) => {
                expect(analysis.salariedBurden).toBeLessThan(0.01); // Less than 1%
                expect(analysis.selfEmployedBurden).toBeLessThan(0.015); // Less than 1.5%
                
                if (index > 0 && analysis.income > QPIP.MAX_INSURABLE_EARNINGS) {
                    const previous = burdenAnalysis[index - 1];
                    expect(analysis.salariedBurden).toBeLessThan(previous.salariedBurden);
                    expect(analysis.selfEmployedBurden).toBeLessThan(previous.selfEmployedBurden);
                }
            });
        });

        it('should validate QPIP rates are within reasonable bounds', () => {
            expect(QPIP.PREMIUM_RATES.SALARIED).toBeGreaterThan(0.003); // At least 0.3%
            expect(QPIP.PREMIUM_RATES.SALARIED).toBeLessThan(0.01); // Less than 1%
            
            expect(QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBeGreaterThan(0.005); // At least 0.5%
            expect(QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBeLessThan(0.015); // Less than 1.5%
        });
    });

    describe('QPIP Structure Validation', () => {
        it('should validate QPIP data structure integrity', () => {
            // Ensure all required properties exist
            expect(QPIP).toHaveProperty('MAX_INSURABLE_EARNINGS');
            expect(QPIP).toHaveProperty('PREMIUM_RATES');
            
            expect(QPIP.PREMIUM_RATES).toHaveProperty('SALARIED');
            expect(QPIP.PREMIUM_RATES).toHaveProperty('SELF_EMPLOYED');
            
            // Validate types
            expect(typeof QPIP.MAX_INSURABLE_EARNINGS).toBe('number');
            expect(typeof QPIP.PREMIUM_RATES.SALARIED).toBe('number');
            expect(typeof QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBe('number');
        });

        it('should validate QPIP premium rates are realistic for 2025', () => {
            // Based on 2025 rates, validate they're in expected ranges
            expect(QPIP.PREMIUM_RATES.SALARIED).toBeCloseTo(0.00494, 5);
            expect(QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBeCloseTo(0.00878, 5);
            
            // Ensure maximum insurable earnings is current
            expect(QPIP.MAX_INSURABLE_EARNINGS).toBe(98000);
        });

        it('should handle edge cases properly', () => {
            // Zero income
            const zeroIncome = 0;
            const zeroPremium = zeroIncome * QPIP.PREMIUM_RATES.SALARIED;
            expect(zeroPremium).toBe(0);
            
            // Exact maximum income
            const maxIncome = QPIP.MAX_INSURABLE_EARNINGS;
            const maxSalariedPremium = maxIncome * QPIP.PREMIUM_RATES.SALARIED;
            const maxSelfEmployedPremium = maxIncome * QPIP.PREMIUM_RATES.SELF_EMPLOYED;
            
            expect(maxSalariedPremium).toBeCloseTo(484.12, 2);
            expect(maxSelfEmployedPremium).toBeCloseTo(860.44, 2);
            
            // Income above maximum
            const highIncome = 200000;
            const cappedEarnings = Math.min(highIncome, QPIP.MAX_INSURABLE_EARNINGS);
            expect(cappedEarnings).toBe(QPIP.MAX_INSURABLE_EARNINGS);
        });

        it('should validate relationship between premium rates', () => {
            // Self-employed rate should be approximately 1.777x the salaried rate
            const ratio = QPIP.PREMIUM_RATES.SELF_EMPLOYED / QPIP.PREMIUM_RATES.SALARIED;
            expect(ratio).toBeCloseTo(1.777, 3);
            
            // Verify this is because self-employed pay both employee and employer portions
            const expectedSelfEmployedRate = QPIP.PREMIUM_RATES.SALARIED * 1.777;
            expect(QPIP.PREMIUM_RATES.SELF_EMPLOYED).toBeCloseTo(expectedSelfEmployedRate, 5);
        });
    });

    describe('QPIP Benefits Context', () => {
        it('should provide context on QPIP benefits relative to premiums', () => {
            // Scenario: Calculate annual premium vs potential benefits
            const typicalIncome = 60000;
            const insurableEarnings = Math.min(typicalIncome, QPIP.MAX_INSURABLE_EARNINGS);
            const annualPremium = insurableEarnings * QPIP.PREMIUM_RATES.SALARIED;
            
            expect(annualPremium).toBeCloseTo(296.40, 2);
            
            // QPIP provides maternity/parental benefits up to a percentage of insurable earnings
            // This test validates the premium is reasonable for the insurance provided
            expect(annualPremium / typicalIncome).toBeLessThan(0.01); // Less than 1% for significant protection
        });
    });
});