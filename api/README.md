# Canadian Tax Calculation API

## Overview

The Canadian Tax Calculation API provides RESTful endpoints for calculating various Canadian tax obligations and accessing tax-related data. Built with Express.js and TypeScript, it offers comprehensive tax calculations with robust validation, authentication, and rate limiting.

## Features

- ✅ **Income Tax Calculations**: Federal and provincial tax calculations for all Canadian provinces
- ✅ **CPP Contributions**: Canada Pension Plan contribution calculations
- ✅ **EI Contributions**: Employment Insurance contribution calculations  
- ✅ **Dividend Tax**: Tax calculations for eligible and non-eligible dividends
- ✅ **Capital Gains**: Capital gains tax calculations
- ✅ **Tax Data Access**: Access to tax brackets, pension limits, and province information
- ✅ **Input Validation**: AJV JSON schema validation for all endpoints
- ✅ **API Key Authentication**: Secure access with API key validation
- ✅ **Rate Limiting**: Protection against abuse with configurable limits
- ✅ **OpenAPI Documentation**: Interactive Swagger UI documentation
- ✅ **Comprehensive Testing**: Full test suite with supertest integration tests

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Build the main library:
```bash
yarn build
```

3. Start the API server:
```bash
yarn start:api
```

The server will start on port 3000 by default. You can access:
- API Documentation: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health
- OpenAPI Spec: http://localhost:3000/api/docs.json

### Environment Variables

```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=development         # Environment (development/production/test)
VALID_API_KEYS=key1,key2,key3  # Comma-separated list of valid API keys
```

## API Endpoints

### Authentication

All API endpoints (except `/health` and `/api/docs`) require an API key in the `X-API-Key` header.

```bash
curl -H "X-API-Key: demo-key-123" http://localhost:3000/api/data/provinces
```

### Calculation Endpoints

#### POST /api/calculate/income-tax
Calculate federal and provincial income tax.

```json
{
  "grossIncome": 75000,
  "province": "ON",
  "year": 2025,
  "inflationRate": 0.02,
  "yearsToInflate": 0
}
```

#### POST /api/calculate/cpp-contributions
Calculate CPP contributions.

```json
{
  "income": 75000,
  "year": 2025
}
```

#### POST /api/calculate/ei-contributions  
Calculate EI contributions.

```json
{
  "income": 75000,
  "province": "ON",
  "year": 2025
}
```

#### POST /api/calculate/dividend-tax
Calculate dividend tax.

```json
{
  "dividendAmount": 5000,
  "isEligible": true,
  "province": "ON",
  "year": 2025
}
```

#### POST /api/calculate/capital-gains
Calculate capital gains tax.

```json
{
  "capitalGains": 10000,
  "province": "ON",
  "year": 2025
}
```

### Data Endpoints

#### GET /api/data/tax-brackets/:year/:province
Get tax brackets for a specific year and province.

Example: `GET /api/data/tax-brackets/2025/ON`

#### GET /api/data/pension-limits/:year
Get pension limits for a specific year.

Example: `GET /api/data/pension-limits/2025`

#### GET /api/data/provinces
Get list of Canadian provinces and territories.

## Rate Limiting

- General endpoints: 100 requests per 15 minutes per IP
- Calculation endpoints: 30 requests per minute per IP

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `MISSING_API_KEY`: API key not provided
- `INVALID_API_KEY`: Invalid API key
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `NOT_FOUND`: Endpoint not found
- `INTERNAL_ERROR`: Server error

## Development

### Building

```bash
# Build main library
yarn build

# Build API
yarn build:api
```

### Testing

```bash
# Run all tests
yarn test

# Run API tests only
yarn test:api

# Run tests in CI mode
yarn test:ci
```

### Linting

```bash
yarn eslint
```

## API Architecture

```
api/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, validation, rate limiting
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── schemas/         # JSON validation schemas
│   ├── types/           # TypeScript type definitions
│   ├── docs/            # OpenAPI documentation
│   └── server.ts        # Express server setup
├── dist/                # Compiled JavaScript
└── tsconfig.json        # TypeScript configuration
```

## Security

- **API Key Authentication**: All endpoints require valid API keys
- **Input Validation**: Comprehensive validation using AJV schemas
- **Rate Limiting**: Protection against abuse and DoS attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for protection

## Monitoring

The API includes:
- Health check endpoint for monitoring
- Structured error logging
- Request/response logging (in development)
- Rate limit headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the LGPL-3.0-only License.