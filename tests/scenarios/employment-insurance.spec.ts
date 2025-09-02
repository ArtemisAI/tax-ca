import { EI } from '../../src/taxes/employment-insurance';

describe('Scenario Tests - Employment Insurance (EI)', () => {
    describe('EI Premium Calculation Scenarios', () => {
        it('should calculate correct EI premiums for Ontario worker', () => {
            const grossIncome = 60000;
            const province = 'CA'; // Outside Quebec
            
            // Step 1: Determine insurable earnings (capped at maximum)
            const insurableEarnings = Math.min(grossIncome, EI.MAX_INSURABLE_EARNINGS);
            
            // Step 2: Calculate EI premium
            const premiumRate = EI.PREMIUM_RATES[province];
            const eiPremium = insurableEarnings * premiumRate;
            
            expect(insurableEarnings).toBe(60000);
            expect(premiumRate).toBe(0.0164);
            expect(eiPremium).toBeCloseTo(984, 2);
            
            // Validate the premium is reasonable (less than 2% of income)
            expect(eiPremium / grossIncome).toBeLessThan(0.02);
        });

        it('should calculate correct EI premiums for Quebec worker', () => {
            const grossIncome = 50000;
            const province = 'QC';
            
            const insurableEarnings = Math.min(grossIncome, EI.MAX_INSURABLE_EARNINGS);
            const premiumRate = EI.PREMIUM_RATES[province];
            const eiPremium = insurableEarnings * premiumRate;
            
            expect(insurableEarnings).toBe(50000);
            expect(premiumRate).toBe(0.0131);
            expect(eiPremium).toBeCloseTo(655, 2);
            
            // Quebec rate should be lower than rest of Canada
            expect(EI.PREMIUM_RATES.QC).toBeLessThan(EI.PREMIUM_RATES.CA);
        });

        it('should apply maximum insurable earnings cap for high-income earner', () => {
            const grossIncome = 100000;
            const province = 'CA';
            
            const insurableEarnings = Math.min(grossIncome, EI.MAX_INSURABLE_EARNINGS);
            const eiPremium = insurableEarnings * EI.PREMIUM_RATES[province];
            
            expect(insurableEarnings).toBe(EI.MAX_INSURABLE_EARNINGS);
            expect(insurableEarnings).toBe(65700);
            expect(eiPremium).toBeCloseTo(1077.48, 2);
            
            // Premium should be calculated only on the capped amount
            const uncappedPremium = grossIncome * EI.PREMIUM_RATES[province];
            expect(eiPremium).toBeLessThan(uncappedPremium);
        });

        it('should calculate EI premiums for part-time worker', () => {
            const grossIncome = 25000;
            const province = 'CA';
            
            const insurableEarnings = Math.min(grossIncome, EI.MAX_INSURABLE_EARNINGS);
            const eiPremium = insurableEarnings * EI.PREMIUM_RATES[province];
            
            expect(insurableEarnings).toBe(25000);
            expect(eiPremium).toBeCloseTo(410, 2);
            
            // Ensure premium rate is applied correctly for lower incomes
            expect(eiPremium / grossIncome).toBeCloseTo(0.0164, 4);
        });
    });

    describe('Cross-Provincial EI Comparison', () => {
        it('should demonstrate EI premium difference between Quebec and other provinces', () => {
            const testIncomes = [30000, 50000, 70000];
            
            testIncomes.forEach(income => {
                const insurableEarnings = Math.min(income, EI.MAX_INSURABLE_EARNINGS);
                
                const canadaPremium = insurableEarnings * EI.PREMIUM_RATES.CA;
                const quebecPremium = insurableEarnings * EI.PREMIUM_RATES.QC;
                
                // Quebec should always have lower premiums
                expect(quebecPremium).toBeLessThan(canadaPremium);
                
                const savings = canadaPremium - quebecPremium;
                expect(savings).toBeGreaterThan(0);
                
                // Calculate percentage difference
                const percentageDifference = savings / canadaPremium;
                expect(percentageDifference).toBeGreaterThan(0.15); // At least 15% savings
            });
        });

        it('should validate EI premium rates are within reasonable bounds', () => {
            expect(EI.PREMIUM_RATES.CA).toBeGreaterThan(0.01); // At least 1%
            expect(EI.PREMIUM_RATES.CA).toBeLessThan(0.025); // Less than 2.5%
            
            expect(EI.PREMIUM_RATES.QC).toBeGreaterThan(0.01);
            expect(EI.PREMIUM_RATES.QC).toBeLessThan(0.025);
        });
    });

    describe('EI Maximum Insurable Earnings Scenarios', () => {
        it('should validate current maximum insurable earnings', () => {
            expect(EI.MAX_INSURABLE_EARNINGS).toBe(65700);
            expect(EI.MAX_INSURABLE_EARNINGS).toBeGreaterThan(60000);
            expect(EI.MAX_INSURABLE_EARNINGS).toBeLessThan(100000);
        });

        it('should calculate maximum EI premium for each province', () => {
            const maxPremiumCA = EI.MAX_INSURABLE_EARNINGS * EI.PREMIUM_RATES.CA;
            const maxPremiumQC = EI.MAX_INSURABLE_EARNINGS * EI.PREMIUM_RATES.QC;
            
            expect(maxPremiumCA).toBeCloseTo(1077.48, 2);
            expect(maxPremiumQC).toBeCloseTo(860.67, 2);
            
            // Maximum premiums should be reasonable
            expect(maxPremiumCA).toBeLessThan(2000);
            expect(maxPremiumQC).toBeLessThan(2000);
        });

        it('should demonstrate EI premium calculation for various income levels', () => {
            const incomes = [20000, 40000, 60000, 80000, 120000];
            const results: Array<{income: number; canadaPremium: number; quebecPremium: number}> = [];
            
            incomes.forEach(income => {
                const insurableEarnings = Math.min(income, EI.MAX_INSURABLE_EARNINGS);
                const canadaPremium = insurableEarnings * EI.PREMIUM_RATES.CA;
                const quebecPremium = insurableEarnings * EI.PREMIUM_RATES.QC;
                
                results.push({ income, canadaPremium, quebecPremium });
            });
            
            // Validate premium progression
            for (let i = 1; i < results.length; i++) {
                const current = results[i];
                const previous = results[i-1];
                
                // Premiums should increase or stay the same (due to cap)
                expect(current.canadaPremium).toBeGreaterThanOrEqual(previous.canadaPremium);
                expect(current.quebecPremium).toBeGreaterThanOrEqual(previous.quebecPremium);
                
                // Quebec premiums should always be lower
                expect(current.quebecPremium).toBeLessThan(current.canadaPremium);
            }
        });
    });

    describe('Real-World EI Scenarios', () => {
        it('should calculate annual EI contributions for typical Canadian worker', () => {
            // Scenario: Average Canadian worker earning $55,000
            const grossIncome = 55000;
            const province = 'CA';
            
            const insurableEarnings = Math.min(grossIncome, EI.MAX_INSURABLE_EARNINGS);
            const annualEiPremium = insurableEarnings * EI.PREMIUM_RATES[province];
            const monthlyEiPremium = annualEiPremium / 12;
            
            expect(annualEiPremium).toBeCloseTo(902, 2);
            expect(monthlyEiPremium).toBeCloseTo(75.17, 2);
            
            // Validate this is a reasonable amount for a worker to contribute
            const annualTakeHomeImpact = annualEiPremium / grossIncome;
            expect(annualTakeHomeImpact).toBeLessThan(0.02); // Less than 2% of gross income
        });

        it('should calculate EI for Quebec worker with provincial benefits', () => {
            // Scenario: Quebec worker with reduced EI due to provincial programs
            const grossIncome = 45000;
            const province = 'QC';
            
            const insurableEarnings = Math.min(grossIncome, EI.MAX_INSURABLE_EARNINGS);
            const annualEiPremium = insurableEarnings * EI.PREMIUM_RATES[province];
            
            // Compare to what they would pay in other provinces
            const canadaPremium = insurableEarnings * EI.PREMIUM_RATES.CA;
            const savings = canadaPremium - annualEiPremium;
            
            expect(annualEiPremium).toBeCloseTo(589.50, 2);
            expect(canadaPremium).toBeCloseTo(738, 2);
            expect(savings).toBeCloseTo(148.50, 2);
            
            // Savings should be meaningful
            expect(savings / canadaPremium).toBeCloseTo(0.201, 3); // About 20% savings
        });

        it('should calculate EI for minimum wage worker', () => {
            // Scenario: Minimum wage worker (approx $15/hour, 2000 hours/year)
            const grossIncome = 30000;
            const province = 'CA';
            
            const insurableEarnings = Math.min(grossIncome, EI.MAX_INSURABLE_EARNINGS);
            const annualEiPremium = insurableEarnings * EI.PREMIUM_RATES[province];
            
            expect(insurableEarnings).toBe(30000);
            expect(annualEiPremium).toBeCloseTo(492, 2);
            
            // Ensure EI premium doesn't create undue burden
            const premiumBurden = annualEiPremium / grossIncome;
            expect(premiumBurden).toBeLessThan(0.02); // Less than 2%
        });
    });

    describe('EI Structure Validation', () => {
        it('should validate EI data structure integrity', () => {
            // Ensure all required properties exist
            expect(EI).toHaveProperty('MAX_INSURABLE_EARNINGS');
            expect(EI).toHaveProperty('PREMIUM_RATES');
            
            expect(EI.PREMIUM_RATES).toHaveProperty('CA');
            expect(EI.PREMIUM_RATES).toHaveProperty('QC');
            
            // Validate types
            expect(typeof EI.MAX_INSURABLE_EARNINGS).toBe('number');
            expect(typeof EI.PREMIUM_RATES.CA).toBe('number');
            expect(typeof EI.PREMIUM_RATES.QC).toBe('number');
        });

        it('should validate EI premium rates are realistic for 2025', () => {
            // Based on 2025 rates, validate they're in expected ranges
            expect(EI.PREMIUM_RATES.CA).toBeCloseTo(0.0164, 4);
            expect(EI.PREMIUM_RATES.QC).toBeCloseTo(0.0131, 4);
            
            // Ensure maximum insurable earnings is current
            expect(EI.MAX_INSURABLE_EARNINGS).toBe(65700);
        });

        it('should handle edge cases properly', () => {
            // Zero income
            const zeroIncome = 0;
            const zeroPremium = zeroIncome * EI.PREMIUM_RATES.CA;
            expect(zeroPremium).toBe(0);
            
            // Exact maximum income
            const maxIncome = EI.MAX_INSURABLE_EARNINGS;
            const maxPremium = maxIncome * EI.PREMIUM_RATES.CA;
            expect(maxPremium).toBeCloseTo(1077.48, 2);
            
            // Income above maximum
            const highIncome = 150000;
            const cappedEarnings = Math.min(highIncome, EI.MAX_INSURABLE_EARNINGS);
            expect(cappedEarnings).toBe(EI.MAX_INSURABLE_EARNINGS);
        });
    });
});