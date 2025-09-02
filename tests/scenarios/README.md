# Tax Scenario Tests

This directory contains real-world tax scenario tests that validate the tax-ca library against realistic Canadian tax situations.

## Scenario Categories

### Individual Scenarios
- **Young Professional**: Recent graduate, single, entry-level income
- **Mid-Career Professional**: Established career, moderate income, some investments
- **High Earner**: Senior professional or business owner, high income bracket
- **Retiree**: Pension income, RRIF withdrawals, OAS/CPP benefits

### Family Scenarios  
- **Young Family**: Couple with young children, childcare expenses, child benefits
- **Established Family**: Couple with teenage children, higher income, education savings
- **Single Parent**: Single income, children, various tax credits

### Provincial Scenarios
- **Ontario Resident**: Provincial tax rates, credits, and benefits
- **Quebec Resident**: Different tax structure, QPP vs CPP, unique credits
- **Alberta Resident**: No provincial tax, different benefit structures
- **British Columbia Resident**: MSP premiums, provincial credits

## Test Structure

Each scenario test includes:
- Demographic and income information
- Expected tax calculations
- Validation against CRA tax calculators
- Edge cases and boundary conditions

## Target Accuracy
- 95%+ accuracy compared to official CRA calculators
- All calculations validated for current tax year
- Regular updates for tax law changes