# TripWeaver Stress Test - Quick Reference

## 🚀 Quick Start

```bash
# 1. Setup environment
./setup_stress_test.sh

# 2. Run demo (sample data)
python3 demo_stress_test.py

# 3. Run full test suite
python3 stress_test.py

# 4. Run with custom URL
python3 stress_test.py http://your-app-url:3000
```

## 🧪 Test Categories

| Test | Purpose | Success Criteria |
|------|---------|------------------|
| **Geographic Diversity** | Validates location-appropriate recommendations | ≥30% appropriateness |
| **Preference Extremes** | Tests personalization with extreme profiles | ≥20% adherence |
| **API Failure Resilience** | Ensures graceful error handling | No crashes, proper fallbacks |
| **Performance Benchmark** | Validates response times | <3s per request, <2s average |
| **Concurrent Load** | Tests system under load | ≥80% success rate |

## 📊 Sample Commands

```bash
# Run individual test
python3 -c "
import asyncio
from stress_test import StressTestSuite
async def test():
    suite = StressTestSuite()
    result = await suite.test_geographic_diversity()
    print(f'Result: {result.status}')
asyncio.run(test())
"

# Check application health
curl http://localhost:3000/api/health

# Monitor performance
while true; do
    echo "$(date): $(curl -s -w '%{time_total}' http://localhost:3000/api/health -o /dev/null)s"
    sleep 5
done
```

## 📁 Key Files

- `stress_test.py` - Main test suite
- `demo_stress_test.py` - Demo with sample data
- `setup_stress_test.sh` - Environment setup
- `STRESS_TEST_GUIDE.md` - Full documentation
- `stress_test_report_*.json` - Generated reports

## 🎯 Success Metrics

- **Overall Success Rate**: ≥80%
- **Response Time**: <3 seconds
- **Geographic Appropriateness**: ≥30%
- **Preference Adherence**: ≥20%
- **Concurrent Load**: ≥80% success

## 🔧 Troubleshooting

```bash
# Install dependencies
pip3 install requests

# Check Python version
python3 --version

# Verify application is running
curl http://localhost:3000/api/health

# Run with debug logging
python3 stress_test.py 2>&1 | tee debug.log
```

## 📈 Report Analysis

```bash
# View latest report
ls -la stress_test_report_*.json | tail -1

# Parse results
python3 -c "
import json
with open('stress_test_report_20250822_165722.json') as f:
    data = json.load(f)
    print(f'Success Rate: {data[\"summary\"][\"success_rate\"]:.1%}')
    print(f'Average Duration: {data[\"summary\"][\"avg_duration\"]:.2f}s')
"
```

---

**🎉 Ready to validate your TripWeaver AI integration across diverse real-world scenarios!**
