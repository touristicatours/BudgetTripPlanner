# Itinerary Health Scoring System

## Overview

The Itinerary Health Scoring System ensures that every generated itinerary meets high-quality standards by analyzing multiple factors and automatically optimizing itineraries that fall below the quality threshold.

## Features

### 🎯 **Comprehensive Health Scoring (0-100)**
- **Pacing Analysis (25 points)**: Evaluates realistic timing and activity flow
- **Budget Allocation (20 points)**: Ensures activities align with user budget
- **Cohesion (20 points)**: Checks geographical and thematic flow
- **Diversity (20 points)**: Ensures variety in activity types
- **Rating Quality (15 points)**: Maintains minimum quality standards

### 🔄 **Auto-Optimization**
- Automatically improves itineraries scoring below 80
- Identifies and replaces weakest activities
- Iterative improvement with up to 5 optimization rounds
- Maintains thematic cohesion during replacements

### 📊 **Detailed Analytics**
- Breakdown of scores by category
- Specific issues and strengths identified
- Optimization tracking and improvement metrics

## Technical Implementation

### Python Engine (`ai/recommendation_engine.py`)

#### Core Functions

```python
def calculate_itinerary_health_score(itinerary, user_profile):
    """Calculate comprehensive health score (0-100)"""
    
def auto_optimize(itinerary, user_profile, available_activities, max_iterations=5):
    """Automatically optimize itinerary to improve health score"""
    
def _analyze_pacing(itinerary):
    """Analyze activity pacing and timing"""
    
def _analyze_budget_allocation(itinerary, user_profile):
    """Analyze budget alignment"""
    
def _analyze_cohesion(itinerary):
    """Analyze thematic and geographical flow"""
    
def _analyze_diversity(itinerary):
    """Analyze activity type diversity"""
    
def _analyze_rating_floor(itinerary):
    """Analyze rating quality standards"""
```

### TypeScript Service (`src/services/health_scoring_service.ts`)

```typescript
class HealthScoringService {
  async calculateHealthScore(itinerary, userProfile): Promise<ItineraryHealthScore>
  async autoOptimize(itinerary, userProfile, availableActivities, maxIterations): Promise<OptimizationResult>
  async isAvailable(): Promise<boolean>
}
```

### API Endpoints

#### Calculate Health Score
```http
POST /v1/health-scoring/calculate
{
  "itinerary": {...},
  "user_profile": {...}
}
```

#### Auto-Optimize Itinerary
```http
POST /v1/health-scoring/optimize
{
  "itinerary": {...},
  "user_profile": {...},
  "available_activities": [...],
  "max_iterations": 5
}
```

#### Health Check
```http
GET /v1/health-scoring/health
```

## Scoring Criteria

### Pacing Analysis (25 points)
- **Realistic Timing**: 4-12 hours of activities per day
- **Energy Balance**: No more than 2 consecutive high-energy activities
- **Break Distribution**: Adequate rest periods between activities

### Budget Allocation (20 points)
- **Price Level Alignment**: Activities match user's budget category
- **Cost Distribution**: Balanced spending across the trip
- **Over-Budget Penalty**: Penalties for activities exceeding budget

### Cohesion (20 points)
- **Thematic Variety**: Mix of activity types per day
- **Logical Flow**: Food after activities, museums before shopping
- **Geographical Proximity**: Activities in similar areas

### Diversity (20 points)
- **Activity Types**: 6+ different activity categories
- **Experience Variety**: Mix of cultural, outdoor, food, entertainment
- **Over-Representation Check**: No single type >40% of activities

### Rating Quality (15 points)
- **Average Rating**: Target 4.0+ average across all activities
- **Minimum Standards**: Penalties for activities rated below 4.0
- **Popularity Factor**: Consideration of review counts

## Integration Points

### Itinerary Generation Flow

1. **Generate Initial Itinerary**: Create itinerary using existing ML recommendations
2. **Calculate Health Score**: Analyze the generated itinerary
3. **Auto-Optimize if Needed**: If score < 80, run optimization
4. **Return Optimized Result**: Include health score and optimization info

### Response Enhancement

```typescript
interface ItineraryResponse {
  // ... existing fields
  health_score?: {
    overall_score: number;
    health_status: string;
    breakdown: any;
  };
  optimization_info?: {
    optimizations_applied: number;
    improvement: number;
    original_score: number;
  };
}
```

## Usage Examples

### Basic Health Scoring

```typescript
import { healthScoringService } from './health_scoring_service';

const healthScore = await healthScoringService.calculateHealthScore(
  itinerary,
  userProfile
);

console.log(`Health Score: ${healthScore.overall_score}/100 (${healthScore.health_status})`);
```

### Auto-Optimization

```typescript
const optimizationResult = await healthScoringService.autoOptimize(
  itinerary,
  userProfile,
  availableActivities,
  5 // max iterations
);

console.log(`Optimizations applied: ${optimizationResult.optimizations_applied}`);
console.log(`Score improvement: +${optimizationResult.improvement}`);
```

### Testing

```bash
# Run health scoring tests
node test-health-scoring.js

# Test specific functionality
curl -X POST http://localhost:3001/v1/health-scoring/calculate \
  -H "Content-Type: application/json" \
  -d '{"itinerary": {...}, "user_profile": {...}}'
```

## Configuration

### Environment Variables

```bash
PYTHON_PATH=python3  # Python executable path
```

### Quality Thresholds

- **Target Score**: 80+ (Good quality)
- **Excellent Score**: 90+ (Premium quality)
- **Critical Score**: <60 (Requires significant optimization)

### Optimization Settings

- **Max Iterations**: 5 (configurable)
- **Improvement Threshold**: Any positive improvement
- **Activity Pool Size**: All available activities in destination

## Monitoring and Logging

### Performance Tracking

```typescript
const tracker = new PerformanceTracker('health_scoring', {
  destination: request.destination,
  score: healthScore.overall_score,
  optimizations_applied: optimizationResult.optimizations_applied
});
```

### Logging Events

- Health score calculation start/completion
- Optimization iterations and improvements
- Service availability checks
- Error handling and fallbacks

## Benefits

### For Users
- **Guaranteed Quality**: Every itinerary meets minimum standards
- **Better Experiences**: Optimized pacing and variety
- **Budget Alignment**: Activities match spending preferences
- **Transparency**: Clear quality metrics and improvement tracking

### For Developers
- **Automated Quality Control**: No manual review needed
- **Scalable Optimization**: Handles large activity pools efficiently
- **Comprehensive Analytics**: Detailed breakdown of quality factors
- **Graceful Degradation**: Continues working even if optimization fails

### For Business
- **Higher User Satisfaction**: Better itineraries lead to happier users
- **Reduced Support**: Fewer complaints about poor itineraries
- **Competitive Advantage**: Quality guarantee differentiates the service
- **Data-Driven Insights**: Quality metrics inform product improvements

## Future Enhancements

### Planned Features
- **Seasonal Adjustments**: Weather and seasonal activity optimization
- **Group Dynamics**: Family-friendly vs. adult-focused optimization
- **Accessibility Scoring**: Consider mobility and accessibility needs
- **Local Events Integration**: Factor in festivals and special events
- **Real-Time Availability**: Check actual availability of activities

### Advanced Analytics
- **Quality Trends**: Track improvement over time
- **User Preference Learning**: Adapt scoring based on user feedback
- **Destination-Specific Rules**: Custom scoring for different cities
- **A/B Testing Framework**: Compare optimization strategies

## Troubleshooting

### Common Issues

1. **Python Dependencies**: Ensure scikit-learn and pandas are installed
2. **Service Availability**: Check if health scoring service is running
3. **Memory Usage**: Large activity pools may require optimization
4. **Performance**: Health scoring adds ~2-3 seconds to generation time

### Debug Mode

```typescript
// Enable detailed logging
logger.setLevel('debug');

// Check service availability
const isAvailable = await healthScoringService.isAvailable();
console.log('Health scoring available:', isAvailable);
```

### Fallback Behavior

If health scoring fails:
- Continue with original itinerary
- Log error for monitoring
- Return itinerary without health score
- No impact on core functionality

---

**Note**: The health scoring system is designed to enhance itinerary quality while maintaining backward compatibility. All existing functionality continues to work even if health scoring is unavailable.
