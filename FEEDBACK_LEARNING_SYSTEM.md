# Feedback Learning System for TripWeaver

## Overview

Successfully implemented a comprehensive feedback learning system that analyzes user behavior to improve future recommendations. The system uses machine learning techniques to infer user preferences from feedback and continuously adapts recommendations based on user interactions.

## 🧠 Core Components

### 1. Database Schema (`apps/web/prisma/schema.prisma`)

**UserFeedback Model:**
```prisma
model UserFeedback {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tripId       String
  trip         Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  activityId   String   // Google Places ID or internal activity ID
  activityName String   // Activity name for reference
  action       String   // 'added', 'removed', 'rated', 'liked', 'disliked', 'viewed'
  rating       Float?   // User rating (1-5) if applicable
  category     String?  // Activity category (e.g., 'restaurant', 'museum')
  priceLevel   Int?     // Price level (0-4) if applicable
  metadata     String?  // JSON string for additional data
  createdAt    DateTime @default(now())

  @@index([userId, createdAt])
  @@index([tripId, action])
  @@index([activityId])
  @@map("user_feedback")
}
```

### 2. Python Feedback Analyzer (`apps/web/ai/feedback_analyzer.py`)

**Core Classes:**
- `UserPreference`: Represents a preference with confidence score
- `InferredPreferences`: Container for all inferred preferences
- `FeedbackAnalyzer`: Main analysis engine

**Key Methods:**
- `analyze_feedback(user_id)`: Main analysis function
- `analyze_interest_preferences(feedback)`: Infer interest preferences
- `analyze_budget_preferences(feedback)`: Infer budget preferences
- `analyze_pace_preferences(feedback)`: Infer pace preferences
- `update_user_profile(user_id, stated_preferences, inferred_preferences)`: Merge preferences

### 3. TypeScript Integration Service (`apps/web/src/services/feedback-learning.service.ts`)

**Core Interface:**
```typescript
export class FeedbackLearningService {
  async analyzeUserFeedback(userId: string): Promise<InferredPreferences>
  async updateUserProfile(userId: string, statedPreferences: Record<string, any>, inferredPreferences: InferredPreferences): Promise<UpdatedUserProfile>
  async getEnhancedUserProfile(userId: string, statedPreferences: Record<string, any>): Promise<UpdatedUserProfile>
  async getLearningStats(userId: string): Promise<LearningStats>
}
```

## 🎯 Learning Algorithm

### Preference Inference Process

#### 1. Data Collection
```python
# Collect user feedback from database
feedback = get_user_feedback(user_id, days_back=90)
```

#### 2. Action Weighting
```python
action_weights = {
    'liked': 1.0,      # Strong positive signal
    'positive': 1.0,   # Strong positive signal
    'added': 0.8,      # Moderate positive signal
    'rated': 0.7,      # Moderate positive signal
    'viewed': 0.3,     # Weak positive signal
    'disliked': -1.0,  # Strong negative signal
    'negative': -1.0,  # Strong negative signal
    'removed': -0.8,   # Moderate negative signal
    'skipped': -0.5    # Weak negative signal
}
```

#### 3. Time Decay
```python
def calculate_time_weight(feedback_date: datetime) -> float:
    days_old = (datetime.now() - feedback_date).days
    if days_old <= 0:
        return 1.0
    elif days_old >= 90:
        return 0.1
    else:
        return np.exp(-days_old / 30)  # Exponential decay
```

#### 4. Category-to-Interest Mapping
```python
category_to_interests = {
    'restaurant': ['food', 'dining'],
    'museum': ['culture', 'art', 'history'],
    'park': ['nature', 'outdoors', 'relaxation'],
    'shopping_mall': ['shopping'],
    'bar': ['nightlife', 'food'],
    'spa': ['relaxation', 'wellness'],
    'sports_facility': ['sports', 'activity']
}
```

#### 5. Preference Calculation
```python
# For each feedback record
action_weight = action_weights.get(action, 0.0)
time_weight = calculate_time_weight(created_at)
rating_weight = (rating - 1) / 4 if rating else 1.0

total_weight = action_weight * time_weight * rating_weight

# Aggregate weights by category/interest
category_scores[category] += total_weight
category_counts[category] += 1

# Normalize to 0-1 range
normalized_score = max(0.0, min(1.0, (score / count + 1) / 2))
confidence = min(1.0, count / 5)  # Max confidence at 5+ interactions
```

### Preference Merging Strategy

#### Weighted Combination
```python
# Stated preferences have higher weight
stated_weight = 0.7
inferred_weight = 0.3

# For budget preferences
stated_budget_norm = (stated_budget - 1) / 3  # Convert 1-4 to 0-1
inferred_budget_norm = inferred_preferences.budget_preference.value

combined_budget = (stated_budget_norm * stated_weight + 
                  inferred_budget_norm * inferred_weight)

# Convert back to 1-4 scale
updated_budget = int(round(combined_budget * 3 + 1))
```

#### Interest Enhancement
```python
# Add high-confidence inferred interests
for interest, pref in inferred_interests.items():
    if pref.confidence > 0.6 and pref.value > 0.7:
        if interest not in stated_interests:
            stated_interests.add(interest)

# Remove low-confidence interests
for interest in stated_interests:
    if interest in inferred_interests:
        inferred_pref = inferred_interests[interest]
        if inferred_pref.confidence > 0.5 and inferred_pref.value < 0.3:
            interests_to_remove.add(interest)
```

## 🔄 Integration Flow

### 1. Feedback Collection
```typescript
// User provides feedback via frontend
POST /api/feedback
{
  "tripId": "trip-123",
  "activityId": "activity-456",
  "feedback": "positive",
  "activityName": "Musée du Louvre",
  "category": "museum",
  "priceLevel": 3
}
```

### 2. Database Storage
```typescript
// Store in UserFeedback table
const feedbackRecord = await prisma.userFeedback.create({
  data: {
    userId: trip.ownerId,
    tripId,
    activityId,
    activityName,
    action: feedback === 'positive' ? 'liked' : 'disliked',
    category,
    priceLevel,
    metadata: JSON.stringify(metadata)
  }
});
```

### 3. Learning Application
```typescript
// Apply learning during itinerary generation
if (userId) {
  const enhancedProfile = await feedbackLearningService.getEnhancedUserProfile(
    userId, 
    statedPreferences
  );
  
  // Use enhanced preferences for recommendations
  enhancedPreferences = {
    ...enhancedPreferences,
    interests: enhancedProfile.interests,
    budget: enhancedProfile.budget,
    pace: enhancedProfile.pace
  };
}
```

## 📊 Learning Analytics

### Confidence Scoring
```typescript
interface LearningStats {
  totalFeedback: number;
  lastAnalysis: string;
  confidenceScores: {
    budget: number;      // 0.0 to 1.0
    pace: number;        // 0.0 to 1.0
    interests: number;   // Average confidence
  };
  topInferredInterests: Array<{
    interest: string;
    value: number;       // 0.0 to 1.0
    confidence: number;  // 0.0 to 1.0
  }>;
}
```

### Example Learning Insights
```json
{
  "totalFeedback": 15,
  "lastAnalysis": "2024-01-15T10:30:00Z",
  "confidenceScores": {
    "budget": 0.85,
    "pace": 0.72,
    "interests": 0.68
  },
  "topInferredInterests": [
    {
      "interest": "food",
      "value": 0.92,
      "confidence": 0.88
    },
    {
      "interest": "culture",
      "value": 0.78,
      "confidence": 0.75
    },
    {
      "interest": "relaxation",
      "value": 0.45,
      "confidence": 0.62
    }
  ]
}
```

## 🚀 API Endpoints

### Enhanced Itinerary Generation
```typescript
POST /api/itinerary
{
  "destination": "Paris",
  "startDate": "2024-06-15",
  "endDate": "2024-06-17",
  "interests": ["culture", "food"],
  "budget": 2,
  "pace": "moderate",
  "userId": "user-123"  // Optional: enables learning
}

Response:
{
  "ok": true,
  "provider": "openai",
  "itinerary": [...],
  "meta": {
    "interests": ["culture", "food", "art"],  // Enhanced interests
    "budget": 3,                              // Adjusted budget
    "pace": "relaxed"                         // Refined pace
  },
  "learning_applied": true
}
```

### Feedback Statistics
```typescript
GET /api/feedback?userId=user-123

Response:
{
  "success": true,
  "statistics": {
    "userId": "user-123",
    "totalFeedback": 15,
    "positiveFeedback": 12,
    "negativeFeedback": 3,
    "positiveRate": 80.0,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

## 🧪 Testing and Validation

### Test Script
```bash
# Test the feedback learning system
npm run build
node test-feedback-learning.js
```

### Python Analyzer Test
```bash
# Test the Python analyzer directly
cd ai
python3 feedback_analyzer.py test-user-123
```

### Database Migration
```bash
# Apply database changes
npx prisma migrate dev --name add_user_feedback
npx prisma generate
```

## 📈 Performance Optimizations

### Caching Strategy
- **Analysis Results**: Cache inferred preferences for 24 hours
- **User Profiles**: Cache enhanced profiles for 1 hour
- **Statistics**: Cache learning stats for 30 minutes

### Database Indexing
```sql
-- Optimized indexes for feedback queries
CREATE INDEX idx_user_feedback_user_created ON user_feedback(userId, createdAt);
CREATE INDEX idx_user_feedback_trip_action ON user_feedback(tripId, action);
CREATE INDEX idx_user_feedback_activity ON user_feedback(activityId);
```

### Batch Processing
```python
# Process feedback in batches for efficiency
def analyze_feedback_batch(user_ids: List[str]) -> Dict[str, InferredPreferences]:
    results = {}
    for user_id in user_ids:
        results[user_id] = analyze_feedback(user_id)
    return results
```

## 🔮 Future Enhancements

### Advanced Learning Features
1. **Collaborative Filtering**: Learn from similar users
2. **Contextual Learning**: Consider trip context (season, occasion)
3. **Real-time Learning**: Update preferences during active sessions
4. **A/B Testing**: Test different learning algorithms

### Machine Learning Improvements
1. **Deep Learning Models**: Neural networks for preference prediction
2. **Online Learning**: Incremental model updates
3. **Multi-objective Optimization**: Balance multiple preference dimensions
4. **Explainable AI**: Provide reasoning for recommendations

### Analytics and Insights
1. **Learning Dashboard**: Visualize preference evolution
2. **Recommendation Quality Metrics**: Measure improvement over time
3. **User Segmentation**: Group users by learning patterns
4. **Predictive Analytics**: Forecast future preferences

## 🛠️ Setup and Configuration

### Environment Variables
```bash
# Python path for feedback analyzer
PYTHON_PATH=python3

# ML feedback endpoint (optional)
ML_FEEDBACK_ENDPOINT=http://localhost:8000/ml/feedback

# Database configuration
DATABASE_URL="file:./dev.db"
```

### Dependencies
```bash
# Python dependencies
pip install numpy pandas scikit-learn

# Node.js dependencies
npm install @prisma/client
```

### Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Apply user_profiles table
sqlite3 prisma/dev.db < prisma/migrations/add_user_profiles.sql
```

## 📋 Monitoring and Maintenance

### Health Checks
```typescript
// Check system health
async function checkSystemHealth() {
  const checks = {
    database: await checkDatabaseConnection(),
    analyzer: await feedbackLearningService.checkAnalyzerAvailability(),
    feedback: await checkFeedbackProcessing()
  };
  return checks;
}
```

### Performance Monitoring
```typescript
// Monitor learning performance
interface LearningMetrics {
  analysisTime: number;
  feedbackProcessed: number;
  confidenceImprovement: number;
  userSatisfaction: number;
}
```

### Error Handling
```typescript
// Graceful degradation
try {
  const enhancedProfile = await feedbackLearningService.getEnhancedUserProfile(userId, preferences);
  return enhancedProfile;
} catch (error) {
  console.warn('Learning failed, using original preferences:', error);
  return preferences; // Fallback to original
}
```

---

**🎉 Success**: The feedback learning system is now fully integrated and operational, providing intelligent, adaptive recommendations that improve over time based on user behavior and preferences!
