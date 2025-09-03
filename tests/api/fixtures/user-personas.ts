/**
 * Mock Data Fixtures for Canadian Tax Scenarios
 * Realistic user personas for comprehensive testing
 */

export interface UserPersona {
    id: string;
    name: string;
    description: string;
    age: number;
    province: string;
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    dependents: number;
    employmentStatus: 'employed' | 'self-employed' | 'retired' | 'unemployed';
    income: {
        employment: number;
        selfEmployment: number;
        pension: number;
        oas: number;
        cpp: number;
        investment: number;
        other: number;
    };
    deductions: {
        rrsp: number;
        pension: number;
        union: number;
        professional: number;
        childcare: number;
        medical: number;
        charitable: number;
    };
    credits: {
        basic: boolean;
        spouse: boolean;
        dependents: boolean;
        age: boolean;
        pension: boolean;
        disability: boolean;
        medicalExpenses: boolean;
        charitable: boolean;
    };
}

/**
 * Young Professional Personas
 */
export const YOUNG_PROFESSIONAL_ON: UserPersona = {
    id: 'young-professional-on',
    name: 'Alex Chen',
    description: 'Young software developer in Toronto, ON',
    age: 28,
    province: 'ON',
    maritalStatus: 'single',
    dependents: 0,
    employmentStatus: 'employed',
    income: {
        employment: 75000,
        selfEmployment: 0,
        pension: 0,
        oas: 0,
        cpp: 0,
        investment: 1200,
        other: 0,
    },
    deductions: {
        rrsp: 8000,
        pension: 3750,
        union: 0,
        professional: 450,
        childcare: 0,
        medical: 0,
        charitable: 500,
    },
    credits: {
        basic: true,
        spouse: false,
        dependents: false,
        age: false,
        pension: true,
        disability: false,
        medicalExpenses: false,
        charitable: true,
    },
};

export const YOUNG_PROFESSIONAL_QC: UserPersona = {
    id: 'young-professional-qc',
    name: 'Marie Dubois',
    description: 'Young marketing coordinator in Montreal, QC',
    age: 26,
    province: 'QC',
    maritalStatus: 'single',
    dependents: 0,
    employmentStatus: 'employed',
    income: {
        employment: 58000,
        selfEmployment: 0,
        pension: 0,
        oas: 0,
        cpp: 0,
        investment: 800,
        other: 0,
    },
    deductions: {
        rrsp: 6000,
        pension: 2900,
        union: 360,
        professional: 200,
        childcare: 0,
        medical: 0,
        charitable: 300,
    },
    credits: {
        basic: true,
        spouse: false,
        dependents: false,
        age: false,
        pension: true,
        disability: false,
        medicalExpenses: false,
        charitable: true,
    },
};

/**
 * Family Personas
 */
export const FAMILY_TWO_INCOME_ON: UserPersona = {
    id: 'family-two-income-on',
    name: 'Sarah & David Thompson',
    description: 'Dual-income family with two children in Ottawa, ON',
    age: 35,
    province: 'ON',
    maritalStatus: 'married',
    dependents: 2,
    employmentStatus: 'employed',
    income: {
        employment: 85000, // Combined household income
        selfEmployment: 0,
        pension: 0,
        oas: 0,
        cpp: 0,
        investment: 2400,
        other: 2500, // Child benefits
    },
    deductions: {
        rrsp: 10000,
        pension: 4250,
        union: 0,
        professional: 600,
        childcare: 12000,
        medical: 800,
        charitable: 1200,
    },
    credits: {
        basic: true,
        spouse: false, // Both spouses working
        dependents: true,
        age: false,
        pension: true,
        disability: false,
        medicalExpenses: true,
        charitable: true,
    },
};

export const SINGLE_PARENT_BC: UserPersona = {
    id: 'single-parent-bc',
    name: 'Jennifer Kim',
    description: 'Single mother with one child in Vancouver, BC',
    age: 32,
    province: 'BC',
    maritalStatus: 'divorced',
    dependents: 1,
    employmentStatus: 'employed',
    income: {
        employment: 52000,
        selfEmployment: 0,
        pension: 0,
        oas: 0,
        cpp: 0,
        investment: 400,
        other: 3600, // Child support and benefits
    },
    deductions: {
        rrsp: 4000,
        pension: 2600,
        union: 0,
        professional: 300,
        childcare: 8000,
        medical: 1200,
        charitable: 200,
    },
    credits: {
        basic: true,
        spouse: false,
        dependents: true,
        age: false,
        pension: true,
        disability: false,
        medicalExpenses: true,
        charitable: true,
    },
};

/**
 * Retiree Personas
 */
export const RETIREE_MIDDLE_INCOME_ON: UserPersona = {
    id: 'retiree-middle-income-on',
    name: 'Robert Wilson',
    description: 'Middle-income retiree in London, ON',
    age: 68,
    province: 'ON',
    maritalStatus: 'widowed',
    dependents: 0,
    employmentStatus: 'retired',
    income: {
        employment: 0,
        selfEmployment: 0,
        pension: 24000,
        oas: 8150,
        cpp: 16500,
        investment: 12000,
        other: 0,
    },
    deductions: {
        rrsp: 0,
        pension: 0,
        union: 0,
        professional: 0,
        childcare: 0,
        medical: 3200,
        charitable: 800,
    },
    credits: {
        basic: true,
        spouse: false,
        dependents: false,
        age: true,
        pension: true,
        disability: false,
        medicalExpenses: true,
        charitable: true,
    },
};

export const RETIREE_HIGH_INCOME_AB: UserPersona = {
    id: 'retiree-high-income-ab',
    name: 'Patricia & James Mitchell',
    description: 'High-income retired couple in Calgary, AB',
    age: 71,
    province: 'AB',
    maritalStatus: 'married',
    dependents: 0,
    employmentStatus: 'retired',
    income: {
        employment: 0,
        selfEmployment: 0,
        pension: 45000,
        oas: 7800, // Reduced due to clawback
        cpp: 33000, // Combined CPP for couple
        investment: 35000,
        other: 0,
    },
    deductions: {
        rrsp: 0,
        pension: 0,
        union: 0,
        professional: 0,
        childcare: 0,
        medical: 4500,
        charitable: 3000,
    },
    credits: {
        basic: true,
        spouse: true,
        dependents: false,
        age: true,
        pension: true,
        disability: false,
        medicalExpenses: true,
        charitable: true,
    },
};

/**
 * Business Owner Personas
 */
export const BUSINESS_OWNER_SK: UserPersona = {
    id: 'business-owner-sk',
    name: 'Michael Zhang',
    description: 'Small business owner in Saskatoon, SK',
    age: 45,
    province: 'SK',
    maritalStatus: 'married',
    dependents: 1,
    employmentStatus: 'self-employed',
    income: {
        employment: 0,
        selfEmployment: 95000,
        pension: 0,
        oas: 0,
        cpp: 0,
        investment: 5000,
        other: 0,
    },
    deductions: {
        rrsp: 12000,
        pension: 0,
        union: 0,
        professional: 2000,
        childcare: 4000,
        medical: 600,
        charitable: 1500,
    },
    credits: {
        basic: true,
        spouse: true,
        dependents: true,
        age: false,
        pension: false,
        disability: false,
        medicalExpenses: false,
        charitable: true,
    },
};

/**
 * Collection of all personas for testing
 */
export const ALL_PERSONAS: UserPersona[] = [
    YOUNG_PROFESSIONAL_ON,
    YOUNG_PROFESSIONAL_QC,
    FAMILY_TWO_INCOME_ON,
    SINGLE_PARENT_BC,
    RETIREE_MIDDLE_INCOME_ON,
    RETIREE_HIGH_INCOME_AB,
    BUSINESS_OWNER_SK,
];

/**
 * Get persona by ID
 */
export function getPersonaById(id: string): UserPersona | undefined {
    return ALL_PERSONAS.find((persona) => persona.id === id);
}

/**
 * Get personas by category
 */
export function getPersonasByCategory(category: 'young' | 'family' | 'retiree' | 'business'): UserPersona[] {
    switch (category) {
        case 'young':
            return [YOUNG_PROFESSIONAL_ON, YOUNG_PROFESSIONAL_QC];
        case 'family':
            return [FAMILY_TWO_INCOME_ON, SINGLE_PARENT_BC];
        case 'retiree':
            return [RETIREE_MIDDLE_INCOME_ON, RETIREE_HIGH_INCOME_AB];
        case 'business':
            return [BUSINESS_OWNER_SK];
        default:
            return [];
    }
}
