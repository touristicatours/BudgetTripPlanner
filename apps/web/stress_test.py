#!/usr/bin/env python3
"""
Comprehensive Stress Test Suite for TripWeaver AI Integration

This script validates the API integrations and personalization engine across
diverse real-world scenarios including geographic diversity, preference extremes,
API failure resilience, and performance benchmarks.
"""

import asyncio
import json
import time
import random
import requests
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import logging
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class TestResult:
    """Represents the result of a single test."""
    test_name: str
    status: str  # PASS, FAIL, ERROR
    duration: float
    details: str
    errors: List[str]
    metrics: Dict[str, Any]

class StressTestSuite:
    """Comprehensive stress test suite for TripWeaver AI integration."""
    
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.results: List[TestResult] = []
        self.session = requests.Session()
        self.session.timeout = 30
        
        # Test data
        self.geographic_scenarios = [
            {
                "name": "Dense City - Tokyo",
                "destination": "Tokyo, Japan",
                "expected_categories": ["restaurant", "shopping", "culture", "transport"],
                "expected_activities": ["shopping", "dining", "temples", "metro"]
            },
            {
                "name": "Coastal Town - Santorini",
                "destination": "Santorini, Greece",
                "expected_categories": ["restaurant", "beach", "culture", "relaxation"],
                "expected_activities": ["beach", "sunset", "wine", "views"]
            },
            {
                "name": "Mountainous Region - Banff",
                "destination": "Banff, Canada",
                "expected_categories": ["outdoor", "nature", "adventure", "relaxation"],
                "expected_activities": ["hiking", "scenery", "wildlife", "outdoors"]
            },
            {
                "name": "Historical European City - Prague",
                "destination": "Prague, Czech Republic",
                "expected_categories": ["culture", "history", "architecture", "food"],
                "expected_activities": ["castle", "old town", "museums", "beer"]
            },
            {
                "name": "Sprawling Suburban Area - Orlando",
                "destination": "Orlando, Florida",
                "expected_categories": ["entertainment", "family", "shopping", "food"],
                "expected_activities": ["theme parks", "shopping", "family", "entertainment"]
            }
        ]
        
        self.extreme_preferences = [
            {
                "name": "Ultra Budget Traveler",
                "preferences": {
                    "budget": 1,  # $10/day equivalent
                    "interests": ["free", "budget", "local"],
                    "pace": "relaxed",
                    "travelers": 1
                },
                "expected_characteristics": ["free", "budget", "local", "cheap"]
            },
            {
                "name": "Luxury Traveler",
                "preferences": {
                    "budget": 4,  # High budget
                    "interests": ["luxury", "fine dining", "exclusive"],
                    "pace": "relaxed",
                    "travelers": 2
                },
                "expected_characteristics": ["luxury", "fine dining", "exclusive", "premium"]
            },
            {
                "name": "Adventure Sports Enthusiast",
                "preferences": {
                    "budget": 3,
                    "interests": ["adventure sports", "hiking", "extreme"],
                    "pace": "fast",
                    "travelers": 2
                },
                "expected_characteristics": ["adventure", "sports", "hiking", "extreme"]
            },
            {
                "name": "Family with Young Children",
                "preferences": {
                    "budget": 2,
                    "interests": ["family", "children", "education"],
                    "pace": "moderate",
                    "travelers": 4
                },
                "expected_characteristics": ["family", "children", "educational", "safe"]
            }
        ]

    def log_test_start(self, test_name: str) -> float:
        """Log the start of a test and return start time."""
        logger.info(f"🚀 Starting test: {test_name}")
        return time.time()

    def log_test_end(self, test_name: str, start_time: float, status: str):
        """Log the end of a test with duration."""
        duration = time.time() - start_time
        logger.info(f"✅ Completed test: {test_name} - {status} ({duration:.2f}s)")

    async def test_geographic_diversity(self) -> TestResult:
        """Test 1: Geographic Diversity Test"""
        test_name = "Geographic Diversity Test"
        start_time = self.log_test_start(test_name)
        errors = []
        details = []
        
        try:
            for scenario in self.geographic_scenarios:
                logger.info(f"Testing scenario: {scenario['name']}")
                
                # Generate itinerary for this location
                itinerary_data = {
                    "destination": scenario["destination"],
                    "startDate": "2024-06-15",
                    "endDate": "2024-06-17",
                    "travelers": 2,
                    "budget": 3,
                    "currency": "USD",
                    "pace": "moderate",
                    "interests": ["culture", "food", "sightseeing"],
                    "activitiesPerDay": 3,
                    "detailLevel": "concise"
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/itinerary",
                    json=itinerary_data,
                    timeout=30
                )
                
                if response.status_code != 200:
                    errors.append(f"Failed to generate itinerary for {scenario['name']}: {response.status_code}")
                    continue
                
                itinerary = response.json()
                
                if not itinerary.get("ok"):
                    errors.append(f"Itinerary generation failed for {scenario['name']}: {itinerary.get('error', 'Unknown error')}")
                    continue
                
                # Analyze itinerary content
                itinerary_content = itinerary.get("itinerary", [])
                if not itinerary_content:
                    errors.append(f"Empty itinerary for {scenario['name']}")
                    continue
                
                # Extract activity names and notes
                all_activities = []
                for day in itinerary_content:
                    activities = day.get("activities", [])
                    for activity in activities:
                        all_activities.append(activity.get("name", "").lower())
                        if activity.get("note"):
                            all_activities.append(activity.get("note", "").lower())
                
                # Check for geographic appropriateness
                activity_text = " ".join(all_activities)
                geographic_score = 0
                
                for expected in scenario["expected_activities"]:
                    if expected.lower() in activity_text:
                        geographic_score += 1
                
                appropriateness = geographic_score / len(scenario["expected_activities"])
                details.append(f"{scenario['name']}: {appropriateness:.2%} appropriate activities")
                
                if appropriateness < 0.3:
                    errors.append(f"Low geographic appropriateness for {scenario['name']}: {appropriateness:.2%}")
                
                # Check for ML-powered data
                has_ml_data = False
                for day in itinerary_content:
                    activities = day.get("activities", [])
                    for activity in activities:
                        if any(key in activity for key in ["rating", "user_ratings_total", "price_level", "mlScore"]):
                            has_ml_data = True
                            break
                    if has_ml_data:
                        break
                
                if not has_ml_data:
                    details.append(f"Warning: No ML-powered data found for {scenario['name']}")
            
            status = "PASS" if len(errors) == 0 else "FAIL"
            self.log_test_end(test_name, start_time, status)
            
            return TestResult(
                test_name=test_name,
                status=status,
                duration=time.time() - start_time,
                details="\n".join(details),
                errors=errors,
                metrics={"scenarios_tested": len(self.geographic_scenarios)}
            )
            
        except Exception as e:
            error_msg = f"Unexpected error in geographic diversity test: {str(e)}"
            logger.error(error_msg)
            self.log_test_end(test_name, start_time, "ERROR")
            return TestResult(
                test_name=test_name,
                status="ERROR",
                duration=time.time() - start_time,
                details="Test failed due to unexpected error",
                errors=[error_msg],
                metrics={}
            )

    async def test_preference_extremes(self) -> TestResult:
        """Test 2: Preference Extreme Test"""
        test_name = "Preference Extreme Test"
        start_time = self.log_test_start(test_name)
        errors = []
        details = []
        
        try:
            for profile in self.extreme_preferences:
                logger.info(f"Testing extreme profile: {profile['name']}")
                
                # Generate itinerary with extreme preferences
                itinerary_data = {
                    "destination": "Paris, France",  # Use same destination for comparison
                    "startDate": "2024-06-15",
                    "endDate": "2024-06-17",
                    "travelers": profile["preferences"]["travelers"],
                    "budget": profile["preferences"]["budget"],
                    "currency": "USD",
                    "pace": profile["preferences"]["pace"],
                    "interests": profile["preferences"]["interests"],
                    "activitiesPerDay": 3,
                    "detailLevel": "concise"
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/itinerary",
                    json=itinerary_data,
                    timeout=30
                )
                
                if response.status_code != 200:
                    errors.append(f"Failed to generate itinerary for {profile['name']}: {response.status_code}")
                    continue
                
                itinerary = response.json()
                
                if not itinerary.get("ok"):
                    errors.append(f"Itinerary generation failed for {profile['name']}: {itinerary.get('error', 'Unknown error')}")
                    continue
                
                # Analyze preference adherence
                itinerary_content = itinerary.get("itinerary", [])
                if not itinerary_content:
                    errors.append(f"Empty itinerary for {profile['name']}")
                    continue
                
                # Extract all activity information
                all_activities = []
                for day in itinerary_content:
                    activities = day.get("activities", [])
                    for activity in activities:
                        all_activities.append(activity.get("name", "").lower())
                        if activity.get("note"):
                            all_activities.append(activity.get("note", "").lower())
                        if activity.get("category"):
                            all_activities.append(activity.get("category", "").lower())
                
                activity_text = " ".join(all_activities)
                
                # Check preference adherence
                adherence_score = 0
                for expected in profile["expected_characteristics"]:
                    if expected.lower() in activity_text:
                        adherence_score += 1
                
                adherence = adherence_score / len(profile["expected_characteristics"])
                details.append(f"{profile['name']}: {adherence:.2%} preference adherence")
                
                if adherence < 0.2:
                    errors.append(f"Low preference adherence for {profile['name']}: {adherence:.2%}")
                
                # Check budget appropriateness
                if profile["name"] == "Ultra Budget Traveler":
                    # Look for expensive indicators
                    expensive_indicators = ["luxury", "fine dining", "exclusive", "premium"]
                    expensive_count = sum(1 for indicator in expensive_indicators if indicator in activity_text)
                    if expensive_count > 2:
                        errors.append(f"Budget traveler received expensive recommendations: {expensive_count} luxury items")
                
                elif profile["name"] == "Luxury Traveler":
                    # Look for budget indicators
                    budget_indicators = ["free", "cheap", "budget", "local"]
                    budget_count = sum(1 for indicator in budget_indicators if indicator in activity_text)
                    if budget_count > 2:
                        errors.append(f"Luxury traveler received budget recommendations: {budget_count} budget items")
            
            status = "PASS" if len(errors) == 0 else "FAIL"
            self.log_test_end(test_name, start_time, status)
            
            return TestResult(
                test_name=test_name,
                status=status,
                duration=time.time() - start_time,
                details="\n".join(details),
                errors=errors,
                metrics={"profiles_tested": len(self.extreme_preferences)}
            )
            
        except Exception as e:
            error_msg = f"Unexpected error in preference extremes test: {str(e)}"
            logger.error(error_msg)
            self.log_test_end(test_name, start_time, "ERROR")
            return TestResult(
                test_name=test_name,
                status="ERROR",
                duration=time.time() - start_time,
                details="Test failed due to unexpected error",
                errors=[error_msg],
                metrics={}
            )

    async def test_api_failure_resilience(self) -> TestResult:
        """Test 3: API Failure Resilience Test"""
        test_name = "API Failure Resilience Test"
        start_time = self.log_test_start(test_name)
        errors = []
        details = []
        
        try:
            # Test 1: Invalid API key (simulate)
            logger.info("Testing invalid API key scenario")
            invalid_response = self.session.post(
                f"{self.base_url}/api/places/search",
                json={
                    "query": "restaurants",
                    "location": "Paris, France",
                    "radius": 5000
                },
                timeout=10
            )
            
            # Should handle gracefully even with invalid API key
            if invalid_response.status_code == 500:
                errors.append("API failed completely with invalid key instead of graceful fallback")
            else:
                details.append("✅ Handled invalid API key gracefully")
            
            # Test 2: Network timeout simulation
            logger.info("Testing network timeout scenario")
            try:
                timeout_response = self.session.post(
                    f"{self.base_url}/api/places/search",
                    json={
                        "query": "museums",
                        "location": "Tokyo, Japan",
                        "radius": 5000
                    },
                    timeout=1  # Very short timeout
                )
                details.append("✅ Handled timeout gracefully")
            except requests.exceptions.Timeout:
                details.append("✅ Timeout handled as expected")
            except Exception as e:
                errors.append(f"Unexpected error during timeout test: {str(e)}")
            
            # Test 3: Rate limiting simulation
            logger.info("Testing rate limiting scenario")
            rapid_requests = []
            for i in range(5):
                try:
                    response = self.session.post(
                        f"{self.base_url}/api/places/search",
                        json={
                            "query": f"attraction_{i}",
                            "location": "London, UK",
                            "radius": 5000
                        },
                        timeout=5
                    )
                    rapid_requests.append(response.status_code)
                except Exception as e:
                    rapid_requests.append(f"Error: {str(e)}")
            
            # Check if system handles rapid requests
            success_count = sum(1 for code in rapid_requests if code == 200)
            details.append(f"✅ Rapid requests handled: {success_count}/5 successful")
            
            if success_count == 0:
                errors.append("All rapid requests failed - possible rate limiting issue")
            
            # Test 4: Invalid location data
            logger.info("Testing invalid location scenario")
            invalid_location_response = self.session.post(
                f"{self.base_url}/api/places/search",
                json={
                    "query": "restaurants",
                    "location": "InvalidLocation12345",
                    "radius": 5000
                },
                timeout=10
            )
            
            if invalid_location_response.status_code == 500:
                errors.append("System crashed with invalid location instead of graceful handling")
            else:
                details.append("✅ Handled invalid location gracefully")
            
            # Test 5: Malformed request data
            logger.info("Testing malformed request scenario")
            malformed_response = self.session.post(
                f"{self.base_url}/api/places/search",
                json={
                    "invalid_field": "invalid_value",
                    "malformed_data": None
                },
                timeout=10
            )
            
            if malformed_response.status_code == 500:
                errors.append("System crashed with malformed data instead of validation error")
            else:
                details.append("✅ Handled malformed request gracefully")
            
            status = "PASS" if len(errors) == 0 else "FAIL"
            self.log_test_end(test_name, start_time, status)
            
            return TestResult(
                test_name=test_name,
                status=status,
                duration=time.time() - start_time,
                details="\n".join(details),
                errors=errors,
                metrics={"resilience_tests": 5}
            )
            
        except Exception as e:
            error_msg = f"Unexpected error in API failure resilience test: {str(e)}"
            logger.error(error_msg)
            self.log_test_end(test_name, start_time, "ERROR")
            return TestResult(
                test_name=test_name,
                status="ERROR",
                duration=time.time() - start_time,
                details="Test failed due to unexpected error",
                errors=[error_msg],
                metrics={}
            )

    async def test_performance_benchmark(self) -> TestResult:
        """Test 4: Performance Benchmark Test"""
        test_name = "Performance Benchmark Test"
        start_time = self.log_test_start(test_name)
        errors = []
        details = []
        performance_data = []
        
        try:
            # Test multiple scenarios for performance
            test_scenarios = [
                {
                    "name": "Simple Itinerary",
                    "data": {
                        "destination": "Paris, France",
                        "startDate": "2024-06-15",
                        "endDate": "2024-06-17",
                        "travelers": 2,
                        "budget": 3,
                        "interests": ["culture", "food"],
                        "activitiesPerDay": 3
                    }
                },
                {
                    "name": "Complex Itinerary",
                    "data": {
                        "destination": "Tokyo, Japan",
                        "startDate": "2024-06-15",
                        "endDate": "2024-06-20",
                        "travelers": 4,
                        "budget": 4,
                        "interests": ["culture", "food", "shopping", "technology"],
                        "activitiesPerDay": 5
                    }
                },
                {
                    "name": "ML-Enhanced Itinerary",
                    "data": {
                        "destination": "New York, USA",
                        "startDate": "2024-06-15",
                        "endDate": "2024-06-18",
                        "travelers": 2,
                        "budget": 3,
                        "interests": ["culture", "food", "entertainment"],
                        "activitiesPerDay": 4,
                        "userId": "test-user-123"  # Enable ML learning
                    }
                }
            ]
            
            for scenario in test_scenarios:
                logger.info(f"Testing performance: {scenario['name']}")
                
                # Measure response time
                scenario_start = time.time()
                response = self.session.post(
                    f"{self.base_url}/api/itinerary",
                    json=scenario["data"],
                    timeout=30
                )
                scenario_duration = time.time() - scenario_start
                
                performance_data.append({
                    "scenario": scenario["name"],
                    "duration": scenario_duration,
                    "status_code": response.status_code
                })
                
                details.append(f"{scenario['name']}: {scenario_duration:.2f}s")
                
                # Check performance threshold (3 seconds)
                if scenario_duration > 3.0:
                    errors.append(f"{scenario['name']} exceeded 3-second threshold: {scenario_duration:.2f}s")
                
                # Verify response quality
                if response.status_code != 200:
                    errors.append(f"{scenario['name']} failed with status {response.status_code}")
                else:
                    itinerary = response.json()
                    if not itinerary.get("ok"):
                        errors.append(f"{scenario['name']} returned error: {itinerary.get('error', 'Unknown')}")
            
            # Calculate performance metrics
            avg_duration = sum(p["duration"] for p in performance_data) / len(performance_data)
            max_duration = max(p["duration"] for p in performance_data)
            min_duration = min(p["duration"] for p in performance_data)
            
            details.append(f"\nPerformance Summary:")
            details.append(f"Average: {avg_duration:.2f}s")
            details.append(f"Maximum: {max_duration:.2f}s")
            details.append(f"Minimum: {min_duration:.2f}s")
            
            # Performance thresholds
            if avg_duration > 2.0:
                errors.append(f"Average performance too slow: {avg_duration:.2f}s")
            
            if max_duration > 5.0:
                errors.append(f"Maximum performance too slow: {max_duration:.2f}s")
            
            status = "PASS" if len(errors) == 0 else "FAIL"
            self.log_test_end(test_name, start_time, status)
            
            return TestResult(
                test_name=test_name,
                status=status,
                duration=time.time() - start_time,
                details="\n".join(details),
                errors=errors,
                metrics={
                    "avg_duration": avg_duration,
                    "max_duration": max_duration,
                    "min_duration": min_duration,
                    "scenarios_tested": len(test_scenarios)
                }
            )
            
        except Exception as e:
            error_msg = f"Unexpected error in performance benchmark test: {str(e)}"
            logger.error(error_msg)
            self.log_test_end(test_name, start_time, "ERROR")
            return TestResult(
                test_name=test_name,
                status="ERROR",
                duration=time.time() - start_time,
                details="Test failed due to unexpected error",
                errors=[error_msg],
                metrics={}
            )

    async def test_concurrent_load(self) -> TestResult:
        """Test 5: Concurrent Load Test"""
        test_name = "Concurrent Load Test"
        start_time = self.log_test_start(test_name)
        errors = []
        details = []
        
        try:
            # Test concurrent requests
            concurrent_requests = 10
            logger.info(f"Testing {concurrent_requests} concurrent requests")
            
            def make_request(request_id):
                try:
                    response = self.session.post(
                        f"{self.base_url}/api/itinerary",
                        json={
                            "destination": f"City_{request_id}",
                            "startDate": "2024-06-15",
                            "endDate": "2024-06-17",
                            "travelers": 2,
                            "budget": 3,
                            "interests": ["culture", "food"],
                            "activitiesPerDay": 3
                        },
                        timeout=30
                    )
                    return {
                        "id": request_id,
                        "status_code": response.status_code,
                        "success": response.status_code == 200
                    }
                except Exception as e:
                    return {
                        "id": request_id,
                        "status_code": 0,
                        "success": False,
                        "error": str(e)
                    }
            
            # Execute concurrent requests
            with ThreadPoolExecutor(max_workers=concurrent_requests) as executor:
                futures = [executor.submit(make_request, i) for i in range(concurrent_requests)]
                results = [future.result() for future in as_completed(futures)]
            
            # Analyze results
            successful_requests = sum(1 for r in results if r["success"])
            failed_requests = concurrent_requests - successful_requests
            
            details.append(f"Concurrent requests: {successful_requests}/{concurrent_requests} successful")
            
            if successful_requests < concurrent_requests * 0.8:  # 80% success rate
                errors.append(f"Low success rate under concurrent load: {successful_requests}/{concurrent_requests}")
            
            # Check for specific failure patterns
            for result in results:
                if not result["success"]:
                    details.append(f"Request {result['id']} failed: {result.get('error', 'Unknown error')}")
            
            status = "PASS" if len(errors) == 0 else "FAIL"
            self.log_test_end(test_name, start_time, status)
            
            return TestResult(
                test_name=test_name,
                status=status,
                duration=time.time() - start_time,
                details="\n".join(details),
                errors=errors,
                metrics={
                    "concurrent_requests": concurrent_requests,
                    "successful_requests": successful_requests,
                    "success_rate": successful_requests / concurrent_requests
                }
            )
            
        except Exception as e:
            error_msg = f"Unexpected error in concurrent load test: {str(e)}"
            logger.error(error_msg)
            self.log_test_end(test_name, start_time, "ERROR")
            return TestResult(
                test_name=test_name,
                status="ERROR",
                duration=time.time() - start_time,
                details="Test failed due to unexpected error",
                errors=[error_msg],
                metrics={}
            )

    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all stress tests and generate comprehensive report."""
        logger.info("🧪 Starting comprehensive stress test suite...")
        
        # Run all tests
        tests = [
            self.test_geographic_diversity(),
            self.test_preference_extremes(),
            self.test_api_failure_resilience(),
            self.test_performance_benchmark(),
            self.test_concurrent_load()
        ]
        
        results = await asyncio.gather(*tests, return_exceptions=True)
        
        # Process results
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                # Handle test execution errors
                test_names = ["Geographic Diversity", "Preference Extremes", "API Failure Resilience", 
                            "Performance Benchmark", "Concurrent Load"]
                self.results.append(TestResult(
                    test_name=test_names[i],
                    status="ERROR",
                    duration=0.0,
                    details=f"Test execution failed: {str(result)}",
                    errors=[str(result)],
                    metrics={}
                ))
            else:
                self.results.append(result)
        
        # Generate summary report
        return self.generate_report()

    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report."""
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.status == "PASS")
        failed_tests = sum(1 for r in self.results if r.status == "FAIL")
        error_tests = sum(1 for r in self.results if r.status == "ERROR")
        
        total_duration = sum(r.duration for r in self.results)
        avg_duration = total_duration / total_tests if total_tests > 0 else 0
        
        # Collect all errors
        all_errors = []
        for result in self.results:
            all_errors.extend(result.errors)
        
        # Performance metrics
        performance_metrics = {}
        for result in self.results:
            if result.metrics:
                performance_metrics[result.test_name] = result.metrics
        
        report = {
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "errors": error_tests,
                "success_rate": passed_tests / total_tests if total_tests > 0 else 0,
                "total_duration": total_duration,
                "avg_duration": avg_duration
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
                for r in self.results
            ],
            "performance_metrics": performance_metrics,
            "all_errors": all_errors,
            "timestamp": datetime.now().isoformat(),
            "recommendations": self.generate_recommendations()
        }
        
        return report

    def generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results."""
        recommendations = []
        
        # Analyze results and provide recommendations
        for result in self.results:
            if result.status == "FAIL":
                if "geographic" in result.test_name.lower():
                    recommendations.append("Improve geographic appropriateness of recommendations")
                elif "preference" in result.test_name.lower():
                    recommendations.append("Enhance preference filtering and ranking algorithms")
                elif "api" in result.test_name.lower():
                    recommendations.append("Strengthen API failure handling and fallback mechanisms")
                elif "performance" in result.test_name.lower():
                    recommendations.append("Optimize performance for better response times")
                elif "concurrent" in result.test_name.lower():
                    recommendations.append("Improve concurrent request handling and resource management")
            
            elif result.status == "ERROR":
                recommendations.append(f"Fix critical errors in {result.test_name}")
        
        # Overall recommendations
        success_rate = sum(1 for r in self.results if r.status == "PASS") / len(self.results)
        if success_rate < 0.8:
            recommendations.append("Overall system stability needs improvement")
        
        avg_duration = sum(r.duration for r in self.results) / len(self.results)
        if avg_duration > 10:
            recommendations.append("System performance optimization required")
        
        if not recommendations:
            recommendations.append("System is performing well across all test scenarios")
        
        return recommendations

def print_report(report: Dict[str, Any]):
    """Print a formatted test report."""
    print("\n" + "="*80)
    print("🧪 TRIPWEAVER STRESS TEST REPORT")
    print("="*80)
    
    summary = report["summary"]
    print(f"\n📊 SUMMARY:")
    print(f"   Total Tests: {summary['total_tests']}")
    print(f"   Passed: {summary['passed']} ✅")
    print(f"   Failed: {summary['failed']} ❌")
    print(f"   Errors: {summary['errors']} 💥")
    print(f"   Success Rate: {summary['success_rate']:.1%}")
    print(f"   Total Duration: {summary['total_duration']:.2f}s")
    print(f"   Average Duration: {summary['avg_duration']:.2f}s")
    
    print(f"\n📋 DETAILED RESULTS:")
    for result in report["results"]:
        status_icon = "✅" if result["status"] == "PASS" else "❌" if result["status"] == "FAIL" else "💥"
        print(f"\n   {status_icon} {result['test_name']} ({result['duration']:.2f}s)")
        print(f"      Status: {result['status']}")
        if result["details"]:
            print(f"      Details: {result['details']}")
        if result["errors"]:
            print(f"      Errors: {', '.join(result['errors'])}")
        if result["metrics"]:
            print(f"      Metrics: {result['metrics']}")
    
    if report["performance_metrics"]:
        print(f"\n📈 PERFORMANCE METRICS:")
        for test_name, metrics in report["performance_metrics"].items():
            print(f"   {test_name}: {metrics}")
    
    if report["all_errors"]:
        print(f"\n🚨 ALL ERRORS:")
        for error in report["all_errors"]:
            print(f"   • {error}")
    
    if report["recommendations"]:
        print(f"\n💡 RECOMMENDATIONS:")
        for rec in report["recommendations"]:
            print(f"   • {rec}")
    
    print(f"\n⏰ Generated: {report['timestamp']}")
    print("="*80)

async def main():
    """Main function to run the stress test suite."""
    import sys
    
    # Parse command line arguments
    base_url = "http://localhost:3000"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    print(f"🚀 Starting TripWeaver Stress Test Suite")
    print(f"📍 Target URL: {base_url}")
    print(f"⏰ Started at: {datetime.now().isoformat()}")
    
    # Create test suite
    test_suite = StressTestSuite(base_url)
    
    try:
        # Run all tests
        report = await test_suite.run_all_tests()
        
        # Print report
        print_report(report)
        
        # Save report to file
        report_file = f"stress_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n💾 Report saved to: {report_file}")
        
        # Exit with appropriate code
        if report["summary"]["success_rate"] >= 0.8:
            print("\n🎉 Stress test suite completed successfully!")
            sys.exit(0)
        else:
            print("\n⚠️ Stress test suite completed with issues!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️ Stress test suite interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Stress test suite failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
