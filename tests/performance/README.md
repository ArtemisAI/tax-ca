# Performance Tests

This directory contains performance tests to ensure the tax-ca library maintains efficient calculation times under various load conditions.

## Test Categories

### Calculation Performance
- **Single Calculation Speed**: Time for individual tax calculations
- **Bulk Calculations**: Performance with multiple scenarios
- **Memory Usage**: Memory efficiency during calculations

### Stress Testing
- **High-Volume Processing**: Processing thousands of tax scenarios
- **Complex Scenarios**: Performance with maximum complexity scenarios
- **Concurrent Usage**: Multi-threaded calculation performance

## Performance Targets
- Single tax calculation: < 10ms
- 1000 bulk calculations: < 1 second
- Memory usage: < 100MB for typical scenarios
- No memory leaks during extended use