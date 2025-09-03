# API Testing Suite

This directory contains comprehensive API tests for the tax-ca library, focusing on testing all public interfaces and ensuring 100% test coverage.

## Test Structure

```
tests/api/
├── unit/              # Unit tests for individual modules
├── security/          # Security tests for authentication and authorization
├── contract/          # Contract tests for API schema compliance
├── fixtures/          # Mock data and test fixtures
└── helpers/           # Testing utilities and helper functions
```

## Test Categories

### Unit Tests (`unit/`)
- Individual module testing for uncovered areas
- Edge case testing
- Error handling validation

### Security Tests (`security/`)
- Authentication mechanism testing
- Authorization validation
- Vulnerability protection tests
- Input sanitization

### Contract Tests (`contract/`)
- API schema compliance
- Data type validation
- Response format verification

### Fixtures (`fixtures/`)
- Mock user personas
- Tax scenario data
- Test data generators

### Helpers (`helpers/`)
- Common testing utilities
- Data validation functions
- Performance measurement tools

## Coverage Goals

- Target: 100% code coverage
- Current baseline: 86.1%
- Focus areas: pension, taxes, and investment modules with 0% coverage

## Performance Targets

- Response time: < 500ms
- Throughput: > 1000 requests/minute
- Memory efficiency: < 100MB for typical scenarios