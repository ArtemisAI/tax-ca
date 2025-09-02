# Integration Tests

This directory contains integration tests that verify the interaction between different modules of the tax-ca library.

## Test Categories

### Cross-Module Integration
- **Tax and Pension Integration**: How pension contributions affect taxable income
- **Investment and Tax Integration**: RRSP contributions, TFSA limits, tax impacts
- **Provincial Variations**: How different provinces handle the same scenarios

### End-to-End Calculations
- **Complete Tax Return**: Full tax calculation from gross income to final tax owing
- **Retirement Planning**: Integration of pension, OAS, RRIF, and tax calculations
- **Investment Strategy**: Tax-efficient investment allocation across account types

### Data Consistency
- **Cross-Reference Validation**: Ensure data consistency across related modules
- **Year-over-Year Validation**: Verify calculations work across different tax years
- **Inflation Adjustments**: Test inflation-adjusted calculations