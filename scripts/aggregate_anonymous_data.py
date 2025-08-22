#!/usr/bin/env python3
"""
Nightly ETL script for aggregating anonymous user data for collaborative filtering.
This script ensures GDPR compliance by only working with anonymized, aggregated data.
"""

import os
import sys
import json
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import asyncio
import aiohttp

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/aggregate_anonymous_data.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AnonymousDataAggregator:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.engine = create_engine(db_url)
        
    def create_profile_hash(self, user_data: Dict) -> str:
        """
        Create a non-reversible hash of user characteristics for anonymization.
        This ensures GDPR compliance by making it impossible to reverse-engineer user identities.
        """
        # Extract characteristics that define user profile
        characteristics = {
            'travel_style': user_data.get('travel_style', 'unknown'),
            'budget_level': user_data.get('budget_level', 'medium'),
            'pace': user_data.get('pace', 'moderate'),
            'age_group': user_data.get('age_group', 'unknown'),
            'group_size': user_data.get('group_size', 'unknown'),
            'trip_duration': user_data.get('trip_duration', 'unknown')
        }
        
        # Create a deterministic hash
        hash_string = json.dumps(characteristics, sort_keys=True)
        return hashlib.sha256(hash_string.encode()).hexdigest()
    
    def extract_user_profiles(self) -> pd.DataFrame:
        """
        Extract and anonymize user profile data from the database.
        """
        logger.info("Extracting user profile data...")
        
        query = """
        SELECT 
            u.id,
            u.subscriptionTier,
            u.createdAt,
            -- Extract travel preferences from trips
            COUNT(t.id) as trip_count,
            AVG(JULIANDAY(t.endDate) - JULIANDAY(t.startDate)) as avg_trip_duration,
            -- Extract budget preferences from activities
            AVG(uf.priceLevel) as avg_price_level,
            -- Extract interests from feedback
            GROUP_CONCAT(DISTINCT uf.category) as interests,
            -- Extract travel patterns
            COUNT(DISTINCT t.destination) as destinations_visited
        FROM users u
        LEFT JOIN trips t ON u.id = t.creatorId
        LEFT JOIN user_feedback uf ON u.id = uf.userId
        WHERE u.createdAt >= DATE('now', '-90 days')  -- Only recent data
        GROUP BY u.id
        HAVING trip_count > 0  -- Only users with actual trips
        """
        
        df = pd.read_sql(query, self.engine)
        
        # Anonymize the data
        df['profile_hash'] = df.apply(self.create_profile_hash, axis=1)
        
        # Determine travel characteristics
        df['travel_style'] = df.apply(self.determine_travel_style, axis=1)
        df['budget_level'] = df.apply(self.determine_budget_level, axis=1)
        df['pace'] = df.apply(self.determine_pace, axis=1)
        df['age_group'] = 'unknown'  # We don't collect age data
        df['group_size'] = 'unknown'  # We don't collect group size data
        df['trip_duration'] = df.apply(self.determine_trip_duration, axis=1)
        
        # Remove identifiable columns
        df = df.drop(['id'], axis=1)
        
        logger.info(f"Extracted {len(df)} anonymous user profiles")
        return df
    
    def determine_travel_style(self, row: pd.Series) -> str:
        """Determine travel style based on user behavior."""
        interests = str(row.get('interests', '')).lower()
        
        if 'museum' in interests or 'cultural' in interests:
            return 'cultural'
        elif 'adventure' in interests or 'hiking' in interests:
            return 'adventure'
        elif 'spa' in interests or 'relaxation' in interests:
            return 'relaxation'
        elif 'luxury' in interests or row.get('subscriptionTier') == 'business':
            return 'luxury'
        else:
            return 'budget'
    
    def determine_budget_level(self, row: pd.Series) -> str:
        """Determine budget level based on average price level."""
        avg_price = row.get('avg_price_level', 2)
        
        if avg_price >= 3:
            return 'high'
        elif avg_price <= 1:
            return 'low'
        else:
            return 'medium'
    
    def determine_pace(self, row: pd.Series) -> str:
        """Determine travel pace based on trip duration and activity count."""
        avg_duration = row.get('avg_trip_duration', 7)
        trip_count = row.get('trip_count', 1)
        
        if avg_duration <= 3 and trip_count > 2:
            return 'fast'
        elif avg_duration >= 14:
            return 'slow'
        else:
            return 'moderate'
    
    def determine_trip_duration(self, row: pd.Series) -> str:
        """Determine typical trip duration."""
        avg_duration = row.get('avg_trip_duration', 7)
        
        if avg_duration <= 3:
            return 'weekend'
        elif avg_duration <= 7:
            return 'week'
        else:
            return 'extended'
    
    def extract_activity_ratings(self) -> pd.DataFrame:
        """
        Extract and aggregate activity ratings by user profile.
        """
        logger.info("Extracting activity ratings...")
        
        query = """
        SELECT 
            u.id,
            uf.activityId,
            uf.activityName,
            uf.category as activityCategory,
            t.destination,
            uf.rating,
            uf.priceLevel,
            uf.createdAt
        FROM users u
        JOIN trips t ON u.id = t.creatorId
        JOIN user_feedback uf ON u.id = uf.userId
        WHERE uf.rating IS NOT NULL
        AND uf.rating > 0
        AND uf.createdAt >= DATE('now', '-90 days')
        """
        
        df = pd.read_sql(query, self.engine)
        
        if df.empty:
            logger.warning("No activity ratings found")
            return pd.DataFrame()
        
        # Add profile hash
        df['profile_hash'] = df.apply(self.create_profile_hash, axis=1)
        
        # Aggregate ratings by profile and activity
        aggregated = df.groupby(['profile_hash', 'activityId', 'activityName', 'activityCategory', 'destination']).agg({
            'rating': ['mean', 'count'],
            'priceLevel': 'mean'
        }).reset_index()
        
        # Flatten column names
        aggregated.columns = ['profile_hash', 'activityId', 'activityName', 'activityCategory', 'destination', 
                            'averageRating', 'ratingCount', 'priceLevel']
        
        # Calculate popularity score (normalized rating count)
        max_count = aggregated['ratingCount'].max()
        aggregated['popularityScore'] = aggregated['ratingCount'] / max_count if max_count > 0 else 0
        
        # Remove identifiable columns
        aggregated = aggregated.drop(['id'], axis=1, errors='ignore')
        
        logger.info(f"Extracted {len(aggregated)} activity ratings")
        return aggregated
    
    def calculate_activity_correlations(self, ratings_df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate correlations between activities based on user preferences.
        """
        logger.info("Calculating activity correlations...")
        
        if ratings_df.empty:
            return pd.DataFrame()
        
        # Create user-activity matrix
        matrix = ratings_df.pivot_table(
            index='profile_hash',
            columns='activityId',
            values='averageRating',
            fill_value=0
        )
        
        # Calculate correlation matrix
        correlation_matrix = matrix.corr()
        
        # Convert to long format
        correlations = []
        for activity1 in correlation_matrix.index:
            for activity2 in correlation_matrix.columns:
                if activity1 != activity2:
                    corr_value = correlation_matrix.loc[activity1, activity2]
                    if not np.isnan(corr_value) and corr_value > 0.1:  # Only significant correlations
                        correlations.append({
                            'activityId1': activity1,
                            'activityId2': activity2,
                            'correlationScore': corr_value,
                            'coOccurrenceCount': len(matrix[(matrix[activity1] > 0) & (matrix[activity2] > 0)]),
                            'confidenceLevel': min(abs(corr_value), 1.0)
                        })
        
        # Add destination information
        activity_destinations = ratings_df[['activityId', 'destination']].drop_duplicates()
        correlations_df = pd.DataFrame(correlations)
        
        if not correlations_df.empty:
            correlations_df = correlations_df.merge(activity_destinations, left_on='activityId1', right_on='activityId')
            correlations_df = correlations_df.drop('activityId', axis=1)
        
        logger.info(f"Calculated {len(correlations_df)} activity correlations")
        return correlations_df
    
    def identify_trending_activities(self, ratings_df: pd.DataFrame) -> pd.DataFrame:
        """
        Identify trending activities based on recent popularity changes.
        """
        logger.info("Identifying trending activities...")
        
        if ratings_df.empty:
            return pd.DataFrame()
        
        # Group by activity and time period
        ratings_df['month'] = pd.to_datetime(ratings_df['createdAt']).dt.to_period('M')
        
        monthly_stats = ratings_df.groupby(['activityId', 'activityName', 'activityCategory', 'destination', 'month']).agg({
            'ratingCount': 'sum',
            'averageRating': 'mean'
        }).reset_index()
        
        # Calculate growth rate
        trending_activities = []
        
        for activity_id in monthly_stats['activityId'].unique():
            activity_data = monthly_stats[monthly_stats['activityId'] == activity_id]
            
            if len(activity_data) >= 2:
                # Sort by month
                activity_data = activity_data.sort_values('month')
                
                # Calculate growth rate
                recent_count = activity_data.iloc[-1]['ratingCount']
                previous_count = activity_data.iloc[-2]['ratingCount']
                
                if previous_count > 0:
                    growth_rate = (recent_count - previous_count) / previous_count
                    
                    # Calculate trend score (combination of growth and current popularity)
                    current_popularity = recent_count / monthly_stats['ratingCount'].max()
                    trend_score = (growth_rate + current_popularity) / 2
                    
                    if trend_score > 0.1:  # Only include trending activities
                        trending_activities.append({
                            'activityId': activity_id,
                            'activityName': activity_data.iloc[-1]['activityName'],
                            'activityCategory': activity_data.iloc[-1]['activityCategory'],
                            'destination': activity_data.iloc[-1]['destination'],
                            'trendScore': min(trend_score, 1.0),
                            'growthRate': growth_rate,
                            'seasonality': self.determine_seasonality(activity_data.iloc[-1]['month']),
                            'popularityRank': 0  # Will be calculated later
                        })
        
        trending_df = pd.DataFrame(trending_activities)
        
        # Calculate popularity rank within each destination
        if not trending_df.empty:
            trending_df['popularityRank'] = trending_df.groupby('destination')['trendScore'].rank(ascending=False, method='dense')
        
        logger.info(f"Identified {len(trending_df)} trending activities")
        return trending_df
    
    def determine_seasonality(self, month_period) -> Optional[str]:
        """Determine seasonality based on month."""
        month = month_period.month
        
        if month in [3, 4, 5]:
            return 'spring'
        elif month in [6, 7, 8]:
            return 'summer'
        elif month in [9, 10, 11]:
            return 'fall'
        elif month in [12, 1, 2]:
            return 'winter'
        else:
            return None
    
    def create_user_segments(self, profiles_df: pd.DataFrame, ratings_df: pd.DataFrame) -> pd.DataFrame:
        """
        Create user segments based on behavior patterns.
        """
        logger.info("Creating user segments...")
        
        if profiles_df.empty or ratings_df.empty:
            return pd.DataFrame()
        
        segments = []
        
        # Define segment criteria
        segment_definitions = {
            'Foodies': {
                'criteria': {'interests': ['restaurant', 'food', 'culinary']},
                'min_activities': 3
            },
            'Luxury Travelers': {
                'criteria': {'budget_level': 'high', 'travel_style': 'luxury'},
                'min_activities': 2
            },
            'Budget Backpackers': {
                'criteria': {'budget_level': 'low', 'travel_style': 'budget'},
                'min_activities': 2
            },
            'Cultural Explorers': {
                'criteria': {'travel_style': 'cultural'},
                'min_activities': 3
            },
            'Adventure Seekers': {
                'criteria': {'travel_style': 'adventure'},
                'min_activities': 2
            }
        }
        
        for segment_name, definition in segment_definitions.items():
            # Filter profiles that match segment criteria
            segment_profiles = profiles_df.copy()
            
            for criterion, value in definition['criteria'].items():
                if criterion == 'interests':
                    # Check if interests contain any of the specified keywords
                    mask = segment_profiles['interests'].str.contains('|'.join(value), case=False, na=False)
                    segment_profiles = segment_profiles[mask]
                else:
                    segment_profiles = segment_profiles[segment_profiles[criterion] == value]
            
            if len(segment_profiles) >= definition['min_activities']:
                # Get top activities for this segment
                segment_hashes = segment_profiles['profile_hash'].tolist()
                segment_ratings = ratings_df[ratings_df['profile_hash'].isin(segment_hashes)]
                
                if not segment_ratings.empty:
                    top_activities = segment_ratings.groupby('activityId').agg({
                        'averageRating': 'mean',
                        'ratingCount': 'sum'
                    }).sort_values('averageRating', ascending=False).head(10)
                    
                    segments.append({
                        'segmentName': segment_name,
                        'segmentCriteria': json.dumps(definition['criteria']),
                        'destination': 'global',  # We'll aggregate across destinations
                        'topActivities': json.dumps(top_activities.index.tolist()),
                        'averageRating': segment_ratings['averageRating'].mean(),
                        'segmentSize': len(segment_profiles)
                    })
        
        segments_df = pd.DataFrame(segments)
        logger.info(f"Created {len(segments_df)} user segments")
        return segments_df
    
    def save_anonymous_data(self, profiles_df: pd.DataFrame, ratings_df: pd.DataFrame, 
                          correlations_df: pd.DataFrame, trending_df: pd.DataFrame, 
                          segments_df: pd.DataFrame):
        """
        Save aggregated anonymous data to the database.
        """
        logger.info("Saving anonymous data to database...")
        
        try:
            # Clear existing data (replace with fresh data)
            with self.engine.connect() as conn:
                conn.execute(text("DELETE FROM anonymous_user_profiles"))
                conn.execute(text("DELETE FROM anonymous_activity_ratings"))
                conn.execute(text("DELETE FROM anonymous_activity_correlations"))
                conn.execute(text("DELETE FROM anonymous_trending_activities"))
                conn.execute(text("DELETE FROM anonymous_user_segments"))
                conn.commit()
            
            # Save new data
            if not profiles_df.empty:
                profiles_df.to_sql('anonymous_user_profiles', self.engine, if_exists='append', index=False)
            
            if not ratings_df.empty:
                ratings_df.to_sql('anonymous_activity_ratings', self.engine, if_exists='append', index=False)
            
            if not correlations_df.empty:
                correlations_df.to_sql('anonymous_activity_correlations', self.engine, if_exists='append', index=False)
            
            if not trending_df.empty:
                trending_df.to_sql('anonymous_trending_activities', self.engine, if_exists='append', index=False)
            
            if not segments_df.empty:
                segments_df.to_sql('anonymous_user_segments', self.engine, if_exists='append', index=False)
            
            logger.info("Successfully saved anonymous data to database")
            
        except Exception as e:
            logger.error(f"Error saving anonymous data: {e}")
            raise
    
    def run_aggregation(self):
        """
        Run the complete data aggregation process.
        """
        logger.info("Starting anonymous data aggregation...")
        
        try:
            # Extract and process data
            profiles_df = self.extract_user_profiles()
            ratings_df = self.extract_activity_ratings()
            
            if not profiles_df.empty and not ratings_df.empty:
                # Calculate derived metrics
                correlations_df = self.calculate_activity_correlations(ratings_df)
                trending_df = self.identify_trending_activities(ratings_df)
                segments_df = self.create_user_segments(profiles_df, ratings_df)
                
                # Save to database
                self.save_anonymous_data(profiles_df, ratings_df, correlations_df, trending_df, segments_df)
                
                logger.info("Anonymous data aggregation completed successfully")
                
                # Log summary statistics
                logger.info(f"Summary:")
                logger.info(f"  - Anonymous profiles: {len(profiles_df)}")
                logger.info(f"  - Activity ratings: {len(ratings_df)}")
                logger.info(f"  - Activity correlations: {len(correlations_df)}")
                logger.info(f"  - Trending activities: {len(trending_df)}")
                logger.info(f"  - User segments: {len(segments_df)}")
            else:
                logger.warning("No data available for aggregation")
                
        except Exception as e:
            logger.error(f"Error during aggregation: {e}")
            raise

def main():
    """Main function to run the aggregation script."""
    # Get database URL from environment
    db_url = os.getenv('DATABASE_URL', 'sqlite:///./dev.db')
    
    # Create aggregator and run
    aggregator = AnonymousDataAggregator(db_url)
    aggregator.run_aggregation()

if __name__ == "__main__":
    main()
