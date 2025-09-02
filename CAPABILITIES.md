# Tax-CA Library Capabilities Documentation

## Overview

The `tax-ca` library is a comprehensive TypeScript library for Canadian tax calculations, providing up-to-date federal and provincial tax data, pension calculations, and investment account rules. This document details the current capabilities and provides practical usage examples.

## Current Version: 2025 Tax Year Data

The library contains tax data and calculation functions for the 2025 tax year, with historical data going back to 1998 for certain values.

## Core Modules

### 1. TAXES Module (`src/taxes/`)

#### Income Tax Calculations (`income-tax.ts`)

**Key Functions:**
- `getFederalTaxAmount(province, income, inflationRate, yearsToInflate, taxCredit)` - Calculate federal income tax
- `getProvincialTaxAmount(province, income, inflationRate, yearsToInflate, taxCredit)` - Calculate provincial income tax
- `getTotalTaxAmount(province, income, inflationRate, yearsToInflate, federalCredit, provincialCredit)` - Combined tax calculation
- `getFederalMarginalRate(province, income, inflationRate, yearsToInflate)` - Marginal tax rates
- `getEffectiveRate(province, income, inflationRate, yearsToInflate, federalCredit, provincialCredit)` - Effective tax rates

**Example Usage:**
```typescript
import { getFederalTaxAmount, getProvincialTaxAmount } from '@equisoft/tax-ca';

// Calculate tax for $75,000 income in Ontario
const federalTax = getFederalTaxAmount('ON', 75000, 0.021, 0, 1000);
const provincialTax = getProvincialTaxAmount('ON', 75000, 0.021, 0, 500);
const totalTax = federalTax + provincialTax;

console.log(`Federal Tax: $${federalTax.toFixed(2)}`);
console.log(`Provincial Tax: $${provincialTax.toFixed(2)}`);
console.log(`Total Tax: $${totalTax.toFixed(2)}`);
```

**Supported Provinces:**
- ✅ Ontario (ON)
- ✅ Quebec (QC) - includes federal abatement
- ✅ British Columbia (BC)
- ✅ Alberta (AB)
- ✅ Manitoba (MB)
- ✅ Saskatchewan (SK)
- ✅ New Brunswick (NB)
- ✅ Nova Scotia (NS)
- ✅ Prince Edward Island (PE)
- ✅ Newfoundland and Labrador (NL)
- ✅ Northwest Territories (NT)
- ✅ Nunavut (NU)
- ✅ Yukon (YT)

#### Additional Tax Modules
- `dividend-credit.ts` - Dividend tax credit calculations
- `employment-insurance.ts` - EI premium calculations
- `quebec-parental-insurance-plan.ts` - QPIP calculations

### 2. PENSION Module (`src/pension/`)

#### Canada Pension Plan (`canada-pension-plan.ts`)

**Key Data:**
- YMPE (Year's Maximum Pensionable Earnings): $71,300 (2025)
- Basic Exemption: $3,500
- Contribution Rate: 5.95% (base) + 4.0% (enhancement)
- Maximum Pension: $17,196 (retirement at 65)

**Example Usage:**
```typescript
import { CPP } from '@equisoft/tax-ca';

const income = 80000;
const basicExemption = CPP.PENSIONABLE_EARNINGS.BASIC_EXEMPTION;
const ympe = CPP.PENSIONABLE_EARNINGS.YMPE;
const contributionRate = CPP.CONTRIBUTION_RATES.BASE;

const pensionableEarnings = Math.min(
    Math.max(income - basicExemption, 0),
    ympe - basicExemption
);

const cppContribution = pensionableEarnings * contributionRate;
console.log(`CPP Contribution: $${cppContribution.toFixed(2)}`);
```

#### Old Age Security (`old-age-security.ts`)

**Key Data:**
- Maximum Monthly Payment: $734.95 (2025)
- Minimum Age: 65
- Maximum Age: 70
- Clawback Threshold: $93,454 (approximate)
- Clawback Rate: 15%

**Example Usage:**
```typescript
import { OAS } from '@equisoft/tax-ca';

const income = 100000;
const oasRepaymentMin = OAS.REPAYMENT.MIN;
const oasRepaymentRate = OAS.REPAYMENT.RATIO;

if (income > oasRepaymentMin) {
    const excessIncome = income - oasRepaymentMin;
    const clawback = excessIncome * oasRepaymentRate;
    console.log(`OAS Clawback: $${clawback.toFixed(2)}`);
}
```

### 3. INVESTMENTS Module (`src/investments/`)

#### Tax-Free Savings Account (`tax-free-savings-account.ts`)

**Key Data:**
- Annual Contribution Limit: $7,000 (2025)
- Unrounded Limit: $6,893
- Rounding Factor: $500

#### Registered Retirement Savings Plan (`registered-retirement-savings-plan.ts`)

**Key Data:**
- Maximum Contribution: $32,490 (2025)
- Contribution Rate: 18% of earned income
- Conversion Age Range: 0-71 years

#### Other Investment Accounts
- `life-income-fund.ts` - LIF rules and calculations
- `locked-in-retirement-account.ts` - LIRA rules
- `registered-retirement-income-fund.ts` - RRIF calculations
- `registered-education-savings-plan/` - RESP, grants, and bonds

### 4. MISC Module (`src/misc/`)

#### Supporting Data
- `consumer-price-index.ts` - CPI data for inflation adjustments
- `ipf-stats.ts` - IPF statistics
- `life-expectancy.ts` - Life expectancy tables
- `code-types.ts` - Province and territory code definitions

## Real-World Usage Examples

### Example 1: Complete Tax Calculation for Working Professional

```typescript
import { 
    getFederalTaxAmount, 
    getProvincialTaxAmount,
    CPP,
    RRSP,
    TFSA 
} from '@equisoft/tax-ca';

const taxpayer = {
    grossIncome: 85000,
    province: 'ON' as ProvinceCode,
    rrspContribution: 10000,
    tfsaContribution: 6500,
};

// Calculate CPP contribution
const ympe = CPP.PENSIONABLE_EARNINGS.YMPE;
const basicExemption = CPP.PENSIONABLE_EARNINGS.BASIC_EXEMPTION;
const contributionRate = CPP.CONTRIBUTION_RATES.BASE;

const pensionableEarnings = Math.min(
    Math.max(taxpayer.grossIncome - basicExemption, 0),
    ympe - basicExemption
);
const cppContribution = pensionableEarnings * contributionRate;

// Calculate taxable income after RRSP deduction
const taxableIncome = taxpayer.grossIncome - taxpayer.rrspContribution;

// Calculate taxes
const federalTax = getFederalTaxAmount(taxpayer.province, taxableIncome, 0.021, 0, 0);
const provincialTax = getProvincialTaxAmount(taxpayer.province, taxableIncome, 0.021, 0, 0);

const totalTax = federalTax + provincialTax;
const afterTaxIncome = taxableIncome - totalTax;

console.log('=== Tax Calculation Summary ===');
console.log(`Gross Income: $${taxpayer.grossIncome.toLocaleString()}`);
console.log(`RRSP Contribution: $${taxpayer.rrspContribution.toLocaleString()}`);
console.log(`CPP Contribution: $${cppContribution.toFixed(2)}`);
console.log(`Taxable Income: $${taxableIncome.toLocaleString()}`);
console.log(`Federal Tax: $${federalTax.toFixed(2)}`);
console.log(`Provincial Tax: $${provincialTax.toFixed(2)}`);
console.log(`Total Tax: $${totalTax.toFixed(2)}`);
console.log(`After-Tax Income: $${afterTaxIncome.toFixed(2)}`);
console.log(`Effective Tax Rate: ${((totalTax / taxableIncome) * 100).toFixed(1)}%`);
```

### Example 2: Retirement Planning Scenario

```typescript
import { OAS, CPP } from '@equisoft/tax-ca';

const retiree = {
    age: 68,
    pensionIncome: 35000,
    rrifWithdrawal: 25000,
    investmentIncome: 5000,
    province: 'ON' as ProvinceCode,
};

const totalIncome = retiree.pensionIncome + retiree.rrifWithdrawal + retiree.investmentIncome;

// Calculate OAS and CPP benefits
const maxOAS = OAS.MONTHLY_PAYMENT_MAX * 12; // Annual OAS
const maxCPP = CPP.MAX_PENSION.RETIREMENT; // Annual CPP

// Check for OAS clawback
let oasClawback = 0;
if (totalIncome > OAS.REPAYMENT.MIN) {
    const excessIncome = totalIncome - OAS.REPAYMENT.MIN;
    oasClawback = Math.min(excessIncome * OAS.REPAYMENT.RATIO, maxOAS);
}

const netOAS = maxOAS - oasClawback;
const totalIncomeWithBenefits = totalIncome + netOAS + maxCPP;

console.log('=== Retirement Income Summary ===');
console.log(`Pension Income: $${retiree.pensionIncome.toLocaleString()}`);
console.log(`RRIF Withdrawal: $${retiree.rrifWithdrawal.toLocaleString()}`);
console.log(`Investment Income: $${retiree.investmentIncome.toLocaleString()}`);
console.log(`OAS Benefit (before clawback): $${maxOAS.toFixed(2)}`);
console.log(`OAS Clawback: $${oasClawback.toFixed(2)}`);
console.log(`Net OAS Benefit: $${netOAS.toFixed(2)}`);
console.log(`CPP Benefit: $${maxCPP.toFixed(2)}`);
console.log(`Total Retirement Income: $${totalIncomeWithBenefits.toFixed(2)}`);
```

### Example 3: Family Tax Optimization

```typescript
import { getFederalTaxAmount, getProvincialTaxAmount, CPP } from '@equisoft/tax-ca';

const family = {
    spouse1Income: 75000,
    spouse2Income: 45000,
    province: 'ON' as ProvinceCode,
    rrspRoom: 15000,
};

// Calculate optimal RRSP allocation to minimize total tax
const scenarios = [
    { s1Rrsp: 10000, s2Rrsp: 5000 },  // Higher earner gets more
    { s1Rrsp: 7500, s2Rrsp: 7500 },   // Equal split
    { s1Rrsp: 5000, s2Rrsp: 10000 },  // Lower earner gets more
];

scenarios.forEach((scenario, index) => {
    const s1TaxableIncome = family.spouse1Income - scenario.s1Rrsp;
    const s2TaxableIncome = family.spouse2Income - scenario.s2Rrsp;
    
    const s1FederalTax = getFederalTaxAmount(family.province, s1TaxableIncome, 0.021, 0, 0);
    const s1ProvincialTax = getProvincialTaxAmount(family.province, s1TaxableIncome, 0.021, 0, 0);
    
    const s2FederalTax = getFederalTaxAmount(family.province, s2TaxableIncome, 0.021, 0, 0);
    const s2ProvincialTax = getProvincialTaxAmount(family.province, s2TaxableIncome, 0.021, 0, 0);
    
    const totalTax = s1FederalTax + s1ProvincialTax + s2FederalTax + s2ProvincialTax;
    
    console.log(`=== Scenario ${index + 1} ===`);
    console.log(`RRSP Split: Spouse 1: $${scenario.s1Rrsp}, Spouse 2: $${scenario.s2Rrsp}`);
    console.log(`Total Family Tax: $${totalTax.toFixed(2)}`);
});
```

## Testing and Validation

The library includes comprehensive testing with 153+ tests covering:

- **Unit Tests**: Individual function validation
- **Scenario Tests**: Real-world taxpayer scenarios
- **Integration Tests**: Cross-module functionality
- **Performance Tests**: Speed and memory efficiency

**Test Coverage**: 86.1% statement coverage

## Data Currency and Accuracy

- **Tax Year**: 2025 data
- **Update Frequency**: Annual updates for new tax years
- **Sources**: Official CRA publications and provincial tax authorities
- **Validation**: Compared against official tax calculators
- **Target Accuracy**: 95%+ compared to CRA calculations

## Advanced Features

### Inflation Adjustments
All calculation functions support inflation rate parameters for future-year projections:

```typescript
const futureIncome = 75000;
const inflationRate = 0.025; // 2.5% annual inflation
const yearsInFuture = 5;

const futureTax = getFederalTaxAmount('ON', futureIncome, inflationRate, yearsInFuture, 0);
```

### Historical Data Access
The library maintains historical data for key values:

```typescript
// CPP YMPE history is available from 1998-2025
const ympeHistory = CPP.PENSIONABLE_EARNINGS.YMPE_HISTORY;
console.log(`2020 YMPE: $${ympeHistory[2020]}`);
```

## Limitations and Considerations

### Current Limitations
- No support for complex trust calculations
- Limited international income tax scenarios
- No capital gains/losses calculations
- No alternative minimum tax (AMT) calculations

### Future Development
- Business income calculations
- Capital gains integration
- Enhanced family benefit calculations
- Multi-year tax planning scenarios

## Support and Maintenance

The library is actively maintained by the Equisoft/plan product team with:
- Annual tax data updates
- Quarterly validation reviews
- Community contributions welcome
- GitHub issues for bug reports and feature requests

For detailed API documentation, see the TypeScript definitions in the source code.