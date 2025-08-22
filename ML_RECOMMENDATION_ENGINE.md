# ML-Powered Recommendation Engine for TripWeaver

## Overview

Successfully implemented a machine learning-based personalization engine that replaces simple rule-based filtering with content-based filtering using scikit-learn. The system uses TF-IDF vectorization, one-hot encoding, and cosine similarity to provide personalized activity recommendations.

## Architecture

### 1. Content-Based Filtering Model (`apps/api/ai/recommendation_engine.py`)

**Core ML Components:**
- **TF-IDF Vectorization**: Processes activity type descriptions and metadata
- **One-Hot Encoding**: Handles categorical features (activity types, price levels)
- **Standard Scaling**: Normalizes numerical features (ratings, review counts)
- **Cosine Similarity**: Calculates user preference matching scores

**Key Features:**
- **Multi-feature Processing**: Combines text, categorical, and numerical features
- **User Profile Vectorization**: Creates preference vectors from user interests and constraints
- **Sophisticated Scoring**: Combines ML similarity scores with preference-based boosting
- **Graceful Fallbacks**: Returns mock recommendations when ML components fail

### 2. TypeScript Service Layer (`apps/api/src/services/recommendation_service.ts`)

**Integration Layer:**
- **Python Process Management**: Spawns Python ML engine as subprocess
- **Data Serialization**: Handles JSON communication between Node.js and Python
- **Error Handling**: Provides fallback recommendations when ML engine fails
- **Type Safety**: Full TypeScript interfaces for recommendation data

### 3. Enhanced Itinerary Generation (`apps/api/src/services/itinerary_service.ts`)

**ML-Powered Flow:**
1. **Fetch Activities**: Get broader set of activities from Google Places API
2. **ML Ranking**: Use recommendation engine to rank activities by user fit
3. **Build Itinerary**: Create optimized itinerary from top-ranked activities

## Implementation Details

### Machine Learning Model

#### Feature Engineering
```python
# Activity features extracted and processed:
features = {
    'primary_type': categorical,        # Restaurant, museum, park, etc.
    'types_text': text_tfidf,          # TF-IDF of all activity types
    'rating': numerical_scaled,         # Google rating (0-5)
    'price_level': numerical_scaled,    # Price level (0-4)
    'user_ratings_total': numerical_scaled,  # Review count
    'has_photos': binary,              # Photo availability
    'is_food': binary,                 # Food-related activity
    'is_cultural': binary,             # Cultural activity
    'is_outdoor': binary,              # Outdoor activity
    'is_entertainment': binary,        # Entertainment activity
    'is_shopping': binary,             # Shopping activity
    'is_highly_rated': binary,         # Rating >= 4.0
    'is_popular': binary,              # Reviews >= 100
    'is_expensive': binary             # Price level >= 3
}
```

#### User Profile Matching
```python
# User preferences converted to activity preferences:
user_profile = {
    'interests': ['art', 'food'],      # Mapped to activity types
    'budget': 2,                       # 1-4 scale (1=budget, 4=luxury)
    'pace': 'moderate',                # Affects activity type preferences
    'group_size': 2                    # Influences recommendations
}
```

#### Scoring Algorithm
```python
# Final score combines:
base_score = cosine_similarity(user_vector, activity_vector)
interest_boost = 1.3 if interest_match else 1.0
pace_boost = pace_preferences.get(activity_type, 1.0)
budget_boost = 1.1 if budget_compatible else 0.7
quality_boost = rating_multiplier * popularity_multiplier

final_score = base_score * interest_boost * pace_boost * budget_boost * quality_boost
```

### Integration Flow

#### 1. Enhanced Itinerary Generation
```typescript
// New ML-powered flow in itinerary_service.ts
async generateItinerary(request: ItineraryRequest) {
  // Create user profile from request
  const userProfile = this.createUserProfile(request);
  
  for (each day) {
    // Step 1: Fetch broader set of activities
    const availableActivities = await this.getAvailableActivitiesForDay(...);
    
    // Step 2: Rank using ML engine
    const rankedActivities = await this.getRankedActivities(userProfile, availableActivities);
    
    // Step 3: Build itinerary from top-ranked activities
    const dayActivities = await this.createDayActivitiesFromRanked(rankedActivities);
  }
}
```

#### 2. Recommendation Service Bridge
```typescript
// TypeScript service that bridges to Python ML engine
class RecommendationService {
  async getPersonalizedRecommendations(userProfile, activities, topN) {
    try {
      // Call Python ML engine via subprocess
      const result = await this.callPythonScript({
        user_profile: userProfile,
        activities: activities,
        top_n: topN
      });
      
      return result.recommendations;
    } catch (error) {
      // Fallback to heuristic-based recommendations
      return this.fallbackRecommendations(userProfile, activities, topN);
    }
  }
}
```

## API Enhancements

### Enhanced Itinerary Endpoint

**Request with ML Parameters:**
```json
POST /v1/ai/itinerary
{
  "tripId": "trip_123",
  "destination": "Paris",
  "startDate": "2024-06-15",
  "endDate": "2024-06-20",
  "travelers": 2,
  "budgetTotal": 2000,
  "currency": "USD",
  "pace": "moderate",
  "interests": ["art", "food", "culture"],
  "dietary": [],
  "mustSee": ["Eiffel Tower", "Louvre"]
}
```

**Enhanced Response with ML Scores:**
```json
{
  "currency": "USD",
  "totalDays": 5,
  "estimatedTotal": 1850,
  "days": [
    {
      "date": "2024-06-15",
      "summary": "Day 1 in Paris",
      "items": [
        {
          "time": "09:00",
          "title": "Musée du Louvre",
          "category": "sightseeing",
          "lat": 48.8606,
          "lng": 2.3376,
          "estCost": 17,
          "notes": "Rue de Rivoli, 75001 Paris (4.7★) • ML Score: 0.94",
          "placeId": "ChIJD3uTd9hx5kcR1IQvGfr8dbk",
          "booking": {
            "type": "ticket",
            "operator": "Musée du Louvre"
          }
        }
      ],
      "subtotal": 142
    }
  ],
  "provider": "places-service",
  "message": "Itinerary generated with real-time place data"
}
```

## Setup and Installation

### 1. Install Python Dependencies
```bash
cd apps/api
./setup-ml.sh
```

### 2. Test ML Integration
```bash
npm run test-ml
```

### 3. Manual Python Test
```bash
cd apps/api/ai
echo '{"user_profile": {"interests": ["art"], "budget": 2, "pace": "moderate"}, "activities": [], "top_n": 5}' | python3 recommendation_engine.py
```

## Performance and Reliability

### Caching Strategy
- **Model Training**: Models are trained on-demand with each request
- **Feature Processing**: TF-IDF and preprocessing pipelines cached per session
- **Fallback System**: Automatic fallback to heuristic recommendations

### Error Handling
- **Python Process Failures**: Graceful degradation to TypeScript fallback
- **Missing Dependencies**: Automatic detection and fallback
- **Invalid Data**: Robust error handling with meaningful error messages

### Performance Optimizations
- **Subprocess Management**: Efficient Python process spawning
- **Feature Vectorization**: Optimized scikit-learn pipelines
- **Batch Processing**: Process multiple activities efficiently

## Key Benefits

### 1. Personalized Recommendations
- **Interest Matching**: Activities ranked by relevance to user interests
- **Budget Compatibility**: Recommendations respect user budget constraints
- **Pace Adaptation**: Activity selection adapts to desired travel pace
- **Quality Prioritization**: Higher-rated and popular venues preferred

### 2. Machine Learning Advantages
- **Content-Based Filtering**: Learns from activity features rather than user behavior
- **Cold Start Resilience**: Works well for new users with stated preferences
- **Scalable Feature Engineering**: Easy to add new activity features
- **Interpretable Results**: ML scores provide transparency

### 3. Robust Fallbacks
- **No Python Required**: System works without ML dependencies
- **Graceful Degradation**: Seamlessly falls back to heuristic recommendations
- **Production Ready**: Handles failures without breaking user experience

## Comparison: Before vs After

### Before (Rule-Based)
```typescript
// Simple interest matching
if (interests.includes('art') && activityTypes.includes('museum')) {
  score += 0.5;
}
if (activityPrice <= userBudget) {
  score += 0.2;
}
```

### After (ML-Powered)
```python
# Sophisticated ML matching
user_vector = create_user_preference_vector(user_profile)
activity_vectors = tfidf_vectorizer.transform(activities)
similarity_scores = cosine_similarity(user_vector, activity_vectors)
final_scores = apply_preference_boosting(similarity_scores, user_profile)
```

### Results Improvement
- **Precision**: More accurate activity matching based on multiple features
- **Personalization**: Individual user preferences better represented
- **Diversity**: Better balance of activity types within recommendations
- **Quality**: Higher-rated and more relevant activities prioritized

## Future Enhancements

### 1. Collaborative Filtering
- Add user behavior tracking for collaborative recommendations
- Implement hybrid content-collaborative filtering
- User similarity analysis for improved recommendations

### 2. Advanced ML Models
- Deep learning embeddings for activities and users
- Reinforcement learning for dynamic preference adaptation
- Natural language processing for activity descriptions

### 3. Real-time Learning
- Online learning from user feedback
- A/B testing for recommendation algorithms
- Dynamic model updating based on user interactions

### 4. Multi-criteria Optimization
- Temporal constraints (opening hours, seasonal availability)
- Geographic optimization (travel time between activities)
- Group preference aggregation for multi-traveler trips

## Monitoring and Analytics

### ML Performance Metrics
- **Recommendation Accuracy**: Comparison with user selections
- **Coverage**: Percentage of activities covered by recommendations
- **Diversity**: Variety in recommended activity types
- **Response Time**: ML engine performance monitoring

### Fallback Usage Tracking
- Track when Python ML engine is unavailable
- Monitor fallback recommendation quality
- System reliability metrics

The ML-powered recommendation engine transforms TripWeaver from static rule-based filtering to intelligent, personalized activity recommendations that adapt to individual user preferences and provide a significantly enhanced travel planning experience.
