// Import from compiled JS files in dist directory
const {
  getTotalTaxAmount,
  getFederalTaxAmount,
  getProvincialTaxAmount,
  getRate,
  TAX_BRACKETS,
  getTaxRates
} = require('../../../../dist/taxes/income-tax.js');

const { getCapitalGainsTaxableAmount } = require('../../../../dist/investments/non-registered-savings-plan.js');
const { CPP } = require('../../../../dist/pension/canada-pension-plan.js');
const { QPP } = require('../../../../dist/pension/quebec-pension-plan.js');
const { EI } = require('../../../../dist/taxes/employment-insurance.js');
const { ELIGIBLE_DIVIDEND, NON_ELIGIBLE_DIVIDEND } = require('../../../../dist/taxes/dividend-credit.js');
const { roundToPrecision } = require('../../../../dist/utils/math.js');

// Define ProvinceCode type locally
type ProvinceCode = 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';
import {
  IncomeTaxRequest,
  IncomeTaxResponse,
  CPPContributionRequest,
  CPPContributionResponse,
  EIContributionRequest,
  EIContributionResponse,
  DividendTaxRequest,
  DividendTaxResponse,
  CapitalGainsRequest,
  CapitalGainsResponse,
  TaxBracketsResponse,
  PensionLimitsResponse,
  ProvincesResponse
} from '../types';

export class TaxCalculationService {
  
  calculateIncomeTax(request: IncomeTaxRequest): IncomeTaxResponse {
    const { grossIncome, province, inflationRate = 0, yearsToInflate = 0 } = request;
    
    const federalTax = getFederalTaxAmount(province, grossIncome, inflationRate, yearsToInflate);
    const provincialTax = getProvincialTaxAmount(province, grossIncome, inflationRate, yearsToInflate);
    const totalTax = getTotalTaxAmount(province, grossIncome, inflationRate, yearsToInflate);
    
    const afterTaxIncome = grossIncome - totalTax;
    const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
    
    // Calculate marginal tax rate
    const federalRates = getTaxRates('CA');
    const provincialRates = getTaxRates(province);
    const federalMarginalRate = getRate(federalRates, grossIncome, inflationRate, yearsToInflate);
    const provincialMarginalRate = getRate(provincialRates, grossIncome, inflationRate, yearsToInflate);
    const marginalTaxRate = federalMarginalRate + provincialMarginalRate;
    
    return {
      grossIncome: roundToPrecision(grossIncome, 2),
      province,
      federalTax: roundToPrecision(federalTax, 2),
      provincialTax: roundToPrecision(provincialTax, 2),
      totalTax: roundToPrecision(totalTax, 2),
      afterTaxIncome: roundToPrecision(afterTaxIncome, 2),
      effectiveTaxRate: roundToPrecision(effectiveTaxRate, 4),
      marginalTaxRate: roundToPrecision(marginalTaxRate, 4)
    };
  }
  
  calculateCPPContribution(request: CPPContributionRequest): CPPContributionResponse {
    const { income, year = new Date().getFullYear() } = request;
    
    const pensionableEarnings = Math.max(0, Math.min(income, CPP.PENSIONABLE_EARNINGS.YMPE) - CPP.PENSIONABLE_EARNINGS.BASIC_EXEMPTION);
    const baseContribution = pensionableEarnings * CPP.CONTRIBUTION_RATES.BASE;
    
    // Enhanced CPP contribution for income above YMPE
    const enhancedPensionableEarnings = Math.max(0, Math.min(income, CPP.PENSIONABLE_EARNINGS.YAMPE) - CPP.PENSIONABLE_EARNINGS.YMPE);
    const enhancementContribution = enhancedPensionableEarnings * CPP.CONTRIBUTION_RATES.ENHANCEMENT_STEP_2;
    
    const totalContribution = baseContribution + enhancementContribution;
    
    return {
      income: roundToPrecision(income, 2),
      pensionableEarnings: roundToPrecision(pensionableEarnings, 2),
      baseContribution: roundToPrecision(baseContribution, 2),
      enhancementContribution: roundToPrecision(enhancementContribution, 2),
      totalContribution: roundToPrecision(totalContribution, 2),
      year
    };
  }
  
  calculateEIContribution(request: EIContributionRequest): EIContributionResponse {
    const { income, province, year = new Date().getFullYear() } = request;
    
    const insurableEarnings = Math.min(income, EI.MAX_INSURABLE_EARNINGS);
    const premiumRate = province === 'QC' ? EI.PREMIUM_RATES.QC : EI.PREMIUM_RATES.CA;
    const contribution = insurableEarnings * premiumRate;
    
    return {
      income: roundToPrecision(income, 2),
      province,
      insurableEarnings: roundToPrecision(insurableEarnings, 2),
      premiumRate: roundToPrecision(premiumRate, 6),
      contribution: roundToPrecision(contribution, 2),
      year
    };
  }
  
  calculateDividendTax(request: DividendTaxRequest): DividendTaxResponse {
    const { dividendAmount, isEligible, province } = request;
    
    const dividendRates = isEligible ? ELIGIBLE_DIVIDEND : NON_ELIGIBLE_DIVIDEND;
    const grossedUpDividend = dividendAmount * dividendRates.GROSS_UP;
    
    // Calculate tax credit
    const federalTaxCredit = grossedUpDividend * dividendRates.CA;
    const provincialTaxCredit = grossedUpDividend * dividendRates[province];
    const totalTaxCredit = federalTaxCredit + provincialTaxCredit;
    
    // For simplification, we'll use the lowest tax rate to calculate tax on grossed-up amount
    // In reality, this would depend on the individual's total income and tax bracket
    const federalRate = TAX_BRACKETS.CA.RATES[0].RATE;
    const provincialRate = TAX_BRACKETS[province].RATES[0].RATE;
    const combinedRate = federalRate + provincialRate;
    
    const taxOnGrossedUp = grossedUpDividend * combinedRate;
    const netTax = Math.max(0, taxOnGrossedUp - totalTaxCredit);
    const afterTaxDividend = dividendAmount - netTax;
    const effectiveTaxRate = dividendAmount > 0 ? netTax / dividendAmount : 0;
    
    return {
      originalDividend: roundToPrecision(dividendAmount, 2),
      grossedUpDividend: roundToPrecision(grossedUpDividend, 2),
      taxCredit: roundToPrecision(totalTaxCredit, 2),
      taxOnGrossedUp: roundToPrecision(taxOnGrossedUp, 2),
      netTax: roundToPrecision(netTax, 2),
      afterTaxDividend: roundToPrecision(afterTaxDividend, 2),
      effectiveTaxRate: roundToPrecision(effectiveTaxRate, 4)
    };
  }
  
  calculateCapitalGains(request: CapitalGainsRequest): CapitalGainsResponse {
    const { capitalGains, province } = request;
    
    const taxableCapitalGains = getCapitalGainsTaxableAmount(capitalGains);
    
    // Calculate tax on taxable capital gains using lowest tax bracket
    const federalRate = TAX_BRACKETS.CA.RATES[0].RATE;
    const provincialRate = TAX_BRACKETS[province].RATES[0].RATE;
    const combinedRate = federalRate + provincialRate;
    
    const taxOnCapitalGains = taxableCapitalGains * combinedRate;
    const afterTaxGains = capitalGains - taxOnCapitalGains;
    const effectiveTaxRate = capitalGains > 0 ? taxOnCapitalGains / capitalGains : 0;
    
    return {
      totalCapitalGains: roundToPrecision(capitalGains, 2),
      taxableCapitalGains: roundToPrecision(taxableCapitalGains, 2),
      taxOnCapitalGains: roundToPrecision(taxOnCapitalGains, 2),
      afterTaxGains: roundToPrecision(afterTaxGains, 2),
      effectiveTaxRate: roundToPrecision(effectiveTaxRate, 4)
    };
  }
}

export class DataService {
  
  getTaxBrackets(year: number, province: ProvinceCode): TaxBracketsResponse {
    const federalBracket = TAX_BRACKETS.CA;
    const provincialBracket = TAX_BRACKETS[province];
    
    return {
      year,
      province,
      federal: {
        rates: federalBracket.RATES.map((rate: any) => ({
          from: rate.FROM,
          to: rate.TO,
          rate: rate.RATE
        })),
        baseTaxCredit: federalBracket.BASE_TAX_CREDIT,
        taxCreditRate: federalBracket.TAX_CREDIT_RATE
      },
      provincial: {
        rates: provincialBracket.RATES.map((rate: any) => ({
          from: rate.FROM,
          to: rate.TO,
          rate: rate.RATE
        })),
        baseTaxCredit: provincialBracket.BASE_TAX_CREDIT,
        taxCreditRate: provincialBracket.TAX_CREDIT_RATE,
        abatement: provincialBracket.ABATEMENT
      }
    };
  }
  
  getPensionLimits(year: number): PensionLimitsResponse {
    return {
      year,
      cpp: {
        basicExemption: CPP.PENSIONABLE_EARNINGS.BASIC_EXEMPTION,
        ympe: CPP.PENSIONABLE_EARNINGS.YMPE,
        yampe: CPP.PENSIONABLE_EARNINGS.YAMPE,
        baseRate: CPP.CONTRIBUTION_RATES.BASE,
        enhancementRate: CPP.CONTRIBUTION_RATES.ENHANCEMENT_STEP_2
      },
      qpp: {
        basicExemption: QPP.PENSIONABLE_EARNINGS.BASIC_EXEMPTION,
        ympe: QPP.PENSIONABLE_EARNINGS.YMPE,
        yampe: QPP.PENSIONABLE_EARNINGS.YAMPE,
        baseRate: QPP.CONTRIBUTION_RATES.BASE,
        enhancementRate: QPP.CONTRIBUTION_RATES.ENHANCEMENT_STEP_2
      },
      ei: {
        maxInsurableEarnings: EI.MAX_INSURABLE_EARNINGS,
        premiumRates: {
          ca: EI.PREMIUM_RATES.CA,
          qc: EI.PREMIUM_RATES.QC
        }
      }
    };
  }
  
  getProvinces(): ProvincesResponse {
    const provinceNames = {
      AB: 'Alberta',
      BC: 'British Columbia',
      MB: 'Manitoba',
      NB: 'New Brunswick',
      NL: 'Newfoundland and Labrador',
      NS: 'Nova Scotia',
      NT: 'Northwest Territories',
      NU: 'Nunavut',
      ON: 'Ontario',
      PE: 'Prince Edward Island',
      QC: 'Quebec',
      SK: 'Saskatchewan',
      YT: 'Yukon'
    };
    
    return {
      provinces: Object.entries(provinceNames).map(([code, name]) => ({
        code: code as ProvinceCode,
        name
      }))
    };
  }
}