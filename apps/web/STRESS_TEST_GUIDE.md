# TripWeaver Stress Test Suite

## Overview

The TripWeaver Stress Test Suite is a comprehensive validation tool that tests the AI integration and personalization engine across diverse real-world scenarios. It validates geographic diversity, preference extremes, API failure resilience, performance benchmarks, and concurrent load handling.

## 🧪 Test Categories

### 1. Geographic Diversity Test
**Purpose**: Validates that recommendations are appropriate for different geographic contexts.

**Test Scenarios**:
- **Dense City (Tokyo)**: Tests urban environment with high activity density
- **Coastal Town (Santorini)**: Tests beach/resort destinations
- **Mountainous Region (Banff)**: Tests outdoor/adventure destinations
- **Historical European City (Prague)**: Tests cultural/historical destinations
- **Sprawling Suburban Area (Orlando)**: Tests family/entertainment destinations

**Validation Criteria**:
- Geographic appropriateness score > 30%
- Presence of location-specific activities
- ML-powered data availability

### 2. Preference Extreme Test
**Purpose**: Validates personalization engine with extreme user profiles.

**Test Profiles**:
- **Ultra Budget Traveler**: $10/day budget, free/local interests
- **Luxury Traveler**: High budget, luxury/fine dining interests
- **Adventure Sports Enthusiast**: Adventure/hiking interests, fast pace
- **Family with Young Children**: Family/educational interests, moderate pace

**Validation Criteria**:
- Preference adherence score > 20%
- Budget appropriateness
- Category relevance

### 3. API Failure Resilience Test
**Purpose**: Validates graceful handling of API failures and edge cases.

**Test Scenarios**:
- Invalid API keys
- Network timeouts
- Rate limiting
- Invalid location data
- Malformed request data

**Validation Criteria**:
- Graceful error handling
- Fallback mechanisms
- No system crashes
- Appropriate error messages

### 4. Performance Benchmark Test
**Purpose**: Validates system performance under normal load.

**Test Scenarios**:
- Simple itinerary (3 days, basic preferences)
- Complex itinerary (6 days, multiple interests)
- ML-enhanced itinerary (with learning enabled)

**Validation Criteria**:
- Response time < 3 seconds
- Average performance < 2 seconds
- Maximum performance < 5 seconds

### 5. Concurrent Load Test
**Purpose**: Validates system stability under concurrent load.

**Test Parameters**:
- 10 concurrent requests
- Mixed destinations and preferences
- 30-second timeout per request

**Validation Criteria**:
- Success rate > 80%
- No resource exhaustion
- Consistent response times

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- TripWeaver application running
- Database migrations applied
- ML dependencies installed

### Setup
```bash
# Run the setup script
./setup_stress_test.sh

# Or manually install dependencies
pip3 install -r stress_test_requirements.txt
```

### Running Tests
```bash
# Run all tests against localhost
python3 stress_test.py

# Run against custom URL
python3 stress_test.py http://your-app-url:3000

# Run individual test
python3 -c "
import asyncio
from stress_test import StressTestSuite

async def run_single_test():
    suite = StressTestSuite()
    result = await suite.test_geographic_diversity()
    print(f'Test result: {result.status}')

asyncio.run(run_single_test())
"
```

## 📊 Test Results

### Report Format
The test suite generates a comprehensive JSON report with:

```json
{
  "summary": {
    "total_tests": 5,
    "passed": 4,
    "failed": 1,
    "errors": 0,
    "success_rate": 0.8,
    "total_duration": 45.23,
    "avg_duration": 9.05
  },
  "results": [
    {
      "test_name": "Geographic Diversity Test",
      "status": "PASS",
      "duration": 12.34,
      "details": "All scenarios tested successfully",
      "errors": [],
      "metrics": {"scenarios_tested": 5}
    }
  ],
  "performance_metrics": {
    "Performance Benchmark Test": {
      "avg_duration": 1.85,
      "max_duration": 2.34,
      "min_duration": 1.23
    }
  },
  "recommendations": [
    "System is performing well across all test scenarios"
  ]
}
```

### Success Criteria
- **Overall Success Rate**: ≥ 80%
- **Performance**: Average < 2s, Maximum < 5s
- **Geographic Appropriateness**: ≥ 30% for each scenario
- **Preference Adherence**: ≥ 20% for extreme profiles
- **Concurrent Load**: ≥ 80% success rate

## 🔧 Configuration

### Environment Variables
```bash
# Python path for ML engine
export PYTHON_PATH=python3

# API timeout settings
export API_TIMEOUT=30

# Test parameters
export CONCURRENT_REQUESTS=10
export PERFORMANCE_THRESHOLD=3.0
```

### Custom Test Data
You can modify test scenarios in the `StressTestSuite` class:

```python
# Add new geographic scenario
self.geographic_scenarios.append({
    "name": "Desert Region - Dubai",
    "destination": "Dubai, UAE",
    "expected_activities": ["desert", "luxury", "shopping", "modern"]
})

# Add new preference profile
self.extreme_preferences.append({
    "name": "Digital Nomad",
    "preferences": {
        "budget": 2,
        "interests": ["coworking", "cafe", "wifi"],
        "pace": "relaxed"
    }
})
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Errors
```bash
# Check if application is running
curl http://localhost:3000/api/health

# Check network connectivity
ping localhost
```

#### 2. Python Dependencies
```bash
# Install missing dependencies
pip3 install requests asyncio aiohttp

# Check ML dependencies
python3 -c "import numpy, pandas, sklearn; print('ML deps OK')"
```

#### 3. Database Issues
```bash
# Run migrations
npx prisma migrate dev
npx prisma generate

# Check database file
ls -la prisma/dev.db
```

#### 4. Performance Issues
```bash
# Check system resources
top
free -h
df -h

# Monitor application logs
tail -f logs/app.log
```

### Debug Mode
Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Run with debug output
python3 stress_test.py 2>&1 | tee debug.log
```

## 📈 Performance Monitoring

### Key Metrics
- **Response Time**: Time to generate itinerary
- **Success Rate**: Percentage of successful requests
- **Error Rate**: Percentage of failed requests
- **Resource Usage**: CPU, memory, database connections

### Monitoring Script
```bash
#!/bin/bash
# Monitor performance during stress test

while true; do
    echo "$(date): $(curl -s -w '%{time_total}' http://localhost:3000/api/health -o /dev/null)s"
    sleep 5
done
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Stress Test
on: [push, pull_request]

jobs:
  stress-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          pip install -r stress_test_requirements.txt
      - name: Start application
        run: npm run dev &
      - name: Wait for app
        run: sleep 30
      - name: Run stress tests
        run: python3 stress_test.py
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: stress-test-results
          path: stress_test_report_*.json
```

## 📋 Test Maintenance

### Regular Updates
- **Monthly**: Update test scenarios with new destinations
- **Quarterly**: Review and adjust performance thresholds
- **Annually**: Comprehensive test suite review

### Adding New Tests
1. Create test method in `StressTestSuite`
2. Add test to `run_all_tests()` method
3. Update documentation
4. Add to CI pipeline

### Test Data Management
```python
# Export test data for analysis
import json
with open('test_data_export.json', 'w') as f:
    json.dump(test_results, f, indent=2)

# Import historical data
with open('historical_results.json', 'r') as f:
    historical_data = json.load(f)
```

## 🎯 Best Practices

### Test Execution
1. **Run in isolation**: Ensure no other load on system
2. **Monitor resources**: Watch CPU, memory, database
3. **Document environment**: Note system specs, versions
4. **Save results**: Archive reports for comparison

### Result Analysis
1. **Trend analysis**: Compare with historical results
2. **Performance regression**: Identify performance degradation
3. **Error patterns**: Look for recurring issues
4. **Recommendations**: Implement suggested improvements

### System Optimization
1. **Database indexing**: Optimize slow queries
2. **Caching**: Implement appropriate caching strategies
3. **Resource scaling**: Add resources for high load
4. **Code optimization**: Profile and optimize bottlenecks

---

**🎉 The stress test suite provides comprehensive validation of TripWeaver's AI integration, ensuring robust performance across diverse real-world scenarios!**
