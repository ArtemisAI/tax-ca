# tax-ca Documentation

## Overview

tax-ca is a TypeScript library providing up-to-date Canadian federal and provincial tax data, calculation functions, and pension/investment account rules. It is designed to be a single source of truth for tax-related logic across applications.

## Main Features
- Provincial and federal tax brackets and rates
- Dividend tax credit rates (eligible and non-eligible)
- Employment insurance and Quebec parental insurance plan data
- Pension plan rules (CPP, OAS, QPP, etc.)
- Registered investment account rules (TFSA, RRSP, LIF, etc.)
- Utility functions for calculations

## Modules
- **INVESTMENTS**: LifeIncomeFund, RegisteredRetirementIncomeFund, RegisteredRetirementSavingsPlan, TaxFreeSavingsAccount, NonRegisteredSavingsPlan, RegisteredEducationSavingsPlan
- **PENSION**: CanadaPensionPlan, OldAgeSecurity, PublicPensionPlan, QuebecPensionPlan, SupplementalPensionPlan
- **TAXES**: DividendCredit, EmploymentInsurance, IncomeTax, QuebecParentalInsurancePlan
- **MISC**: ConsumerPriceIndex, IPFStats, LifeExpectancy, CodeTypes

## Installation
```sh
npm install @equisoft/tax-ca --save
# or
yarn add @equisoft/tax-ca
```

## Usage Example
```typescript
import { TAXES, PENSION, INVESTMENTS } from '@equisoft/tax-ca';

const { IncomeTax, DividendCredit } = TAXES;
const { CPP, OAS } = PENSION;
const { TFSA, RRSP } = INVESTMENTS;

console.log(IncomeTax.TAX_BRACKETS);
console.log(CPP.PENSIONABLE_EARNINGS);
```

## Development & Contribution
- Maintained by Equisoft/plan product team (Quebec City, QC, Canada)
- Follows inner source practices
- Contributions and feature requests are welcome via issues and pull requests

## Release & CI/CD
- Built and released via GitHub Actions
- Security scanning via CodeQL
- See `.github/workflows/` for build and security automation

## License
LGPL-3.0-only

---
For detailed API documentation, see the source files in `src/`.
