#!/usr/bin/env python3
"""
Feedback Analyzer for TripWeaver

This module analyzes user feedback to infer updated preferences and improve
future recommendations through adaptive learning.
"""

import json
import sqlite3
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class UserPreference:
    """Represents a user preference with confidence score."""
    value: float  # 0.0 to 1.0
    confidence: float  # 0.0 to 1.0
    source: str  # 'stated', 'inferred', 'combined'
    last_updated: datetime

@dataclass
class InferredPreferences:
    """Container for all inferred user preferences."""
    interests: Dict[str, UserPreference]
    budget_preference: UserPreference
    pace_preference: UserPreference
    price_sensitivity: UserPreference
    category_affinities: Dict[str, UserPreference]
    last_analysis: datetime

class FeedbackAnalyzer:
    """
    Analyzes user feedback to infer preferences and improve recommendations.
    """
    
    def __init__(self, db_path: str = "prisma/dev.db"):
        self.db_path = db_path
        
        # Interest mapping for analysis
        self.category_to_interests = {
            'restaurant': ['food', 'dining'],
            'cafe': ['food', 'relaxation'],
            'museum': ['culture', 'art', 'history'],
            'art_gallery': ['art', 'culture'],
            'park': ['nature', 'outdoors', 'relaxation'],
            'shopping_mall': ['shopping'],
            'bar': ['nightlife', 'food'],
            'night_club': ['nightlife'],
            'amusement_park': ['entertainment'],
            'zoo': ['nature', 'family'],
            'aquarium': ['nature', 'family'],
            'historical_site': ['history', 'culture'],
            'church': ['religion', 'culture'],
            'spa': ['relaxation', 'wellness'],
            'sports_facility': ['sports', 'activity'],
            'recreation_area': ['outdoors', 'sports'],
            'theater': ['entertainment', 'culture'],
            'cinema': ['entertainment'],
            'library': ['culture', 'education'],
            'university': ['education', 'culture']
        }
        
        # Action weights for preference inference
        self.action_weights = {
            'liked': 1.0,
            'positive': 1.0,
            'added': 0.8,
            'rated': 0.7,
            'viewed': 0.3,
            'disliked': -1.0,
            'negative': -1.0,
            'removed': -0.8,
            'skipped': -0.5
        }
        
        # Time decay factors
        self.time_decay_days = 90  # Feedback older than 90 days has reduced weight

    def get_user_feedback(self, user_id: str, days_back: int = 90) -> List[Dict[str, Any]]:
        """
        Retrieve user feedback from the database.
        
        Args:
            user_id: User identifier
            days_back: Number of days to look back
            
        Returns:
            List of feedback records
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cutoff_date = datetime.now() - timedelta(days=days_back)
            
            query = """
                SELECT 
                    id, tripId, activityId, activityName, action, rating,
                    category, priceLevel, metadata, createdAt
                FROM user_feedback 
                WHERE userId = ? AND createdAt >= ?
                ORDER BY createdAt DESC
            """
            
            cursor.execute(query, (user_id, cutoff_date.isoformat()))
            rows = cursor.fetchall()
            
            feedback = []
            for row in rows:
                feedback.append({
                    'id': row[0],
                    'tripId': row[1],
                    'activityId': row[2],
                    'activityName': row[3],
                    'action': row[4],
                    'rating': row[5],
                    'category': row[6],
                    'priceLevel': row[7],
                    'metadata': json.loads(row[8]) if row[8] else {},
                    'createdAt': datetime.fromisoformat(row[9])
                })
            
            conn.close()
            return feedback
            
        except Exception as e:
            logger.error(f"Error retrieving user feedback: {e}")
            return []

    def calculate_time_weight(self, feedback_date: datetime) -> float:
        """
        Calculate time-based weight for feedback (newer feedback has higher weight).
        
        Args:
            feedback_date: When the feedback was given
            
        Returns:
            Weight between 0.0 and 1.0
        """
        days_old = (datetime.now() - feedback_date).days
        if days_old <= 0:
            return 1.0
        elif days_old >= self.time_decay_days:
            return 0.1
        else:
            # Exponential decay
            return np.exp(-days_old / 30)

    def analyze_category_preferences(self, feedback: List[Dict[str, Any]]) -> Dict[str, UserPreference]:
        """
        Analyze feedback to infer category preferences.
        
        Args:
            feedback: List of feedback records
            
        Returns:
            Dictionary of category preferences
        """
        category_scores = {}
        category_counts = {}
        
        for record in feedback:
            category = record.get('category')
            if not category:
                continue
                
            action = record.get('action', 'viewed')
            action_weight = self.action_weights.get(action, 0.0)
            time_weight = self.calculate_time_weight(record['createdAt'])
            
            # Apply rating if available
            rating_weight = 1.0
            if record.get('rating'):
                rating = record['rating']
                rating_weight = (rating - 1) / 4  # Normalize 1-5 to 0-1
            
            total_weight = action_weight * time_weight * rating_weight
            
            if category not in category_scores:
                category_scores[category] = 0.0
                category_counts[category] = 0
            
            category_scores[category] += total_weight
            category_counts[category] += 1
        
        # Convert scores to preferences
        preferences = {}
        for category, score in category_scores.items():
            count = category_counts[category]
            # Normalize score to 0-1 range
            normalized_score = max(0.0, min(1.0, (score / count + 1) / 2))
            # Confidence based on number of interactions
            confidence = min(1.0, count / 5)  # Max confidence at 5+ interactions
            
            preferences[category] = UserPreference(
                value=normalized_score,
                confidence=confidence,
                source='inferred',
                last_updated=datetime.now()
            )
        
        return preferences

    def analyze_interest_preferences(self, feedback: List[Dict[str, Any]]) -> Dict[str, UserPreference]:
        """
        Analyze feedback to infer interest preferences based on categories.
        
        Args:
            feedback: List of feedback records
            
        Returns:
            Dictionary of interest preferences
        """
        interest_scores = {}
        interest_counts = {}
        
        for record in feedback:
            category = record.get('category')
            if not category:
                continue
            
            # Map category to interests
            interests = self.category_to_interests.get(category, [category])
            
            action = record.get('action', 'viewed')
            action_weight = self.action_weights.get(action, 0.0)
            time_weight = self.calculate_time_weight(record['createdAt'])
            
            # Apply rating if available
            rating_weight = 1.0
            if record.get('rating'):
                rating = record['rating']
                rating_weight = (rating - 1) / 4
            
            total_weight = action_weight * time_weight * rating_weight
            
            for interest in interests:
                if interest not in interest_scores:
                    interest_scores[interest] = 0.0
                    interest_counts[interest] = 0
                
                interest_scores[interest] += total_weight
                interest_counts[interest] += 1
        
        # Convert scores to preferences
        preferences = {}
        for interest, score in interest_scores.items():
            count = interest_counts[interest]
            normalized_score = max(0.0, min(1.0, (score / count + 1) / 2))
            confidence = min(1.0, count / 3)  # Lower threshold for interests
            
            preferences[interest] = UserPreference(
                value=normalized_score,
                confidence=confidence,
                source='inferred',
                last_updated=datetime.now()
            )
        
        return preferences

    def analyze_budget_preferences(self, feedback: List[Dict[str, Any]]) -> UserPreference:
        """
        Analyze feedback to infer budget preferences based on price levels.
        
        Args:
            feedback: List of feedback records
            
        Returns:
            Budget preference
        """
        price_scores = []
        price_weights = []
        
        for record in feedback:
            price_level = record.get('priceLevel')
            if price_level is None:
                continue
            
            action = record.get('action', 'viewed')
            action_weight = self.action_weights.get(action, 0.0)
            time_weight = self.calculate_time_weight(record['createdAt'])
            
            # Apply rating if available
            rating_weight = 1.0
            if record.get('rating'):
                rating = record['rating']
                rating_weight = (rating - 1) / 4
            
            total_weight = action_weight * time_weight * rating_weight
            
            # Normalize price level (0-4) to 0-1
            normalized_price = price_level / 4
            
            price_scores.append(normalized_price)
            price_weights.append(total_weight)
        
        if not price_scores:
            return UserPreference(
                value=0.5,  # Neutral
                confidence=0.0,
                source='inferred',
                last_updated=datetime.now()
            )
        
        # Calculate weighted average
        weighted_price = np.average(price_scores, weights=price_weights)
        confidence = min(1.0, len(price_scores) / 5)
        
        return UserPreference(
            value=weighted_price,
            confidence=confidence,
            source='inferred',
            last_updated=datetime.now()
        )

    def analyze_pace_preferences(self, feedback: List[Dict[str, Any]]) -> UserPreference:
        """
        Analyze feedback to infer pace preferences based on activity types.
        
        Args:
            feedback: List of feedback records
            
        Returns:
            Pace preference (0=relaxed, 0.5=moderate, 1=fast)
        """
        pace_scores = []
        pace_weights = []
        
        # Define pace characteristics
        relaxed_activities = {'spa', 'park', 'cafe', 'garden', 'library'}
        fast_activities = {'amusement_park', 'sports_facility', 'night_club', 'entertainment'}
        
        for record in feedback:
            category = record.get('category')
            if not category:
                continue
            
            action = record.get('action', 'viewed')
            action_weight = self.action_weights.get(action, 0.0)
            time_weight = self.calculate_time_weight(record['createdAt'])
            
            # Apply rating if available
            rating_weight = 1.0
            if record.get('rating'):
                rating = record['rating']
                rating_weight = (rating - 1) / 4
            
            total_weight = action_weight * time_weight * rating_weight
            
            # Determine pace score
            if category in relaxed_activities:
                pace_score = 0.0  # Relaxed
            elif category in fast_activities:
                pace_score = 1.0  # Fast
            else:
                pace_score = 0.5  # Moderate
            
            pace_scores.append(pace_score)
            pace_weights.append(total_weight)
        
        if not pace_scores:
            return UserPreference(
                value=0.5,  # Moderate
                confidence=0.0,
                source='inferred',
                last_updated=datetime.now()
            )
        
        # Calculate weighted average
        weighted_pace = np.average(pace_scores, weights=pace_weights)
        confidence = min(1.0, len(pace_scores) / 5)
        
        return UserPreference(
            value=weighted_pace,
            confidence=confidence,
            source='inferred',
            last_updated=datetime.now()
        )

    def analyze_feedback(self, user_id: str) -> InferredPreferences:
        """
        Analyze user feedback to infer preferences.
        
        Args:
            user_id: User identifier
            
        Returns:
            InferredPreferences object with all analyzed preferences
        """
        logger.info(f"Analyzing feedback for user: {user_id}")
        
        # Get user feedback
        feedback = self.get_user_feedback(user_id)
        
        if not feedback:
            logger.info(f"No feedback found for user: {user_id}")
            return InferredPreferences(
                interests={},
                budget_preference=UserPreference(0.5, 0.0, 'inferred', datetime.now()),
                pace_preference=UserPreference(0.5, 0.0, 'inferred', datetime.now()),
                price_sensitivity=UserPreference(0.5, 0.0, 'inferred', datetime.now()),
                category_affinities={},
                last_analysis=datetime.now()
            )
        
        # Analyze different aspects
        interests = self.analyze_interest_preferences(feedback)
        categories = self.analyze_category_preferences(feedback)
        budget = self.analyze_budget_preferences(feedback)
        pace = self.analyze_pace_preferences(feedback)
        
        # Price sensitivity (inverse of budget preference)
        price_sensitivity = UserPreference(
            value=1.0 - budget.value,
            confidence=budget.confidence,
            source='inferred',
            last_updated=datetime.now()
        )
        
        logger.info(f"Analysis complete for user {user_id}: {len(interests)} interests, {len(categories)} categories")
        
        return InferredPreferences(
            interests=interests,
            budget_preference=budget,
            pace_preference=pace,
            price_sensitivity=price_sensitivity,
            category_affinities=categories,
            last_analysis=datetime.now()
        )

    def update_user_profile(self, user_id: str, stated_preferences: Dict[str, Any], 
                           inferred_preferences: InferredPreferences) -> Dict[str, Any]:
        """
        Merge stated and inferred preferences to create an updated user profile.
        
        Args:
            user_id: User identifier
            stated_preferences: User's explicitly stated preferences
            inferred_preferences: Preferences inferred from feedback
            
        Returns:
            Updated user profile with merged preferences
        """
        updated_profile = stated_preferences.copy()
        
        # Weight for merging (stated preferences have higher weight)
        stated_weight = 0.7
        inferred_weight = 0.3
        
        # Update interests
        stated_interests = set(stated_preferences.get('interests', []))
        inferred_interests = inferred_preferences.interests
        
        # Add high-confidence inferred interests
        for interest, pref in inferred_interests.items():
            if pref.confidence > 0.6 and pref.value > 0.7:
                if interest not in stated_interests:
                    stated_interests.add(interest)
        
        # Remove low-confidence interests
        interests_to_remove = set()
        for interest in stated_interests:
            if interest in inferred_interests:
                inferred_pref = inferred_interests[interest]
                if inferred_pref.confidence > 0.5 and inferred_pref.value < 0.3:
                    interests_to_remove.add(interest)
        
        updated_interests = list(stated_interests - interests_to_remove)
        updated_profile['interests'] = updated_interests
        
        # Update budget preference
        stated_budget = stated_preferences.get('budget', 2)  # Default to moderate
        if inferred_preferences.budget_preference.confidence > 0.5:
            # Convert budget scale (1-4) to 0-1
            stated_budget_norm = (stated_budget - 1) / 3
            inferred_budget_norm = inferred_preferences.budget_preference.value
            
            # Weighted average
            combined_budget = (stated_budget_norm * stated_weight + 
                             inferred_budget_norm * inferred_weight)
            
            # Convert back to 1-4 scale
            updated_budget = int(round(combined_budget * 3 + 1))
            updated_profile['budget'] = max(1, min(4, updated_budget))
        
        # Update pace preference
        stated_pace = stated_preferences.get('pace', 'moderate')
        if inferred_preferences.pace_preference.confidence > 0.5:
            pace_value = inferred_preferences.pace_preference.value
            
            if pace_value < 0.33:
                inferred_pace = 'relaxed'
            elif pace_value > 0.67:
                inferred_pace = 'fast'
            else:
                inferred_pace = 'moderate'
            
            # Only update if confidence is high
            if inferred_preferences.pace_preference.confidence > 0.7:
                updated_profile['pace'] = inferred_pace
        
        # Add inferred preferences metadata
        updated_profile['inferred_preferences'] = {
            'last_analysis': inferred_preferences.last_analysis.isoformat(),
            'confidence_scores': {
                'budget': inferred_preferences.budget_preference.confidence,
                'pace': inferred_preferences.pace_preference.confidence,
                'interests_count': len(inferred_preferences.interests)
            },
            'category_affinities': {
                category: {'value': pref.value, 'confidence': pref.confidence}
                for category, pref in inferred_preferences.category_affinities.items()
                if pref.confidence > 0.5
            }
        }
        
        logger.info(f"Updated profile for user {user_id}: {len(updated_interests)} interests, budget={updated_profile.get('budget')}, pace={updated_profile.get('pace')}")
        
        return updated_profile

    def save_user_profile(self, user_id: str, profile: Dict[str, Any]) -> bool:
        """
        Save updated user profile to database.
        
        Args:
            user_id: User identifier
            profile: Updated user profile
            
        Returns:
            Success status
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if user exists
            cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
            if not cursor.fetchone():
                logger.warning(f"User {user_id} not found in database")
                return False
            
            # Update user profile (assuming we have a profile field or separate table)
            # For now, we'll store it in a separate table
            profile_json = json.dumps(profile)
            
            cursor.execute("""
                INSERT OR REPLACE INTO user_profiles (userId, profile, updatedAt)
                VALUES (?, ?, ?)
            """, (user_id, profile_json, datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
            
            logger.info(f"Saved updated profile for user: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving user profile: {e}")
            return False

def main():
    """
    CLI interface for testing the feedback analyzer.
    """
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python feedback_analyzer.py <user_id>")
        sys.exit(1)
    
    user_id = sys.argv[1]
    analyzer = FeedbackAnalyzer()
    
    # Analyze feedback
    inferred_prefs = analyzer.analyze_feedback(user_id)
    
    print(f"Analysis for user: {user_id}")
    print(f"Last analysis: {inferred_prefs.last_analysis}")
    print(f"Interests found: {len(inferred_prefs.interests)}")
    print(f"Categories analyzed: {len(inferred_prefs.category_affinities)}")
    print(f"Budget preference: {inferred_prefs.budget_preference.value:.2f} (confidence: {inferred_prefs.budget_preference.confidence:.2f})")
    print(f"Pace preference: {inferred_prefs.pace_preference.value:.2f} (confidence: {inferred_prefs.pace_preference.confidence:.2f})")
    
    if inferred_prefs.interests:
        print("\nTop interests:")
        sorted_interests = sorted(inferred_prefs.interests.items(), 
                                key=lambda x: x[1].value, reverse=True)
        for interest, pref in sorted_interests[:5]:
            print(f"  {interest}: {pref.value:.2f} (confidence: {pref.confidence:.2f})")

if __name__ == '__main__':
    main()
