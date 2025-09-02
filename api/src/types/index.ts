import { ProvinceCode } from '../../../src/misc';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

// Income Tax Calculation Types
export interface IncomeTaxRequest {
  grossIncome: number;
  province: ProvinceCode;
  year?: number;
  inflationRate?: number;
  yearsToInflate?: number;
}

export interface IncomeTaxResponse {
  grossIncome: number;
  province: ProvinceCode;
  federalTax: number;
  provincialTax: number;
  totalTax: number;
  afterTaxIncome: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
}

// CPP Contributions Types
export interface CPPContributionRequest {
  income: number;
  year?: number;
}

export interface CPPContributionResponse {
  income: number;
  pensionableEarnings: number;
  baseContribution: number;
  enhancementContribution: number;
  totalContribution: number;
  year: number;
}

// EI Contributions Types
export interface EIContributionRequest {
  income: number;
  province: ProvinceCode;
  year?: number;
}

export interface EIContributionResponse {
  income: number;
  province: ProvinceCode;
  insurableEarnings: number;
  premiumRate: number;
  contribution: number;
  year: number;
}

// Dividend Tax Types
export interface DividendTaxRequest {
  dividendAmount: number;
  isEligible: boolean;
  province: ProvinceCode;
  year?: number;
}

export interface DividendTaxResponse {
  originalDividend: number;
  grossedUpDividend: number;
  taxCredit: number;
  taxOnGrossedUp: number;
  netTax: number;
  afterTaxDividend: number;
  effectiveTaxRate: number;
}

// Capital Gains Types
export interface CapitalGainsRequest {
  capitalGains: number;
  province: ProvinceCode;
  year?: number;
}

export interface CapitalGainsResponse {
  totalCapitalGains: number;
  taxableCapitalGains: number;
  taxOnCapitalGains: number;
  afterTaxGains: number;
  effectiveTaxRate: number;
}

// Data endpoint types
export interface TaxBracketsResponse {
  year: number;
  province: ProvinceCode;
  federal: {
    rates: Array<{ from: number; to: number; rate: number }>;
    baseTaxCredit: number;
    taxCreditRate: number;
  };
  provincial: {
    rates: Array<{ from: number; to: number; rate: number }>;
    baseTaxCredit: number;
    taxCreditRate: number;
    abatement: number;
  };
}

export interface PensionLimitsResponse {
  year: number;
  cpp: {
    basicExemption: number;
    ympe: number;
    yampe: number;
    baseRate: number;
    enhancementRate: number;
  };
  qpp?: {
    basicExemption: number;
    ympe: number;
    yampe: number;
    baseRate: number;
    enhancementRate: number;
  };
  ei: {
    maxInsurableEarnings: number;
    premiumRates: {
      ca: number;
      qc: number;
    };
  };
}

export interface ProvincesResponse {
  provinces: Array<{
    code: ProvinceCode;
    name: string;
  }>;
}