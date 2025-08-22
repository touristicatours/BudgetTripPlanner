#!/usr/bin/env python3
"""
Demo script for TripWeaver Stress Test Suite

This script demonstrates the stress test functionality with sample data
and provides a quick way to validate the test framework.
"""

import asyncio
import json
import time
from datetime import datetime
from stress_test import StressTestSuite, TestResult

class DemoStressTest:
    """Demo version of stress test with sample data."""
    
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.demo_mode = True
    
    async def demo_geographic_diversity(self) -> TestResult:
        """Demo geographic diversity test with sample results."""
        print("🌍 Demo: Geographic Diversity Test")
        
        # Simulate test scenarios
        scenarios = [
            {"name": "Tokyo", "appropriateness": 0.75},
            {"name": "Santorini", "appropriateness": 0.82},
            {"name": "Banff", "appropriateness": 0.68},
            {"name": "Prague", "appropriateness": 0.79},
            {"name": "Orlando", "appropriateness": 0.71}
        ]
        
        details = []
        errors = []
        
        for scenario in scenarios:
            details.append(f"{scenario['name']}: {scenario['appropriateness']:.1%} appropriate activities")
            
            if scenario['appropriateness'] < 0.3:
                errors.append(f"Low geographic appropriateness for {scenario['name']}")
        
        return TestResult(
            test_name="Geographic Diversity Test (Demo)",
            status="PASS" if len(errors) == 0 else "FAIL",
            duration=2.5,
            details="\n".join(details),
            errors=errors,
            metrics={"scenarios_tested": len(scenarios)}
        )
    
    async def demo_preference_extremes(self) -> TestResult:
        """Demo preference extremes test with sample results."""
        print("🎯 Demo: Preference Extremes Test")
        
        profiles = [
            {"name": "Ultra Budget Traveler", "adherence": 0.85},
            {"name": "Luxury Traveler", "adherence": 0.78},
            {"name": "Adventure Sports Enthusiast", "adherence": 0.72},
            {"name": "Family with Young Children", "adherence": 0.81}
        ]
        
        details = []
        errors = []
        
        for profile in profiles:
            details.append(f"{profile['name']}: {profile['adherence']:.1%} preference adherence")
            
            if profile['adherence'] < 0.2:
                errors.append(f"Low preference adherence for {profile['name']}")
        
        return TestResult(
            test_name="Preference Extremes Test (Demo)",
            status="PASS" if len(errors) == 0 else "FAIL",
            duration=3.2,
            details="\n".join(details),
            errors=errors,
            metrics={"profiles_tested": len(profiles)}
        )
    
    async def demo_api_failure_resilience(self) -> TestResult:
        """Demo API failure resilience test with sample results."""
        print("🛡️ Demo: API Failure Resilience Test")
        
        tests = [
            "Invalid API key: ✅ Handled gracefully",
            "Network timeout: ✅ Handled gracefully", 
            "Rate limiting: ✅ Handled gracefully",
            "Invalid location: ✅ Handled gracefully",
            "Malformed request: ✅ Handled gracefully"
        ]
        
        return TestResult(
            test_name="API Failure Resilience Test (Demo)",
            status="PASS",
            duration=1.8,
            details="\n".join(tests),
            errors=[],
            metrics={"resilience_tests": 5}
        )
    
    async def demo_performance_benchmark(self) -> TestResult:
        """Demo performance benchmark test with sample results."""
        print("⚡ Demo: Performance Benchmark Test")
        
        scenarios = [
            {"name": "Simple Itinerary", "duration": 1.2},
            {"name": "Complex Itinerary", "duration": 2.1},
            {"name": "ML-Enhanced Itinerary", "duration": 2.8}
        ]
        
        details = []
        errors = []
        
        for scenario in scenarios:
            details.append(f"{scenario['name']}: {scenario['duration']:.2f}s")
            
            if scenario['duration'] > 3.0:
                errors.append(f"{scenario['name']} exceeded 3-second threshold")
        
        avg_duration = sum(s['duration'] for s in scenarios) / len(scenarios)
        max_duration = max(s['duration'] for s in scenarios)
        min_duration = min(s['duration'] for s in scenarios)
        
        details.append(f"\nPerformance Summary:")
        details.append(f"Average: {avg_duration:.2f}s")
        details.append(f"Maximum: {max_duration:.2f}s")
        details.append(f"Minimum: {min_duration:.2f}s")
        
        return TestResult(
            test_name="Performance Benchmark Test (Demo)",
            status="PASS" if len(errors) == 0 else "FAIL",
            duration=4.5,
            details="\n".join(details),
            errors=errors,
            metrics={
                "avg_duration": avg_duration,
                "max_duration": max_duration,
                "min_duration": min_duration,
                "scenarios_tested": len(scenarios)
            }
        )
    
    async def demo_concurrent_load(self) -> TestResult:
        """Demo concurrent load test with sample results."""
        print("🔄 Demo: Concurrent Load Test")
        
        concurrent_requests = 10
        successful_requests = 9  # 90% success rate
        
        details = [f"Concurrent requests: {successful_requests}/{concurrent_requests} successful"]
        
        errors = []
        if successful_requests < concurrent_requests * 0.8:
            errors.append(f"Low success rate under concurrent load: {successful_requests}/{concurrent_requests}")
        
        return TestResult(
            test_name="Concurrent Load Test (Demo)",
            status="PASS" if len(errors) == 0 else "FAIL",
            duration=6.2,
            details="\n".join(details),
            errors=errors,
            metrics={
                "concurrent_requests": concurrent_requests,
                "successful_requests": successful_requests,
                "success_rate": successful_requests / concurrent_requests
            }
        )
    
    async def run_demo_tests(self):
        """Run all demo tests and generate report."""
        print("🎭 Starting TripWeaver Stress Test Demo")
        print("=" * 60)
        
        # Run demo tests
        tests = [
            self.demo_geographic_diversity(),
            self.demo_preference_extremes(),
            self.demo_api_failure_resilience(),
            self.demo_performance_benchmark(),
            self.demo_concurrent_load()
        ]
        
        results = await asyncio.gather(*tests)
        
        # Generate demo report
        report = self.generate_demo_report(results)
        
        # Print report
        self.print_demo_report(report)
        
        return report
    
    def generate_demo_report(self, results):
        """Generate demo report from test results."""
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r.status == "PASS")
        failed_tests = sum(1 for r in results if r.status == "FAIL")
        
        total_duration = sum(r.duration for r in results)
        avg_duration = total_duration / total_tests
        
        return {
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "errors": 0,
                "success_rate": passed_tests / total_tests,
                "total_duration": total_duration,
                "avg_duration": avg_duration,
                "demo_mode": True
            },
            "results": [
                {
                    "test_name": r.test_name,
                    "status": r.status,
                    "duration": r.duration,
                    "details": r.details,
                    "errors": r.errors,
                    "metrics": r.metrics
                }
                for r in results
            ],
            "timestamp": datetime.now().isoformat(),
            "recommendations": [
                "This is a demo run with sample data",
                "Run the full stress test suite for real validation",
                "System appears to be performing well in demo mode"
            ]
        }
    
    def print_demo_report(self, report):
        """Print formatted demo report."""
        print("\n" + "="*60)
        print("🎭 TRIPWEAVER STRESS TEST DEMO REPORT")
        print("="*60)
        
        summary = report["summary"]
        print(f"\n📊 SUMMARY (Demo Mode):")
        print(f"   Total Tests: {summary['total_tests']}")
        print(f"   Passed: {summary['passed']} ✅")
        print(f"   Failed: {summary['failed']} ❌")
        print(f"   Success Rate: {summary['success_rate']:.1%}")
        print(f"   Total Duration: {summary['total_duration']:.2f}s")
        print(f"   Average Duration: {summary['avg_duration']:.2f}s")
        
        print(f"\n📋 DETAILED RESULTS:")
        for result in report["results"]:
            status_icon = "✅" if result["status"] == "PASS" else "❌"
            print(f"\n   {status_icon} {result['test_name']} ({result['duration']:.2f}s)")
            print(f"      Status: {result['status']}")
            if result["details"]:
                print(f"      Details: {result['details']}")
            if result["metrics"]:
                print(f"      Metrics: {result['metrics']}")
        
        print(f"\n💡 RECOMMENDATIONS:")
        for rec in report["recommendations"]:
            print(f"   • {rec}")
        
        print(f"\n⏰ Generated: {report['timestamp']}")
        print("="*60)
        print("\n🎯 To run the full stress test suite:")
        print("   python3 stress_test.py")
        print("\n📚 For more information:")
        print("   cat STRESS_TEST_GUIDE.md")

async def main():
    """Main function to run the demo."""
    demo = DemoStressTest()
    
    try:
        report = await demo.run_demo_tests()
        
        # Save demo report
        report_file = f"demo_stress_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n💾 Demo report saved to: {report_file}")
        
    except Exception as e:
        print(f"💥 Demo failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
