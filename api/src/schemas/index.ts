export const incomeTaxRequestSchema = {
  type: 'object',
  properties: {
    grossIncome: {
      type: 'number',
      minimum: 0,
      maximum: 10000000
    },
    province: {
      type: 'string',
      enum: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
    },
    year: {
      type: 'number',
      minimum: 2000,
      maximum: 2030,
      default: new Date().getFullYear()
    },
    inflationRate: {
      type: 'number',
      minimum: -0.1,
      maximum: 0.3,
      default: 0
    },
    yearsToInflate: {
      type: 'number',
      minimum: 0,
      maximum: 50,
      default: 0
    }
  },
  required: ['grossIncome', 'province'],
  additionalProperties: false
};

export const cppContributionRequestSchema = {
  type: 'object',
  properties: {
    income: {
      type: 'number',
      minimum: 0,
      maximum: 10000000
    },
    year: {
      type: 'number',
      minimum: 2000,
      maximum: 2030,
      default: new Date().getFullYear()
    }
  },
  required: ['income'],
  additionalProperties: false
};

export const eiContributionRequestSchema = {
  type: 'object',
  properties: {
    income: {
      type: 'number',
      minimum: 0,
      maximum: 10000000
    },
    province: {
      type: 'string',
      enum: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
    },
    year: {
      type: 'number',
      minimum: 2000,
      maximum: 2030,
      default: new Date().getFullYear()
    }
  },
  required: ['income', 'province'],
  additionalProperties: false
};

export const dividendTaxRequestSchema = {
  type: 'object',
  properties: {
    dividendAmount: {
      type: 'number',
      minimum: 0,
      maximum: 10000000
    },
    isEligible: {
      type: 'boolean'
    },
    province: {
      type: 'string',
      enum: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
    },
    year: {
      type: 'number',
      minimum: 2000,
      maximum: 2030,
      default: new Date().getFullYear()
    }
  },
  required: ['dividendAmount', 'isEligible', 'province'],
  additionalProperties: false
};

export const capitalGainsRequestSchema = {
  type: 'object',
  properties: {
    capitalGains: {
      type: 'number',
      minimum: 0,
      maximum: 10000000
    },
    province: {
      type: 'string',
      enum: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
    },
    year: {
      type: 'number',
      minimum: 2000,
      maximum: 2030,
      default: new Date().getFullYear()
    }
  },
  required: ['capitalGains', 'province'],
  additionalProperties: false
};