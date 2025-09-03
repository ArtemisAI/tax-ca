/**
 * Test Data Generator for Canadian Tax Scenarios
 * Programmatic generation of tax calculation test data
 */

import { UserPersona } from './user-personas';

export interface TaxCalculationScenario {
    id: string;
    name: string;
    description: string;
    persona: UserPersona;
    taxYear: number;
    expectedResults?: {
        federalTax?: number;
        provincialTax?: number;
        totalTax?: number;
        effectiveRate?: number;
        marginalRate?: number;
        afterTaxIncome?: number;
    };
}

export interface TaxBracket {
    min: number;
    max: number;
    rate: number;
}

export interface ProvinceTaxData {
    province: string;
    brackets: TaxBracket[];
    basicExemption: number;
    credits: {
        basic: number;
        spouse: number;
        dependents: number;
        age: number;
        pension: number;
    };
}

/**
 * Generate random income within a realistic range
 */
export function generateRandomIncome(min: number = 30000, max: number = 150000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random age within working range
 */
export function generateRandomAge(min: number = 25, max: number = 65): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate realistic RRSP contribution (up to 18% of income, max $31,560 for 2025)
 */
export function generateRRSPContribution(income: number): number {
    const maxContribution = Math.min(income * 0.18, 31560);
    const contributionRate = Math.random() * 0.15; // 0-15% of income
    return Math.min(Math.floor(income * contributionRate), maxContribution);
}

/**
 * Generate random persona based on demographic profile
 */
export function generateRandomPersona(profile: 'young' | 'family' | 'retiree' | 'business'): UserPersona {
    const provinces = ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'];
    const randomProvince = provinces[Math.floor(Math.random() * provinces.length)];
    
    const basePersona: Partial<UserPersona> = {
        id: `generated-${profile}-${Date.now()}`,
        province: randomProvince,
        income: {
            employment: 0,
            selfEmployment: 0,
            pension: 0,
            oas: 0,
            cpp: 0,
            investment: 0,
            other: 0,
        },
        deductions: {
            rrsp: 0,
            pension: 0,
            union: 0,
            professional: 0,
            childcare: 0,
            medical: 0,
            charitable: 0,
        },
        credits: {
            basic: true,
            spouse: false,
            dependents: false,
            age: false,
            pension: false,
            disability: false,
            medicalExpenses: false,
            charitable: false,
        },
    };

    switch (profile) {
        case 'young':
            return {
                ...basePersona,
                name: 'Generated Young Professional',
                description: `Young professional in ${randomProvince}`,
                age: generateRandomAge(22, 35),
                maritalStatus: Math.random() > 0.7 ? 'married' : 'single',
                dependents: Math.random() > 0.8 ? 1 : 0,
                employmentStatus: 'employed',
                income: {
                    ...basePersona.income!,
                    employment: generateRandomIncome(40000, 85000),
                    investment: Math.floor(Math.random() * 3000),
                },
                deductions: {
                    ...basePersona.deductions!,
                    rrsp: generateRRSPContribution(generateRandomIncome(40000, 85000)),
                    pension: Math.floor(generateRandomIncome(40000, 85000) * 0.05),
                    professional: Math.floor(Math.random() * 800),
                    charitable: Math.floor(Math.random() * 1000),
                },
                credits: {
                    ...basePersona.credits!,
                    pension: true,
                    charitable: Math.random() > 0.5,
                },
            } as UserPersona;

        case 'family':
            const familyIncome = generateRandomIncome(60000, 120000);
            return {
                ...basePersona,
                name: 'Generated Family',
                description: `Family with children in ${randomProvince}`,
                age: generateRandomAge(30, 45),
                maritalStatus: Math.random() > 0.2 ? 'married' : 'divorced',
                dependents: Math.floor(Math.random() * 3) + 1,
                employmentStatus: 'employed',
                income: {
                    ...basePersona.income!,
                    employment: familyIncome,
                    investment: Math.floor(Math.random() * 5000),
                    other: Math.floor(Math.random() * 4000), // Child benefits
                },
                deductions: {
                    ...basePersona.deductions!,
                    rrsp: generateRRSPContribution(familyIncome),
                    pension: Math.floor(familyIncome * 0.05),
                    childcare: Math.floor(Math.random() * 15000),
                    medical: Math.floor(Math.random() * 2000),
                    charitable: Math.floor(Math.random() * 1500),
                },
                credits: {
                    ...basePersona.credits!,
                    dependents: true,
                    pension: true,
                    medicalExpenses: Math.random() > 0.6,
                    charitable: Math.random() > 0.4,
                },
            } as UserPersona;

        case 'retiree':
            const pensionIncome = generateRandomIncome(15000, 40000);
            const age = generateRandomAge(65, 80);
            return {
                ...basePersona,
                name: 'Generated Retiree',
                description: `Retiree in ${randomProvince}`,
                age,
                maritalStatus: Math.random() > 0.3 ? 'married' : 'widowed',
                dependents: 0,
                employmentStatus: 'retired',
                income: {
                    ...basePersona.income!,
                    pension: pensionIncome,
                    oas: age >= 65 ? (Math.random() > 0.1 ? 8150 : 0) : 0, // Most get OAS
                    cpp: Math.floor(Math.random() * 17000) + 5000,
                    investment: Math.floor(Math.random() * 25000),
                },
                deductions: {
                    ...basePersona.deductions!,
                    medical: Math.floor(Math.random() * 5000),
                    charitable: Math.floor(Math.random() * 2000),
                },
                credits: {
                    ...basePersona.credits!,
                    age: age >= 65,
                    pension: true,
                    medicalExpenses: Math.random() > 0.4,
                    charitable: Math.random() > 0.3,
                },
            } as UserPersona;

        case 'business':
            const businessIncome = generateRandomIncome(50000, 200000);
            return {
                ...basePersona,
                name: 'Generated Business Owner',
                description: `Business owner in ${randomProvince}`,
                age: generateRandomAge(35, 60),
                maritalStatus: Math.random() > 0.3 ? 'married' : 'single',
                dependents: Math.floor(Math.random() * 3),
                employmentStatus: 'self-employed',
                income: {
                    ...basePersona.income!,
                    selfEmployment: businessIncome,
                    investment: Math.floor(Math.random() * 15000),
                },
                deductions: {
                    ...basePersona.deductions!,
                    rrsp: generateRRSPContribution(businessIncome),
                    professional: Math.floor(Math.random() * 3000),
                    charitable: Math.floor(Math.random() * 2500),
                },
                credits: {
                    ...basePersona.credits!,
                    charitable: Math.random() > 0.4,
                },
            } as UserPersona;

        default:
            throw new Error(`Unknown profile: ${profile}`);
    }
}

/**
 * Generate multiple test scenarios
 */
export function generateTestScenarios(count: number): TaxCalculationScenario[] {
    const profiles: Array<'young' | 'family' | 'retiree' | 'business'> = ['young', 'family', 'retiree', 'business'];
    const scenarios: TaxCalculationScenario[] = [];

    for (let i = 0; i < count; i++) {
        const profile = profiles[i % profiles.length];
        const persona = generateRandomPersona(profile);
        
        scenarios.push({
            id: `scenario-${i + 1}`,
            name: `Generated Scenario ${i + 1}: ${profile}`,
            description: `Auto-generated ${profile} scenario for stress testing`,
            persona,
            taxYear: 2025,
        });
    }

    return scenarios;
}

/**
 * Generate edge case scenarios (very high/low incomes, complex situations)
 */
export function generateEdgeCaseScenarios(): TaxCalculationScenario[] {
    return [
        {
            id: 'edge-very-low-income',
            name: 'Very Low Income Scenario',
            description: 'Person with income below basic exemption',
            taxYear: 2025,
            persona: {
                id: 'edge-low',
                name: 'Very Low Income',
                description: 'Person earning below tax threshold',
                age: 25,
                province: 'ON',
                maritalStatus: 'single',
                dependents: 0,
                employmentStatus: 'employed',
                income: {
                    employment: 8000,
                    selfEmployment: 0,
                    pension: 0,
                    oas: 0,
                    cpp: 0,
                    investment: 0,
                    other: 0,
                },
                deductions: {
                    rrsp: 0,
                    pension: 0,
                    union: 0,
                    professional: 0,
                    childcare: 0,
                    medical: 0,
                    charitable: 0,
                },
                credits: {
                    basic: true,
                    spouse: false,
                    dependents: false,
                    age: false,
                    pension: false,
                    disability: false,
                    medicalExpenses: false,
                    charitable: false,
                },
            },
        },
        {
            id: 'edge-very-high-income',
            name: 'Very High Income Scenario',
            description: 'High earner in top tax bracket',
            taxYear: 2025,
            persona: {
                id: 'edge-high',
                name: 'Very High Income',
                description: 'High earner subject to highest marginal rates',
                age: 45,
                province: 'ON',
                maritalStatus: 'married',
                dependents: 2,
                employmentStatus: 'employed',
                income: {
                    employment: 500000,
                    selfEmployment: 0,
                    pension: 0,
                    oas: 0, // Would be clawed back
                    cpp: 0,
                    investment: 50000,
                    other: 0,
                },
                deductions: {
                    rrsp: 31560, // Max RRSP
                    pension: 25000,
                    union: 0,
                    professional: 2000,
                    childcare: 0,
                    medical: 1000,
                    charitable: 10000,
                },
                credits: {
                    basic: true,
                    spouse: true,
                    dependents: true,
                    age: false,
                    pension: true,
                    disability: false,
                    medicalExpenses: false,
                    charitable: true,
                },
            },
        },
    ];
}

/**
 * Generate performance test data for bulk calculations
 */
export function generatePerformanceTestData(count: number = 1000): UserPersona[] {
    const personas: UserPersona[] = [];
    
    for (let i = 0; i < count; i++) {
        const profiles: Array<'young' | 'family' | 'retiree' | 'business'> = ['young', 'family', 'retiree', 'business'];
        const profile = profiles[i % profiles.length];
        personas.push(generateRandomPersona(profile));
    }
    
    return personas;
}