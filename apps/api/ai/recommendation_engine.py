#!/usr/bin/env python3
"""
Content-based recommendation engine for TripWeaver activity recommendations.

This module implements a machine learning-based personalization system that ranks
activities based on user preferences using TF-IDF, one-hot encoding, and cosine similarity.
"""

import json
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os
import sys
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional
from pathlib import Path
import hashlib
from prisma import PrismaClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/ml_engine.log') if os.path.exists('logs') else logging.NullHandler()
    ]
)
logger = logging.getLogger(__name__)

class ActivityRecommendationEngine:
    """
    Content-based filtering recommendation engine for activities.
    
    Uses TF-IDF for text features, one-hot encoding for categorical features,
    and standard scaling for numerical features to create activity embeddings.
    """
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True)
        
        self.model_pipeline = None
        self.activity_features = None
        self.activity_embeddings = None
        self.is_trained = False
        self.model_metadata = {}
        
        # Model file paths
        self.model_file = self.model_dir / "activity_recommendation_model.pkl"
        self.metadata_file = self.model_dir / "model_metadata.json"
        
        logger.info(f"Initialized recommendation engine with model directory: {self.model_dir}")

    def _extract_features(self, activities: List[Dict[str, Any]]) -> pd.DataFrame:
        """Extract and preprocess features from activity data."""
        logger.debug(f"Extracting features from {len(activities)} activities")
        
        features = []
        for activity in activities:
            # Extract basic features
            activity_types = activity.get('types', [])
            primary_type = activity_types[0] if activity_types else 'unknown'
            
            # Create feature vector
            feature_vector = {
                'primary_type': primary_type,
                'types_text': ' '.join(activity_types),
                'rating': activity.get('rating', 0.0),
                'price_level': activity.get('price_level', 0),
                'user_ratings_total': activity.get('user_ratings_total', 0),
                'has_photos': 1 if activity.get('photo_reference') else 0,
                
                # Derived binary features
                'is_food': 1 if any(t in ['restaurant', 'cafe', 'bar', 'food'] for t in activity_types) else 0,
                'is_cultural': 1 if any(t in ['museum', 'art_gallery', 'library', 'church'] for t in activity_types) else 0,
                'is_outdoor': 1 if any(t in ['park', 'natural_feature', 'recreation_area'] for t in activity_types) else 0,
                'is_entertainment': 1 if any(t in ['amusement_park', 'movie_theater', 'stadium'] for t in activity_types) else 0,
                'is_shopping': 1 if any(t in ['shopping_mall', 'store', 'department_store'] for t in activity_types) else 0,
                
                # Quality indicators
                'is_highly_rated': 1 if activity.get('rating', 0) >= 4.0 else 0,
                'is_popular': 1 if activity.get('user_ratings_total', 0) >= 100 else 0,
                'is_expensive': 1 if activity.get('price_level', 0) >= 3 else 0
            }
            features.append(feature_vector)
        
        logger.debug(f"Extracted {len(features)} feature vectors")
        return pd.DataFrame(features)

    def train_content_based_model(self, activities: List[Dict[str, Any]], force_retrain: bool = False) -> None:
        """
        Train the content-based filtering model using activity features.
        
        Args:
            activities: List of activity dictionaries with features
            force_retrain: Force retraining even if recent model exists
        """
        start_time = datetime.now()
        logger.info(f"Starting model training with {len(activities)} activities")
        
        # Check if we can load an existing model
        if not force_retrain and self._can_load_existing_model():
            try:
                self.load_model()
                logger.info("Successfully loaded existing model")
                return
            except Exception as e:
                logger.warning(f"Failed to load existing model: {e}. Proceeding with training.")
        
        if not activities:
            raise ValueError("No activities provided for training")
        
        # Extract features
        self.activity_features = self._extract_features(activities)
        
        if len(self.activity_features) == 0:
            raise ValueError("No valid features extracted from activities")
        
        # Define preprocessing pipelines
        categorical_features = ['primary_type']
        numerical_features = ['rating', 'price_level', 'user_ratings_total', 'has_photos',
                             'is_food', 'is_cultural', 'is_outdoor', 'is_entertainment', 
                             'is_shopping', 'is_highly_rated', 'is_popular', 'is_expensive']
        text_features = ['types_text']
        
        # Create preprocessing pipeline
        preprocessor = ColumnTransformer(
            transformers=[
                ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), categorical_features),
                ('num', StandardScaler(), numerical_features),
                ('text', TfidfVectorizer(max_features=50, stop_words='english'), 'types_text')
            ],
            remainder='drop'
        )
        
        # Create and fit the pipeline
        self.model_pipeline = Pipeline([
            ('preprocessor', preprocessor)
        ])
        
        # Fit and transform features
        self.activity_embeddings = self.model_pipeline.fit_transform(self.activity_features)
        self.is_trained = True
        
        # Update metadata
        self.model_metadata = {
            'trained_at': datetime.now().isoformat(),
            'activities_count': len(activities),
            'feature_matrix_shape': self.activity_embeddings.shape,
            'model_version': '1.0.0'
        }
        
        # Save the model
        self.save_model()
        
        training_duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ Model trained successfully in {training_duration:.2f}s")
        logger.info(f"📊 Feature matrix shape: {self.activity_embeddings.shape}")
        logger.info(f"💾 Model saved to {self.model_file}")

    def _can_load_existing_model(self) -> bool:
        """Check if we can load an existing model (exists and is recent)."""
        if not self.model_file.exists() or not self.metadata_file.exists():
            return False
        
        try:
            with open(self.metadata_file, 'r') as f:
                metadata = json.load(f)
            
            trained_at = datetime.fromisoformat(metadata.get('trained_at', '1970-01-01T00:00:00'))
            days_old = (datetime.now() - trained_at).days
            
            # Model is valid if less than 7 days old
            can_load = days_old < 7
            logger.info(f"Existing model is {days_old} days old. {'Loading' if can_load else 'Retraining'}.")
            return can_load
            
        except Exception as e:
            logger.warning(f"Error checking model metadata: {e}")
            return False

    def _calculate_user_preference_vector(self, user_profile: Dict[str, Any]) -> np.ndarray:
        """Calculate user preference vector based on profile."""
        logger.debug("Calculating user preference vector")
        
        # Extract user preferences
        interests = user_profile.get('interests', [])
        budget = user_profile.get('budget', 2)
        pace = user_profile.get('pace', 'moderate')
        group_size = user_profile.get('group_size', 2)
        
        # Create preference vector (same length as activity embeddings)
        # This is a simplified approach - in practice, you'd want more sophisticated mapping
        preference_vector = np.zeros(self.activity_embeddings.shape[1])
        
        # Map interests to feature indices (simplified)
        interest_mapping = {
            'food': ['is_food'],
            'culture': ['is_cultural'],
            'outdoors': ['is_outdoor'],
            'entertainment': ['is_entertainment'],
            'shopping': ['is_shopping']
        }
        
        for interest in interests:
            if interest in interest_mapping:
                for feature in interest_mapping[interest]:
                    # Find feature index in the feature matrix
                    if feature in self.activity_features.columns:
                        feature_idx = self.activity_features.columns.get_loc(feature)
                        if feature_idx < len(preference_vector):
                            preference_vector[feature_idx] = 1.0
        
        # Normalize the preference vector
        if np.linalg.norm(preference_vector) > 0:
            preference_vector = preference_vector / np.linalg.norm(preference_vector)
        
        logger.debug(f"Created preference vector with {np.sum(preference_vector > 0)} active features")
        return preference_vector

    def get_personalized_recommendations(
        self, 
        user_profile: Dict[str, Any], 
        available_activities: List[Dict[str, Any]], 
        top_n: int = 5
    ) -> List[Tuple[Dict[str, Any], float]]:
        """
        Get personalized recommendations for a user.
        
        Args:
            user_profile: User preferences and constraints
            available_activities: List of available activities to rank
            top_n: Number of top recommendations to return
            
        Returns:
            List of (activity, score) tuples sorted by score
        """
        start_time = datetime.now()
        logger.info(f"Generating recommendations for user with {len(available_activities)} available activities")
        
        if not self.is_trained:
            logger.warning("Model not trained. Returning fallback recommendations.")
            return self._fallback_recommendations(available_activities, top_n)
        
        try:
            # Extract features for available activities
            activity_features = self._extract_features(available_activities)
            
            # Transform features using the trained pipeline
            activity_embeddings = self.model_pipeline.transform(activity_features)
            
            # Calculate user preference vector
            user_vector = self._calculate_user_preference_vector(user_profile)
            
            # Calculate similarity scores
            similarity_scores = cosine_similarity([user_vector], activity_embeddings)[0]
            
            # Apply preference-based boosting
            final_scores = []
            for i, activity in enumerate(available_activities):
                base_score = similarity_scores[i]
                
                # Apply preference boosts
                score = self._apply_preference_boosting(activity, user_profile, base_score)
                final_scores.append((activity, score))
            
            # Sort by score and return top N
            final_scores.sort(key=lambda x: x[1], reverse=True)
            recommendations = final_scores[:top_n]
            
            duration = (datetime.now() - start_time).total_seconds()
            logger.info(f"✅ Generated {len(recommendations)} recommendations in {duration:.3f}s")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return self._fallback_recommendations(available_activities, top_n)

    def _apply_preference_boosting(self, activity: Dict[str, Any], user_profile: Dict[str, Any], base_score: float) -> float:
        """Apply preference-based boosting to the base similarity score."""
        score = base_score
        
        # Interest matching boost
        interests = user_profile.get('interests', [])
        activity_types = activity.get('types', [])
        
        for interest in interests:
            if any(interest.lower() in t.lower() for t in activity_types):
                score *= 1.3  # 30% boost for interest match
        
        # Budget compatibility
        user_budget = user_profile.get('budget', 2)
        activity_price = activity.get('price_level', 2)
        
        if user_budget < activity_price:
            score *= 0.7  # 30% penalty for expensive activities
        elif user_budget > activity_price + 1:
            score *= 0.9  # 10% penalty for very cheap activities
        
        # Pace compatibility
        pace = user_profile.get('pace', 'moderate')
        if pace == 'fast' and 'park' in activity_types:
            score *= 0.8  # Penalty for slow activities when user wants fast pace
        elif pace == 'relaxed' and 'amusement_park' in activity_types:
            score *= 0.8  # Penalty for high-energy activities when user wants relaxed pace
        
        return score

    def _fallback_recommendations(self, activities: List[Dict[str, Any]], top_n: int) -> List[Tuple[Dict[str, Any], float]]:
        """Fallback recommendation method when ML model is unavailable."""
        logger.warning("Using fallback recommendation method")
        
        # Simple heuristic ranking
        scored_activities = []
        for activity in activities:
            score = 0.0
            
            # Rating-based scoring
            rating = activity.get('rating', 0)
            score += rating * 0.3
            
            # Popularity-based scoring
            reviews = activity.get('user_ratings_total', 0)
            if reviews > 100:
                score += 0.2
            
            # Type diversity bonus
            types = activity.get('types', [])
            if len(types) > 1:
                score += 0.1
            
            scored_activities.append((activity, score))
        
        # Sort and return top N
        scored_activities.sort(key=lambda x: x[1], reverse=True)
        return scored_activities[:top_n]

    def save_model(self, filepath: str = None) -> None:
        """Save the trained model to disk."""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        if filepath is None:
            filepath = str(self.model_file)
        
        try:
            model_data = {
                'pipeline': self.model_pipeline,
                'activity_features': self.activity_features,
                'activity_embeddings': self.activity_embeddings,
                'is_trained': self.is_trained,
                'metadata': self.model_metadata
            }
            
            joblib.dump(model_data, filepath)
            
            # Save metadata separately for easy access
            with open(self.metadata_file, 'w') as f:
                json.dump(self.model_metadata, f, indent=2)
            
            logger.info(f"✅ Model saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            raise

    def load_model(self, filepath: str = None) -> None:
        """Load a trained model from disk."""
        if filepath is None:
            filepath = str(self.model_file)
        
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")
        
        try:
            model_data = joblib.load(filepath)
            
            self.model_pipeline = model_data['pipeline']
            self.activity_features = model_data['activity_features']
            self.activity_embeddings = model_data['activity_embeddings']
            self.is_trained = model_data['is_trained']
            self.model_metadata = model_data.get('metadata', {})
            
            logger.info(f"✅ Model loaded from {filepath}")
            logger.info(f"📊 Model metadata: {self.model_metadata}")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model."""
        if not self.is_trained:
            return {'status': 'not_trained'}
        
        return {
            'status': 'trained',
            'metadata': self.model_metadata,
            'feature_matrix_shape': self.activity_embeddings.shape if self.activity_embeddings is not None else None,
            'model_file': str(self.model_file),
            'model_file_exists': self.model_file.exists()
        }

def generate_ai_explanation(activity, user_profile, decision_factors=None):
    """
    Generate a human-readable explanation for why an activity was recommended.
    
    Args:
        activity (dict): Activity data with name, rating, price_level, types, etc.
        user_profile (dict): User preferences and interests
        decision_factors (dict): Optional decision factors from ML engine
    
    Returns:
        str: Plain English explanation
    """
    explanations = []
    
    # Extract activity information
    activity_name = activity.get('name', 'This activity')
    activity_rating = activity.get('rating', 0)
    activity_price = activity.get('price_level', 2)
    activity_types = activity.get('types', [])
    activity_address = activity.get('formatted_address', '')
    
    # Extract user profile information
    user_interests = user_profile.get('interests', [])
    user_budget = user_profile.get('budget', 2)
    user_pace = user_profile.get('pace', 'moderate')
    
    # Generate explanations based on different factors
    
    # 1. Interest-based explanation
    if user_interests and activity_types:
        matching_interests = []
        for interest in user_interests:
            interest_lower = interest.lower()
            for activity_type in activity_types:
                if interest_lower in activity_type.lower() or activity_type.lower() in interest_lower:
                    matching_interests.append(interest)
        
        if matching_interests:
            if len(matching_interests) == 1:
                explanations.append(f"because you're interested in {matching_interests[0].title()}")
            else:
                interests_text = ", ".join(matching_interests[:-1]) + f" and {matching_interests[-1]}"
                explanations.append(f"because you're interested in {interests_text}")
    
    # 2. Rating-based explanation
    if activity_rating and activity_rating >= 4.0:
        if activity_rating >= 4.5:
            explanations.append(f"it's highly rated with {activity_rating:.1f} stars")
        else:
            explanations.append(f"it has a good rating of {activity_rating:.1f} stars")
    
    # 3. Budget-based explanation
    if user_budget and activity_price:
        budget_levels = {1: "budget-friendly", 2: "moderately priced", 3: "premium", 4: "luxury"}
        price_levels = {1: "budget-friendly", 2: "moderately priced", 3: "premium", 4: "luxury"}
        
        if activity_price <= user_budget:
            explanations.append(f"it fits your {budget_levels.get(user_budget, 'budget')} preferences")
        else:
            explanations.append(f"it's {price_levels.get(activity_price, 'priced')} but highly recommended")
    
    # 4. ML score explanation (if available)
    if decision_factors and 'ml_score' in decision_factors:
        ml_score = decision_factors['ml_score']
        if ml_score > 0.8:
            explanations.append("our AI found it highly relevant to your preferences")
        elif ml_score > 0.6:
            explanations.append("our AI determined it matches your interests well")
    
    # 5. Popularity explanation
    if activity.get('user_ratings_total', 0) > 1000:
        explanations.append(f"it's popular with {activity['user_ratings_total']:,} reviews")
    
    # 6. Location-based explanation (if available)
    if activity_address:
        # Extract city/area from address
        address_parts = activity_address.split(',')
        if len(address_parts) >= 2:
            location = address_parts[-2].strip()
            explanations.append(f"it's located in {location}")
    
    # 7. Type-specific explanations
    if activity_types:
        type_explanations = {
            'museum': "perfect for cultural exploration",
            'restaurant': "great for experiencing local cuisine",
            'park': "ideal for relaxation and nature",
            'shopping_mall': "excellent for shopping and entertainment",
            'amusement_park': "perfect for fun and excitement",
            'spa': "ideal for relaxation and wellness"
        }
        
        for activity_type in activity_types:
            if activity_type in type_explanations:
                explanations.append(type_explanations[activity_type])
                break
    
    # Combine explanations
    if not explanations:
        explanations.append("it's a great local recommendation")
    
    # Create the final explanation
    if len(explanations) == 1:
        explanation = f"We recommended {activity_name} {explanations[0]}."
    elif len(explanations) == 2:
        explanation = f"We recommended {activity_name} {explanations[0]} and {explanations[1]}."
    else:
        explanation = f"We recommended {activity_name} {', '.join(explanations[:-1])}, and {explanations[-1]}."
    
    return explanation

def generate_itinerary_summary(user_profile, destination, total_activities, data_points=None):
    """
    Generate a summary of how the itinerary was built.
    
    Args:
        user_profile (dict): User preferences and interests
        destination (str): Destination name
        total_activities (int): Number of activities in itinerary
        data_points (int): Optional number of data points used
    
    Returns:
        dict: Summary information for the itinerary
    """
    summary = {
        "optimized_for": [],
        "based_on": [],
        "total_activities": total_activities
    }
    
    # Add optimization factors
    if user_profile.get('interests'):
        interests = user_profile['interests']
        if len(interests) <= 2:
            summary["optimized_for"].append(", ".join(interests).title())
        else:
            summary["optimized_for"].append(f"{len(interests)} key interests")
    
    if user_profile.get('pace'):
        pace = user_profile['pace']
        if pace == 'relaxed':
            summary["optimized_for"].append("Relaxed Pace")
        elif pace == 'moderate':
            summary["optimized_for"].append("Balanced Experience")
        elif pace == 'active':
            summary["optimized_for"].append("Active Exploration")
    
    if user_profile.get('budget'):
        budget = user_profile['budget']
        budget_levels = {1: "Budget-Friendly", 2: "Moderate Budget", 3: "Premium Experience", 4: "Luxury"}
        summary["optimized_for"].append(budget_levels.get(budget, "Your Budget"))
    
    # Add data sources
    summary["based_on"].append("Your preferences and travel style")
    
    if data_points:
        summary["based_on"].append(f"{data_points:,}+ data points from {destination}")
    else:
        summary["based_on"].append(f"thousands of data points from {destination}")
    
    summary["based_on"].append("real-time availability and ratings")
    
    return summary

def calculate_itinerary_health_score(itinerary, user_profile):
    """
    Calculate a comprehensive health score for an itinerary (0-100).
    
    Args:
        itinerary: Complete itinerary with days and activities
        user_profile: User preferences and constraints
        
    Returns:
        Dictionary with overall score and detailed breakdown
    """
    logger.info("Calculating itinerary health score")
    
    total_score = 0
    max_score = 0
    breakdown = {}
    
    # 1. Pacing Analysis (25 points)
    pacing_score, pacing_details = _analyze_pacing(itinerary)
    breakdown['pacing'] = {
        'score': pacing_score,
        'max_score': 25,
        'details': pacing_details
    }
    total_score += pacing_score
    max_score += 25
    
    # 2. Budget Allocation (20 points)
    budget_score, budget_details = _analyze_budget_allocation(itinerary, user_profile)
    breakdown['budget'] = {
        'score': budget_score,
        'max_score': 20,
        'details': budget_details
    }
    total_score += budget_score
    max_score += 20
    
    # 3. Cohesion (20 points)
    cohesion_score, cohesion_details = _analyze_cohesion(itinerary)
    breakdown['cohesion'] = {
        'score': cohesion_score,
        'max_score': 20,
        'details': cohesion_details
    }
    total_score += cohesion_score
    max_score += 20
    
    # 4. Diversity (20 points)
    diversity_score, diversity_details = _analyze_diversity(itinerary)
    breakdown['diversity'] = {
        'score': diversity_score,
        'max_score': 20,
        'details': diversity_details
    }
    total_score += diversity_score
    max_score += 20
    
    # 5. Rating Floor (15 points)
    rating_score, rating_details = _analyze_rating_floor(itinerary)
    breakdown['rating_quality'] = {
        'score': rating_score,
        'max_score': 15,
        'details': rating_details
    }
    total_score += rating_score
    max_score += 15
    
    # Calculate overall score
    overall_score = round((total_score / max_score) * 100, 1)
    
    # Determine health status
    if overall_score >= 90:
        health_status = "Excellent"
    elif overall_score >= 80:
        health_status = "Good"
    elif overall_score >= 70:
        health_status = "Fair"
    elif overall_score >= 60:
        health_status = "Poor"
    else:
        health_status = "Critical"
    
    result = {
        'overall_score': overall_score,
        'health_status': health_status,
        'breakdown': breakdown,
        'total_score': total_score,
        'max_score': max_score
    }
    
    logger.info(f"Itinerary health score: {overall_score}/100 ({health_status})")
    return result

def _analyze_pacing(itinerary):
    """Analyze pacing of activities across days."""
    score = 0
    details = {'issues': [], 'strengths': []}
    
    for day in itinerary.get('days', []):
        activities = day.get('activities', [])
        if not activities:
            continue
            
        # Check for consecutive high-energy activities
        high_energy_count = 0
        consecutive_high_energy = 0
        
        for i, activity in enumerate(activities):
            activity_types = activity.get('types', [])
            is_high_energy = any(t in ['amusement_park', 'stadium', 'gym', 'park'] for t in activity_types)
            
            if is_high_energy:
                high_energy_count += 1
                consecutive_high_energy += 1
            else:
                consecutive_high_energy = 0
            
            # Penalize too many consecutive high-energy activities
            if consecutive_high_energy > 2:
                details['issues'].append(f"Too many consecutive high-energy activities on day {day.get('day', 'unknown')}")
                break
        
        # Check for realistic timing
        total_duration = 0
        for activity in activities:
            duration = activity.get('duration', '2 hours')
            if isinstance(duration, str):
                # Parse duration string like "2 hours", "3 hours", etc.
                try:
                    hours = int(duration.split()[0])
                    total_duration += hours
                except (ValueError, IndexError):
                    total_duration += 2  # Default to 2 hours if parsing fails
            else:
                total_duration += duration
        
        if total_duration > 12:  # More than 12 hours of activities
            details['issues'].append(f"Day {day.get('day', 'unknown')} is over-scheduled ({total_duration}h)")
        elif total_duration < 4:  # Less than 4 hours
            details['issues'].append(f"Day {day.get('day', 'unknown')} is under-scheduled ({total_duration}h)")
        else:
            details['strengths'].append(f"Good pacing on day {day.get('day', 'unknown')} ({total_duration}h)")
            score += 5  # 5 points per well-paced day
    
    # Cap at 25 points
    score = min(score, 25)
    
    if not details['issues']:
        details['strengths'].append("Excellent pacing throughout")
    
    return score, details

def _analyze_budget_allocation(itinerary, user_profile):
    """Analyze budget allocation across the itinerary."""
    score = 0
    details = {'issues': [], 'strengths': []}
    
    user_budget = user_profile.get('budget', 'moderate')
    budget_mapping = {'low': 1, 'moderate': 2, 'high': 3, 'luxury': 4}
    target_price_level = budget_mapping.get(user_budget, 2)
    
    total_cost = 0
    over_budget_activities = 0
    
    for day in itinerary.get('days', []):
        for activity in day.get('activities', []):
            price_level = activity.get('price_level', 0)
            total_cost += price_level
            
            if price_level > target_price_level + 1:  # More than one level above target
                over_budget_activities += 1
                details['issues'].append(f"Activity '{activity.get('name', 'Unknown')}' exceeds budget level")
    
    avg_cost = total_cost / max(len([a for d in itinerary.get('days', []) for a in d.get('activities', [])]), 1)
    
    # Score based on budget alignment
    if abs(avg_cost - target_price_level) <= 0.5:
        score = 20  # Perfect alignment
        details['strengths'].append("Excellent budget alignment")
    elif abs(avg_cost - target_price_level) <= 1:
        score = 15  # Good alignment
        details['strengths'].append("Good budget alignment")
    elif abs(avg_cost - target_price_level) <= 1.5:
        score = 10  # Acceptable alignment
        details['strengths'].append("Acceptable budget alignment")
    else:
        score = 5  # Poor alignment
        details['issues'].append("Poor budget alignment")
    
    # Penalize over-budget activities
    if over_budget_activities > 0:
        score = max(0, score - (over_budget_activities * 2))
    
    return score, details

def _analyze_cohesion(itinerary):
    """Analyze geographical and thematic cohesion."""
    score = 0
    details = {'issues': [], 'strengths': []}
    
    for day in itinerary.get('days', []):
        activities = day.get('activities', [])
        if len(activities) < 2:
            continue
        
        # Check thematic cohesion
        activity_types = []
        for activity in activities:
            types = activity.get('types', [])
            primary_type = types[0] if types else 'unknown'
            activity_types.append(primary_type)
        
        # Check for thematic variety (not all same type)
        unique_types = len(set(activity_types))
        if unique_types >= 3:
            score += 5  # Good variety
            details['strengths'].append(f"Good thematic variety on day {day.get('day', 'unknown')}")
        elif unique_types == 2:
            score += 3  # Moderate variety
        else:
            details['issues'].append(f"Limited thematic variety on day {day.get('day', 'unknown')}")
        
        # Check for logical flow (food after activities, etc.)
        has_food = any('restaurant' in a.get('types', []) for a in activities)
        has_activity = any('museum' in a.get('types', []) or 'park' in a.get('types', []) for a in activities)
        
        if has_food and has_activity:
            score += 5  # Good flow
            details['strengths'].append(f"Good activity flow on day {day.get('day', 'unknown')}")
    
    # Cap at 20 points
    score = min(score, 20)
    
    return score, details

def _analyze_diversity(itinerary):
    """Analyze diversity of activity types across the entire itinerary."""
    score = 0
    details = {'issues': [], 'strengths': []}
    
    all_activities = []
    for day in itinerary.get('days', []):
        all_activities.extend(day.get('activities', []))
    
    if not all_activities:
        return 0, {'issues': ['No activities found'], 'strengths': []}
    
    # Count activity types
    type_counts = {}
    for activity in all_activities:
        types = activity.get('types', [])
        for activity_type in types:
            type_counts[activity_type] = type_counts.get(activity_type, 0) + 1
    
    # Calculate diversity metrics
    total_activities = len(all_activities)
    unique_types = len(type_counts)
    
    # Score based on diversity
    if unique_types >= 8:
        score = 20  # Excellent diversity
        details['strengths'].append("Excellent activity diversity")
    elif unique_types >= 6:
        score = 15  # Good diversity
        details['strengths'].append("Good activity diversity")
    elif unique_types >= 4:
        score = 10  # Moderate diversity
        details['strengths'].append("Moderate activity diversity")
    else:
        score = 5  # Poor diversity
        details['issues'].append("Limited activity diversity")
    
    # Check for over-representation of any type
    for activity_type, count in type_counts.items():
        if count > total_activities * 0.4:  # More than 40% of activities
            details['issues'].append(f"Too many {activity_type} activities ({count}/{total_activities})")
            score = max(0, score - 5)
    
    return score, details

def _analyze_rating_floor(itinerary):
    """Analyze rating quality of all activities."""
    score = 0
    details = {'issues': [], 'strengths': []}
    
    all_activities = []
    for day in itinerary.get('days', []):
        all_activities.extend(day.get('activities', []))
    
    if not all_activities:
        return 0, {'issues': ['No activities found'], 'strengths': []}
    
    ratings = [activity.get('rating', 0) for activity in all_activities]
    avg_rating = sum(ratings) / len(ratings)
    low_rated_activities = [r for r in ratings if r < 4.0]
    
    # Score based on average rating
    if avg_rating >= 4.5:
        score = 15  # Excellent ratings
        details['strengths'].append(f"Excellent average rating: {avg_rating:.1f}")
    elif avg_rating >= 4.2:
        score = 12  # Good ratings
        details['strengths'].append(f"Good average rating: {avg_rating:.1f}")
    elif avg_rating >= 4.0:
        score = 8  # Acceptable ratings
        details['strengths'].append(f"Acceptable average rating: {avg_rating:.1f}")
    else:
        score = 5  # Poor ratings
        details['issues'].append(f"Low average rating: {avg_rating:.1f}")
    
    # Penalize low-rated activities
    if low_rated_activities:
        score = max(0, score - len(low_rated_activities) * 2)
        details['issues'].append(f"{len(low_rated_activities)} activities rated below 4.0")
    
    return score, details

def auto_optimize(itinerary, user_profile, available_activities, max_iterations=5):
    """
    Automatically optimize an itinerary to improve its health score.
    
    Args:
        itinerary: Current itinerary
        user_profile: User preferences and constraints
        available_activities: Pool of available activities for replacement
        max_iterations: Maximum optimization attempts
        
    Returns:
        Optimized itinerary with health score information
    """
    logger.info("Starting itinerary auto-optimization")
    
    # Calculate initial health score
    initial_health = calculate_itinerary_health_score(itinerary, user_profile)
    current_score = initial_health['overall_score']
    
    logger.info(f"Initial health score: {current_score}/100")
    
    if current_score >= 80:
        logger.info("Itinerary already meets quality threshold (>=80)")
        return {
            'itinerary': itinerary,
            'health_score': initial_health,
            'optimizations_applied': 0,
            'improvement': 0
        }
    
    optimizations_applied = 0
    original_score = current_score
    
    for iteration in range(max_iterations):
        logger.info(f"Optimization iteration {iteration + 1}/{max_iterations}")
        
        # Find the weakest activity
        weakest_activity = _find_weakest_activity(itinerary, user_profile)
        if not weakest_activity:
            logger.info("No weak activities found to replace")
            break
        
        # Find better alternatives
        better_alternatives = _find_better_alternatives(
            weakest_activity, available_activities, user_profile
        )
        
        if not better_alternatives:
            logger.info("No better alternatives found")
            break
        
        # Try the best alternative
        best_alternative = better_alternatives[0]
        optimized_itinerary = _replace_activity(
            itinerary, weakest_activity, best_alternative
        )
        
        # Calculate new health score
        new_health = calculate_itinerary_health_score(optimized_itinerary, user_profile)
        new_score = new_health['overall_score']
        
        logger.info(f"Trial score: {new_score}/100 (improvement: {new_score - current_score})")
        
        # Accept improvement if score increases
        if new_score > current_score:
            itinerary = optimized_itinerary
            current_score = new_score
            optimizations_applied += 1
            
            logger.info(f"Applied optimization {optimizations_applied}: {weakest_activity['name']} → {best_alternative['name']}")
            
            # Stop if we've reached the target
            if current_score >= 80:
                logger.info(f"Reached target score: {current_score}/100")
                break
        else:
            logger.info("No improvement found, stopping optimization")
            break
    
    improvement = current_score - original_score
    
    logger.info(f"Optimization complete: {optimizations_applied} changes, "
               f"score improved from {original_score} to {current_score} (+{improvement})")
    
    return {
        'itinerary': itinerary,
        'health_score': calculate_itinerary_health_score(itinerary, user_profile),
        'optimizations_applied': optimizations_applied,
        'improvement': improvement,
        'original_score': original_score
    }

def _find_weakest_activity(itinerary, user_profile):
    """Find the weakest activity in the itinerary based on multiple criteria."""
    all_activities = []
    for day in itinerary.get('days', []):
        for activity in day.get('activities', []):
            all_activities.append(activity)
    
    if not all_activities:
        return None
    
    # Score each activity based on multiple criteria
    activity_scores = []
    for activity in all_activities:
        score = 0
        
        # Rating score (0-40 points)
        rating = activity.get('rating', 0)
        score += min(40, rating * 8)  # 5.0 rating = 40 points
        
        # Budget alignment score (0-30 points)
        user_budget = user_profile.get('budget', 'moderate')
        budget_mapping = {'low': 1, 'moderate': 2, 'high': 3, 'luxury': 4}
        target_price = budget_mapping.get(user_budget, 2)
        price_level = activity.get('price_level', 0)
        
        if abs(price_level - target_price) <= 0.5:
            score += 30
        elif abs(price_level - target_price) <= 1:
            score += 20
        elif abs(price_level - target_price) <= 1.5:
            score += 10
        
        # Popularity score (0-30 points)
        reviews = activity.get('user_ratings_total', 0)
        if reviews >= 1000:
            score += 30
        elif reviews >= 500:
            score += 20
        elif reviews >= 100:
            score += 10
        
        activity_scores.append((activity, score))
    
    # Return the activity with the lowest score
    weakest_activity = min(activity_scores, key=lambda x: x[1])
    return weakest_activity[0]

def _find_better_alternatives(target_activity, available_activities, user_profile):
    """Find better alternatives for a given activity."""
    # Filter out the current activity
    candidates = [a for a in available_activities if a.get('name') != target_activity.get('name')]
    
    if not candidates:
        return []
    
    # Score candidates based on improvement potential
    candidate_scores = []
    for candidate in candidates:
        score = 0
        
        # Rating improvement
        target_rating = target_activity.get('rating', 0)
        candidate_rating = candidate.get('rating', 0)
        if candidate_rating > target_rating:
            score += (candidate_rating - target_rating) * 20
        
        # Budget improvement
        user_budget = user_profile.get('budget', 'moderate')
        budget_mapping = {'low': 1, 'moderate': 2, 'high': 3, 'luxury': 4}
        target_price = budget_mapping.get(user_budget, 2)
        
        target_price_level = target_activity.get('price_level', 0)
        candidate_price_level = candidate.get('price_level', 0)
        
        target_budget_diff = abs(target_price_level - target_price)
        candidate_budget_diff = abs(candidate_price_level - target_price)
        
        if candidate_budget_diff < target_budget_diff:
            score += (target_budget_diff - candidate_budget_diff) * 15
        
        # Type compatibility (similar type to maintain cohesion)
        target_types = set(target_activity.get('types', []))
        candidate_types = set(candidate.get('types', []))
        type_overlap = len(target_types.intersection(candidate_types))
        score += type_overlap * 5
        
        candidate_scores.append((candidate, score))
    
    # Sort by score and return top candidates
    candidate_scores.sort(key=lambda x: x[1], reverse=True)
    return [candidate for candidate, score in candidate_scores[:5]]

def _replace_activity(itinerary, old_activity, new_activity):
    """Replace an activity in the itinerary with a new one."""
    new_itinerary = json.loads(json.dumps(itinerary))  # Deep copy
    
    for day in new_itinerary.get('days', []):
        for i, activity in enumerate(day.get('activities', [])):
            if activity.get('name') == old_activity.get('name'):
                day['activities'][i] = new_activity
                return new_itinerary
    
    return new_itinerary

def generate_proactive_tips(itinerary, user_profile, weather_forecast=None):
    """
    Generate proactive tips for an itinerary based on analysis of potential issues.
    
    Args:
        itinerary (dict): The itinerary to analyze
        user_profile (dict): User preferences and constraints
        weather_forecast (dict): Weather forecast data (optional)
    
    Returns:
        list: List of tip dictionaries with 'type', 'message', 'severity', 'action_type', 'action_data'
    """
    tips = []
    
    # Weather-based tips
    if weather_forecast:
        weather_tips = _analyze_weather_issues(itinerary, weather_forecast)
        tips.extend(weather_tips)
    
    # Connection and timing tips
    connection_tips = _analyze_connection_issues(itinerary)
    tips.extend(connection_tips)
    
    # Budget tips
    budget_tips = _analyze_budget_issues(itinerary, user_profile)
    tips.extend(budget_tips)
    
    # Popularity and reservation tips
    popularity_tips = _analyze_popularity_issues(itinerary)
    tips.extend(popularity_tips)
    
    # Accessibility and special needs tips
    accessibility_tips = _analyze_accessibility_issues(itinerary, user_profile)
    tips.extend(accessibility_tips)
    
    return tips

def _analyze_weather_issues(itinerary, weather_forecast):
    """Analyze weather-related issues and suggest adjustments."""
    tips = []
    
    for day in itinerary.get('days', []):
        day_date = day.get('date')
        if not day_date or day_date not in weather_forecast:
            continue
            
        forecast = weather_forecast[day_date]
        weather_condition = forecast.get('condition', '').lower()
        precipitation_chance = forecast.get('precipitation_chance', 0)
        temperature = forecast.get('temperature', 20)
        
        outdoor_activities = []
        indoor_activities = []
        
        for activity in day.get('activities', []):
            activity_type = activity.get('type', '').lower()
            if any(outdoor in activity_type for outdoor in ['park', 'hiking', 'beach', 'outdoor', 'walking']):
                outdoor_activities.append(activity)
            elif any(indoor in activity_type for indoor in ['museum', 'restaurant', 'shopping', 'indoor']):
                indoor_activities.append(activity)
        
        # Rain/snow warnings
        if precipitation_chance > 60 and outdoor_activities:
            tips.append({
                'type': 'weather',
                'message': f"⚠️ Rain expected on {day_date} ({precipitation_chance}% chance). Consider rescheduling outdoor activities.",
                'severity': 'high',
                'action_type': 'reschedule_outdoor',
                'action_data': {
                    'day_date': day_date,
                    'outdoor_activities': [a.get('name') for a in outdoor_activities],
                    'indoor_activities': [a.get('name') for a in indoor_activities]
                }
            })
        
        # Extreme temperature warnings
        if temperature > 35 or temperature < 0:
            temp_warning = "hot" if temperature > 35 else "cold"
            tips.append({
                'type': 'weather',
                'message': f"🌡️ Extreme {temp_warning} weather expected on {day_date} ({temperature}°C). Plan indoor activities.",
                'severity': 'medium',
                'action_type': 'suggest_indoor',
                'action_data': {'day_date': day_date, 'temperature': temperature}
            })
    
    return tips

def _analyze_connection_issues(itinerary):
    """Analyze tight connections and travel time issues."""
    tips = []
    
    for day in itinerary.get('days', []):
        activities = day.get('activities', [])
        
        for i in range(len(activities) - 1):
            current_activity = activities[i]
            next_activity = activities[i + 1]
            
            current_end = current_activity.get('end_time', '')
            next_start = next_activity.get('start_time', '')
            
            if current_end and next_start:
                # Calculate time between activities
                try:
                    current_hour = int(current_end.split(':')[0])
                    next_hour = int(next_start.split(':')[0])
                    time_gap = next_hour - current_hour
                    
                    if time_gap < 1:  # Less than 1 hour between activities
                        tips.append({
                            'type': 'connection',
                            'message': f"⏰ Tight connection between '{current_activity.get('name')}' and '{next_activity.get('name')}'. Consider booking transportation in advance.",
                            'severity': 'medium',
                            'action_type': 'suggest_transport',
                            'action_data': {
                                'from_activity': current_activity.get('name'),
                                'to_activity': next_activity.get('name'),
                                'time_gap': time_gap
                            }
                        })
                except (ValueError, IndexError):
                    pass
    
    return tips

def _analyze_budget_issues(itinerary, user_profile):
    """Analyze budget overruns and suggest alternatives."""
    tips = []
    
    user_budget = user_profile.get('budget', 3)  # Default to moderate budget
    budget_levels = {1: 50, 2: 100, 3: 200, 4: 500}  # Daily budget in USD
    daily_budget = budget_levels.get(user_budget, 200)
    
    for day in itinerary.get('days', []):
        day_total = 0
        expensive_activities = []
        
        for activity in day.get('activities', []):
            price_level = activity.get('price_level', 2)
            # Rough estimate: price_level 1=$10, 2=$25, 3=$50, 4=$100
            estimated_cost = {1: 10, 2: 25, 3: 50, 4: 100}.get(price_level, 25)
            day_total += estimated_cost
            
            if price_level >= 3:  # Expensive activities
                expensive_activities.append(activity)
        
        # Check for budget overrun
        if day_total > daily_budget * 1.3:  # 30% over budget
            tips.append({
                'type': 'budget',
                'message': f"💰 Budget alert: Day total (${day_total}) is {int((day_total/daily_budget-1)*100)}% over your daily budget (${daily_budget}).",
                'severity': 'medium',
                'action_type': 'suggest_alternatives',
                'action_data': {
                    'day_total': day_total,
                    'daily_budget': daily_budget,
                    'expensive_activities': [a.get('name') for a in expensive_activities]
                }
            })
    
    return tips

def _analyze_popularity_issues(itinerary):
    """Analyze popularity and suggest reservations."""
    tips = []
    
    for day in itinerary.get('days', []):
        for activity in day.get('activities', []):
            rating = activity.get('rating', 0)
            review_count = activity.get('user_ratings_total', 0)
            activity_type = activity.get('type', '').lower()
            
            # High-rated restaurants might need reservations
            if 'restaurant' in activity_type and rating >= 4.5 and review_count > 1000:
                tips.append({
                    'type': 'popularity',
                    'message': f"🍽️ '{activity.get('name')}' is highly rated ({rating}★, {review_count} reviews). Consider making a reservation.",
                    'severity': 'low',
                    'action_type': 'suggest_reservation',
                    'action_data': {
                        'activity_name': activity.get('name'),
                        'rating': rating,
                        'review_count': review_count
                    }
                })
            
            # Popular attractions might have long lines
            if any(attraction in activity_type for attraction in ['museum', 'attraction', 'landmark']) and rating >= 4.0 and review_count > 5000:
                tips.append({
                    'type': 'popularity',
                    'message': f"🎫 '{activity.get('name')}' is very popular. Consider booking tickets in advance to avoid long lines.",
                    'severity': 'medium',
                    'action_type': 'suggest_booking',
                    'action_data': {
                        'activity_name': activity.get('name'),
                        'rating': rating,
                        'review_count': review_count
                    }
                })
    
    return tips

def _analyze_accessibility_issues(itinerary, user_profile):
    """Analyze accessibility and special needs."""
    tips = []
    
    # Check for family-friendly considerations
    if user_profile.get('travel_style') == 'family':
        for day in itinerary.get('days', []):
            for activity in day.get('activities', []):
                activity_type = activity.get('type', '').lower()
                
                # Check for activities that might not be kid-friendly
                if any(adult in activity_type for adult in ['bar', 'nightclub', 'casino']):
                    tips.append({
                        'type': 'accessibility',
                        'message': f"👶 '{activity.get('name')}' might not be suitable for children. Consider family-friendly alternatives.",
                        'severity': 'medium',
                        'action_type': 'suggest_family_alternative',
                        'action_data': {
                            'activity_name': activity.get('name'),
                            'activity_type': activity_type
                        }
                    })
    
    # Check for mobility considerations
    if user_profile.get('mobility_needs'):
        for day in itinerary.get('days', []):
            for activity in day.get('activities', []):
                activity_type = activity.get('type', '').lower()
                
                if any(mobility_issue in activity_type for mobility_issue in ['hiking', 'climbing', 'stairs']):
                    tips.append({
                        'type': 'accessibility',
                        'message': f"♿ '{activity.get('name')}' might have accessibility challenges. Check for accessible alternatives.",
                        'severity': 'high',
                        'action_type': 'suggest_accessible_alternative',
                        'action_data': {
                            'activity_name': activity.get('name'),
                            'activity_type': activity_type
                        }
                    })
    
    return tips

def apply_tip_to_itinerary(itinerary, tip, user_profile):
    """Apply a tip to modify the itinerary."""
    import copy
    
    modified_itinerary = copy.deepcopy(itinerary)
    
    action_type = tip.get('action_type', '')
    action_data = tip.get('action_data', {})
    
    if action_type == 'reschedule_outdoor':
        return _apply_weather_reschedule(modified_itinerary, action_data)
    elif action_type == 'suggest_transport':
        return _apply_transport_suggestion(modified_itinerary, action_data)
    elif action_type == 'suggest_alternatives':
        return _apply_budget_alternatives(modified_itinerary, action_data, user_profile)
    elif action_type == 'suggest_reservation':
        return _apply_reservation_note(modified_itinerary, action_data)
    elif action_type == 'suggest_booking':
        return _apply_booking_note(modified_itinerary, action_data)
    elif action_type == 'suggest_family_alternative':
        return _apply_family_alternative(modified_itinerary, action_data)
    elif action_type == 'suggest_accessible_alternative':
        return _apply_accessible_alternative(modified_itinerary, action_data)
    else:
        return _apply_general_tip(modified_itinerary, tip)
    
    return modified_itinerary

def _apply_weather_reschedule(itinerary, action_data):
    """Apply weather rescheduling tip."""
    day_date = action_data.get('day_date')
    
    for day in itinerary.get('days', []):
        if day.get('date') == day_date:
            day['weather_note'] = f"⚠️ Weather alert: Consider rescheduling outdoor activities due to expected rain."
            day['suggested_changes'] = {
                'type': 'weather_reschedule',
                'outdoor_activities': action_data.get('outdoor_activities', []),
                'indoor_activities': action_data.get('indoor_activities', [])
            }
            break
    
    return itinerary

def _apply_transport_suggestion(itinerary, action_data):
    """Apply transportation suggestion tip."""
    if 'transportation_notes' not in itinerary:
        itinerary['transportation_notes'] = []
    
    itinerary['transportation_notes'].append({
        'from': action_data.get('from_activity'),
        'to': action_data.get('to_activity'),
        'time_gap': action_data.get('time_gap'),
        'suggestion': 'Consider booking transportation in advance for this tight connection.'
    })
    
    return itinerary

def _apply_budget_alternatives(itinerary, action_data, user_profile):
    """Apply budget alternatives tip."""
    if 'budget_notes' not in itinerary:
        itinerary['budget_notes'] = []
    
    itinerary['budget_notes'].append({
        'day_total': action_data.get('day_total'),
        'daily_budget': action_data.get('daily_budget'),
        'expensive_activities': action_data.get('expensive_activities', []),
        'suggestion': 'Consider cheaper alternatives for expensive activities to stay within budget.'
    })
    
    return itinerary

def _apply_reservation_note(itinerary, action_data):
    """Apply reservation note tip."""
    activity_name = action_data.get('activity_name')
    rating = action_data.get('rating')
    review_count = action_data.get('review_count')
    
    for day in itinerary.get('days', []):
        for activity in day.get('activities', []):
            if activity.get('name') == activity_name:
                activity['reservation_note'] = f"🍽️ Highly rated ({rating}★, {review_count} reviews) - Consider making a reservation."
                break
    
    return itinerary

def _apply_booking_note(itinerary, action_data):
    """Apply booking note tip."""
    activity_name = action_data.get('activity_name')
    rating = action_data.get('rating')
    review_count = action_data.get('review_count')
    
    for day in itinerary.get('days', []):
        for activity in day.get('activities', []):
            if activity.get('name') == activity_name:
                activity['booking_note'] = f"🎫 Very popular ({rating}★, {review_count} reviews) - Book tickets in advance to avoid lines."
                break
    
    return itinerary

def _apply_family_alternative(itinerary, action_data):
    """Apply family alternative tip."""
    activity_name = action_data.get('activity_name')
    
    for day in itinerary.get('days', []):
        for activity in day.get('activities', []):
            if activity.get('name') == activity_name:
                activity['family_note'] = "👶 This activity might not be suitable for children. Consider family-friendly alternatives."
                break
    
    return itinerary

def _apply_accessible_alternative(itinerary, action_data):
    """Apply accessible alternative tip."""
    activity_name = action_data.get('activity_name')
    
    for day in itinerary.get('days', []):
        for activity in day.get('activities', []):
            if activity.get('name') == activity_name:
                activity['accessibility_note'] = "♿ This activity might have accessibility challenges. Check for accessible alternatives."
                break
    
    return itinerary

def _apply_general_tip(itinerary, tip):
    """Apply a general tip note."""
    if 'ai_tips' not in itinerary:
        itinerary['ai_tips'] = []
    
    itinerary['ai_tips'].append({
        'message': tip.get('message'),
        'severity': tip.get('severity'),
        'type': tip.get('type')
    })
    
    return itinerary

class RecommendationEngine:
    def __init__(self):
        self.prisma = PrismaClient()
        
    def create_user_profile_hash(self, user_characteristics: Dict[str, Any]) -> str:
        """
        Create a non-reversible hash of user characteristics for profile matching.
        This ensures GDPR compliance by making it impossible to reverse-engineer user identities.
        """
        # Extract characteristics that define user profile
        characteristics = {
            'travel_style': user_characteristics.get('travel_style', 'unknown'),
            'budget_level': user_characteristics.get('budget_level', 'medium'),
            'pace': user_characteristics.get('pace', 'moderate'),
            'age_group': user_characteristics.get('age_group', 'unknown'),
            'group_size': user_characteristics.get('group_size', 'unknown'),
            'trip_duration': user_characteristics.get('trip_duration', 'unknown')
        }
        
        # Create a deterministic hash
        hash_string = json.dumps(characteristics, sort_keys=True)
        return hashlib.sha256(hash_string.encode()).hexdigest()
    
    async def get_collective_recommendations(self, user_profile: Dict[str, Any], location: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recommendations based on collective intelligence from similar users.
        This is the core collaborative filtering function.
        """
        try:
            # Create profile hash for the user
            profile_hash = self.create_user_profile_hash(user_profile)
            
            # Get recommendations from similar user profiles
            similar_recommendations = await self._get_similar_profile_recommendations(profile_hash, location, limit)
            
            # Get trending activities for the location
            trending_recommendations = await self._get_trending_recommendations(location, limit // 2)
            
            # Get segment-based recommendations
            segment_recommendations = await self._get_segment_recommendations(user_profile, location, limit // 2)
            
            # Combine and rank recommendations
            all_recommendations = self._combine_recommendations(
                similar_recommendations, 
                trending_recommendations, 
                segment_recommendations
            )
            
            # Add trust signals and social proof
            recommendations_with_signals = await self._add_trust_signals(all_recommendations, user_profile)
            
            return recommendations_with_signals[:limit]
            
        except Exception as e:
            logger.error(f"Error getting collective recommendations: {e}")
            return []
    
    async def _get_similar_profile_recommendations(self, profile_hash: str, location: str, limit: int) -> List[Dict[str, Any]]:
        """
        Get recommendations from users with similar profiles.
        """
        try:
            # Find similar profiles based on travel characteristics
            # We'll use the profile hash to find exact matches first, then similar ones
            similar_profiles = await self.prisma.anonymousUserProfile.findMany(
                where={
                    'OR': [
                        {'profileHash': profile_hash},
                        {
                            'travelStyle': 'budget',  # Default values - in real implementation, 
                            'budgetLevel': 'medium',   # you'd extract these from the profile hash
                            'pace': 'moderate'
                        }
                    ]
                },
                take=50  # Get a pool of similar profiles
            )
            
            if not similar_profiles:
                return []
            
            # Get top-rated activities from similar profiles
            profile_hashes = [p.profileHash for p in similar_profiles]
            
            recommendations = await self.prisma.anonymousActivityRating.findMany(
                where={
                    'profileHash': {'in': profile_hashes},
                    'destination': location
                },
                orderBy=[
                    {'averageRating': 'desc'},
                    {'popularityScore': 'desc'}
                ],
                take=limit * 2  # Get more to filter later
            )
            
            # Aggregate and rank recommendations
            activity_scores = {}
            for rec in recommendations:
                activity_id = rec.activityId
                if activity_id not in activity_scores:
                    activity_scores[activity_id] = {
                        'activityId': activity_id,
                        'activityName': rec.activityName,
                        'activityCategory': rec.activityCategory,
                        'averageRating': rec.averageRating,
                        'ratingCount': rec.ratingCount,
                        'popularityScore': rec.popularityScore,
                        'priceLevel': rec.priceLevel,
                        'similarProfileCount': 0,
                        'collectiveScore': 0.0
                    }
                
                activity_scores[activity_id]['similarProfileCount'] += 1
                # Weight by rating and popularity
                activity_scores[activity_id]['collectiveScore'] += (
                    rec.averageRating * 0.6 + 
                    rec.popularityScore * 0.4
                )
            
            # Normalize scores and sort
            for activity_id in activity_scores:
                activity_scores[activity_id]['collectiveScore'] /= activity_scores[activity_id]['similarProfileCount']
            
            sorted_recommendations = sorted(
                activity_scores.values(),
                key=lambda x: x['collectiveScore'],
                reverse=True
            )
            
            return sorted_recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error getting similar profile recommendations: {e}")
            return []
    
    async def _get_trending_recommendations(self, location: str, limit: int) -> List[Dict[str, Any]]:
        """
        Get trending activities for the location.
        """
        try:
            trending_activities = await self.prisma.anonymousTrendingActivity.findMany(
                where={
                    'destination': location
                },
                orderBy=[
                    {'trendScore': 'desc'},
                    {'popularityRank': 'asc'}
                ],
                take=limit
            )
            
            recommendations = []
            for activity in trending_activities:
                recommendations.append({
                    'activityId': activity.activityId,
                    'activityName': activity.activityName,
                    'activityCategory': activity.activityCategory,
                    'trendScore': activity.trendScore,
                    'growthRate': activity.growthRate,
                    'popularityRank': activity.popularityRank,
                    'seasonality': activity.seasonality,
                    'collectiveScore': activity.trendScore,
                    'trustSignal': f"🔥 Trending #{activity.popularityRank} in {location}"
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting trending recommendations: {e}")
            return []
    
    async def _get_segment_recommendations(self, user_profile: Dict[str, Any], location: str, limit: int) -> List[Dict[str, Any]]:
        """
        Get recommendations based on user segments (Foodies, Luxury Travelers, etc.).
        """
        try:
            # Determine which segments the user belongs to
            user_segments = self._identify_user_segments(user_profile)
            
            if not user_segments:
                return []
            
            # Get recommendations from relevant segments
            segment_recommendations = await self.prisma.anonymousUserSegment.findMany(
                where={
                    'segmentName': {'in': user_segments},
                    'destination': {'in': [location, 'global']}
                }
            )
            
            recommendations = []
            for segment in segment_recommendations:
                top_activities = json.loads(segment.topActivities)
                
                # Get activity details
                for activity_id in top_activities[:limit // len(user_segments)]:
                    activity_details = await self.prisma.anonymousActivityRating.findFirst(
                        where={
                            'activityId': activity_id,
                            'destination': location
                        }
                    )
                    
                    if activity_details:
                        recommendations.append({
                            'activityId': activity_id,
                            'activityName': activity_details.activityName,
                            'activityCategory': activity_details.activityCategory,
                            'averageRating': activity_details.averageRating,
                            'ratingCount': activity_details.ratingCount,
                            'collectiveScore': activity_details.averageRating,
                            'trustSignal': f"⭐ Highly rated by {segment.segmentName}",
                            'segmentName': segment.segmentName
                        })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting segment recommendations: {e}")
            return []
    
    def _identify_user_segments(self, user_profile: Dict[str, Any]) -> List[str]:
        """
        Identify which user segments the user belongs to.
        """
        segments = []
        
        travel_style = user_profile.get('travel_style', 'budget')
        budget_level = user_profile.get('budget_level', 'medium')
        interests = user_profile.get('interests', [])
        
        # Check for specific segments
        if any(interest in ['restaurant', 'food', 'culinary'] for interest in interests):
            segments.append('Foodies')
        
        if budget_level == 'high' and travel_style == 'luxury':
            segments.append('Luxury Travelers')
        
        if budget_level == 'low' and travel_style == 'budget':
            segments.append('Budget Backpackers')
        
        if travel_style == 'cultural':
            segments.append('Cultural Explorers')
        
        if travel_style == 'adventure':
            segments.append('Adventure Seekers')
        
        return segments
    
    def _combine_recommendations(self, similar_recs: List[Dict], trending_recs: List[Dict], segment_recs: List[Dict]) -> List[Dict]:
        """
        Combine and rank recommendations from different sources.
        """
        # Create a combined scoring system
        all_recommendations = {}
        
        # Add similar profile recommendations
        for rec in similar_recs:
            activity_id = rec['activityId']
            if activity_id not in all_recommendations:
                all_recommendations[activity_id] = rec.copy()
                all_recommendations[activity_id]['finalScore'] = rec.get('collectiveScore', 0) * 0.5
            else:
                all_recommendations[activity_id]['finalScore'] += rec.get('collectiveScore', 0) * 0.5
        
        # Add trending recommendations
        for rec in trending_recs:
            activity_id = rec['activityId']
            if activity_id not in all_recommendations:
                all_recommendations[activity_id] = rec.copy()
                all_recommendations[activity_id]['finalScore'] = rec.get('collectiveScore', 0) * 0.3
            else:
                all_recommendations[activity_id]['finalScore'] += rec.get('collectiveScore', 0) * 0.3
        
        # Add segment recommendations
        for rec in segment_recs:
            activity_id = rec['activityId']
            if activity_id not in all_recommendations:
                all_recommendations[activity_id] = rec.copy()
                all_recommendations[activity_id]['finalScore'] = rec.get('collectiveScore', 0) * 0.2
            else:
                all_recommendations[activity_id]['finalScore'] += rec.get('collectiveScore', 0) * 0.2
        
        # Sort by final score
        sorted_recommendations = sorted(
            all_recommendations.values(),
            key=lambda x: x['finalScore'],
            reverse=True
        )
        
        return sorted_recommendations
    
    async def _add_trust_signals(self, recommendations: List[Dict], user_profile: Dict[str, Any]) -> List[Dict]:
        """
        Add trust signals and social proof to recommendations.
        """
        for rec in recommendations:
            # Add trust signals based on different factors
            trust_signals = []
            
            # Rating-based signals
            if rec.get('averageRating', 0) >= 4.5:
                trust_signals.append("⭐ Excellent rating")
            elif rec.get('averageRating', 0) >= 4.0:
                trust_signals.append("👍 Highly rated")
            
            # Popularity-based signals
            if rec.get('ratingCount', 0) >= 100:
                trust_signals.append("🔥 Very popular")
            elif rec.get('ratingCount', 0) >= 50:
                trust_signals.append("📈 Popular choice")
            
            # Segment-based signals
            if rec.get('trustSignal'):
                trust_signals.append(rec['trustSignal'])
            
            # Trending signals
            if rec.get('trendScore', 0) > 0.7:
                trust_signals.append("📈 Trending now")
            
            # Price-based signals
            if rec.get('priceLevel') == 1:
                trust_signals.append("💰 Great value")
            elif rec.get('priceLevel') == 4:
                trust_signals.append("💎 Premium experience")
            
            # Combine trust signals
            rec['trustSignals'] = trust_signals
            rec['primaryTrustSignal'] = trust_signals[0] if trust_signals else "Recommended"
        
        return recommendations
    
    async def get_activity_correlations(self, activity_id: str, location: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get activities that are frequently enjoyed together with the given activity.
        """
        try:
            correlations = await self.prisma.anonymousActivityCorrelation.findMany(
                where={
                    'OR': [
                        {'activityId1': activity_id},
                        {'activityId2': activity_id}
                    ],
                    'destination': location
                },
                orderBy={'correlationScore': 'desc'},
                take=limit
            )
            
            correlated_activities = []
            for corr in correlations:
                # Determine which activity is the correlated one
                if corr.activityId1 == activity_id:
                    correlated_id = corr.activityId2
                else:
                    correlated_id = corr.activityId1
                
                # Get activity details
                activity_details = await self.prisma.anonymousActivityRating.findFirst(
                    where={
                        'activityId': correlated_id,
                        'destination': location
                    }
                )
                
                if activity_details:
                    correlated_activities.append({
                        'activityId': correlated_id,
                        'activityName': activity_details.activityName,
                        'activityCategory': activity_details.activityCategory,
                        'correlationScore': corr.correlationScore,
                        'coOccurrenceCount': corr.coOccurrenceCount,
                        'trustSignal': f"🎯 Often enjoyed together"
                    })
            
            return correlated_activities
            
        except Exception as e:
            logger.error(f"Error getting activity correlations: {e}")
            return []
    
    async def get_personalized_recommendations(self, user_id: str, location: str, user_preferences: Dict[str, Any], limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get personalized recommendations combining content-based and collaborative filtering.
        """
        try:
            # Get collaborative filtering recommendations
            collective_recs = await self.get_collective_recommendations(user_preferences, location, limit)
            
            # Get content-based recommendations (existing logic)
            content_recs = await self._get_content_based_recommendations(user_id, location, limit)
            
            # Blend recommendations
            blended_recs = self._blend_recommendations(collective_recs, content_recs, limit)
            
            return blended_recs
            
        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {e}")
            return []
    
    async def _get_content_based_recommendations(self, user_id: str, location: str, limit: int) -> List[Dict[str, Any]]:
        """
        Get content-based recommendations based on user's past behavior.
        """
        try:
            # Get user's past ratings and preferences
            user_feedback = await self.prisma.userFeedback.findMany(
                where={
                    'userId': user_id,
                    'rating': {'not': None}
                },
                orderBy={'createdAt': 'desc'},
                take=50
            )
            
            if not user_feedback:
                return []
            
            # Extract user preferences
            user_categories = [fb.category for fb in user_feedback if fb.category]
            user_price_levels = [fb.priceLevel for fb in user_feedback if fb.priceLevel is not None]
            
            # Find similar activities in the target location
            similar_activities = await self.prisma.anonymousActivityRating.findMany(
                where={
                    'destination': location,
                    'activityCategory': {'in': user_categories} if user_categories else None
                },
                orderBy={'averageRating': 'desc'},
                take=limit
            )
            
            recommendations = []
            for activity in similar_activities:
                # Calculate similarity score based on category and price level
                category_match = 1.0 if activity.activityCategory in user_categories else 0.5
                price_match = 1.0 if activity.priceLevel in user_price_levels else 0.7
                
                similarity_score = (category_match + price_match) / 2
                
                recommendations.append({
                    'activityId': activity.activityId,
                    'activityName': activity.activityName,
                    'activityCategory': activity.activityCategory,
                    'averageRating': activity.averageRating,
                    'similarityScore': similarity_score,
                    'trustSignal': f"🎯 Matches your interests"
                })
            
            return sorted(recommendations, key=lambda x: x['similarityScore'], reverse=True)
            
        except Exception as e:
            logger.error(f"Error getting content-based recommendations: {e}")
            return []
    
    def _blend_recommendations(self, collective_recs: List[Dict], content_recs: List[Dict], limit: int) -> List[Dict]:
        """
        Blend collaborative filtering and content-based recommendations.
        """
        # Create activity lookup
        activity_lookup = {}
        
        # Add collaborative filtering recommendations
        for i, rec in enumerate(collective_recs):
            activity_id = rec['activityId']
            activity_lookup[activity_id] = rec.copy()
            activity_lookup[activity_id]['finalScore'] = rec.get('finalScore', 0) * 0.7  # Weight collaborative filtering higher
            activity_lookup[activity_id]['source'] = 'collective'
        
        # Add content-based recommendations
        for i, rec in enumerate(content_recs):
            activity_id = rec['activityId']
            if activity_id in activity_lookup:
                # Combine scores
                activity_lookup[activity_id]['finalScore'] += rec.get('similarityScore', 0) * 0.3
                activity_lookup[activity_id]['source'] = 'blended'
            else:
                activity_lookup[activity_id] = rec.copy()
                activity_lookup[activity_id]['finalScore'] = rec.get('similarityScore', 0) * 0.3
                activity_lookup[activity_id]['source'] = 'content'
        
        # Sort by final score
        blended_recs = sorted(
            activity_lookup.values(),
            key=lambda x: x['finalScore'],
            reverse=True
        )
        
        return blended_recs[:limit]
    
    async def get_recommendation_explanation(self, activity_id: str, user_profile: Dict[str, Any], location: str) -> str:
        """
        Generate an explanation for why an activity was recommended.
        """
        try:
            # Get activity details
            activity = await self.prisma.anonymousActivityRating.findFirst(
                where={
                    'activityId': activity_id,
                    'destination': location
                }
            )
            
            if not activity:
                return "This activity is popular in this location."
            
            # Generate explanation based on user profile
            explanations = []
            
            # Rating-based explanation
            if activity.averageRating >= 4.5:
                explanations.append(f"Rated {activity.averageRating:.1f}/5 by travelers like you")
            
            # Popularity-based explanation
            if activity.ratingCount >= 50:
                explanations.append(f"Loved by {activity.ratingCount} travelers")
            
            # Category-based explanation
            if activity.activityCategory in user_profile.get('interests', []):
                explanations.append(f"Matches your interest in {activity.activityCategory}")
            
            # Segment-based explanation
            user_segments = self._identify_user_segments(user_profile)
            if user_segments:
                explanations.append(f"Popular with {', '.join(user_segments)}")
            
            # Combine explanations
            if explanations:
                return " • ".join(explanations)
            else:
                return "Recommended based on collective traveler insights"
                
        except Exception as e:
            logger.error(f"Error generating recommendation explanation: {e}")
            return "Recommended based on traveler insights"

def main():
    """
    CLI interface for the recommendation engine.
    Expects JSON input via stdin and outputs JSON recommendations.
    """
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Initialize engine
        engine = ActivityRecommendationEngine()
        
        # Check if model exists and load it
        if engine.model_file.exists():
            try:
                engine.load_model()
                logger.info("Loaded existing model")
            except Exception as e:
                logger.warning(f"Failed to load existing model: {e}")
        
        # Process request
        if 'train' in input_data:
            # Training mode
            activities = input_data['activities']
            force_retrain = input_data.get('force_retrain', False)
            engine.train_content_based_model(activities, force_retrain)
            
            result = {
                'status': 'success',
                'message': 'Model trained successfully',
                'model_info': engine.get_model_info()
            }
            
        elif 'recommend' in input_data:
            # Recommendation mode
            user_profile = input_data['user_profile']
            activities = input_data['activities']
            top_n = input_data.get('top_n', 5)
            
            recommendations = engine.get_personalized_recommendations(user_profile, activities, top_n)
            
            result = {
                'status': 'success',
                'recommendations': [
                    {
                        'activity': activity,
                        'score': float(score)
                    }
                    for activity, score in recommendations
                ]
            }
            
        elif 'explain' in input_data:
            # Explanation mode
            activity = input_data['activity']
            user_profile = input_data['user_profile']
            decision_factors = input_data.get('decision_factors', {})
            
            explanation = generate_ai_explanation(activity, user_profile, decision_factors)
            
            result = {
                'status': 'success',
                'explanation': explanation
            }
            
        elif 'summary' in input_data:
            # Summary mode
            user_profile = input_data['user_profile']
            destination = input_data['destination']
            total_activities = input_data['total_activities']
            data_points = input_data.get('data_points', None)
            
            summary = generate_itinerary_summary(user_profile, destination, total_activities, data_points)
            
            result = {
                'status': 'success',
                'summary': summary
            }
            
        elif 'health_score' in input_data:
            # Health scoring mode
            itinerary = input_data['itinerary']
            user_profile = input_data['user_profile']
            
            health_score = calculate_itinerary_health_score(itinerary, user_profile)
            
            result = {
                'status': 'success',
                'health_score': health_score
            }
            
        elif 'auto_optimize' in input_data:
            # Auto-optimization mode
            itinerary = input_data['itinerary']
            user_profile = input_data['user_profile']
            available_activities = input_data['available_activities']
            max_iterations = input_data.get('max_iterations', 5)
            
            optimization_result = auto_optimize(itinerary, user_profile, available_activities, max_iterations)
            
            result = {
                'status': 'success',
                'optimization_result': optimization_result
            }
            
        elif 'proactive_tips' in input_data:
            # Proactive tips mode
            itinerary = input_data['itinerary']
            user_profile = input_data['user_profile']
            weather_forecast = input_data.get('weather_forecast', None)
            
            tips = generate_proactive_tips(itinerary, user_profile, weather_forecast)
            
            result = {
                'status': 'success',
                'proactive_tips': tips
            }
            
        elif 'apply_tip' in input_data:
            # Apply tip mode
            itinerary = input_data['itinerary']
            user_profile = input_data['user_profile']
            tip = input_data['tip']
            
            # Apply the tip to the itinerary
            modified_itinerary = apply_tip_to_itinerary(itinerary, tip, user_profile)
            
            result = {
                'status': 'success',
                'modified_itinerary': modified_itinerary,
                'applied_tip': tip
            }

        elif 'info' in input_data:
            # Info mode
            result = {
                'status': 'success',
                'model_info': engine.get_model_info()
            }
            
        else:
            result = {
                'status': 'error',
                'message': 'Invalid request. Use "train", "recommend", "explain", "summary", "health_score", "auto_optimize", "proactive_tips", "apply_tip", or "info"'
            }
        
        # Output result
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        logger.error(f"Error in main: {e}")
        result = {
            'status': 'error',
            'message': str(e)
        }
        print(json.dumps(result, indent=2))
        sys.exit(1)

if __name__ == '__main__':
    main()
