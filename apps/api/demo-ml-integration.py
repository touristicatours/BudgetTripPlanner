#!/usr/bin/env python3
"""
Demo script showing the ML recommendation engine in action.
This demonstrates the complete flow from user preferences to ranked recommendations.
"""

import json
import sys
import os

# Add the ai directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai'))

from recommendation_engine import ActivityRecommendationEngine

def demo_ml_recommendations():
    """Demonstrate the ML recommendation engine with sample data."""
    
    print("🤖 ML Recommendation Engine Demo")
    print("=" * 50)
    
    # Sample user profile
    user_profile = {
        'interests': ['art', 'food', 'culture'],
        'budget': 2,  # Moderate budget
        'pace': 'moderate',
        'group_size': 2
    }
    
    print(f"👤 User Profile:")
    print(f"   Interests: {', '.join(user_profile['interests'])}")
    print(f"   Budget: {user_profile['budget']}/4 (moderate)")
    print(f"   Pace: {user_profile['pace']}")
    print(f"   Group Size: {user_profile['group_size']}")
    print()
    
    # Sample activities (simulating Google Places API data)
    sample_activities = [
        {
            'id': 'louvre_museum',
            'name': 'Musée du Louvre',
            'types': ['museum', 'art_gallery', 'establishment'],
            'rating': 4.7,
            'price_level': 3,
            'user_ratings_total': 8900,
            'address': 'Rue de Rivoli, 75001 Paris, France',
            'location': {'lat': 48.8606, 'lng': 2.3376},
            'photo_reference': 'louvre_photo_ref'
        },
        {
            'id': 'french_restaurant',
            'name': 'Le Petit Bistrot',
            'types': ['restaurant', 'food', 'establishment'],
            'rating': 4.5,
            'price_level': 2,
            'user_ratings_total': 1250,
            'address': '123 Rue de la Paix, 75001 Paris, France',
            'location': {'lat': 48.8566, 'lng': 2.3522},
            'photo_reference': 'restaurant_photo_ref'
        },
        {
            'id': 'tuileries_garden',
            'name': 'Jardin des Tuileries',
            'types': ['park', 'point_of_interest'],
            'rating': 4.3,
            'price_level': 0,
            'user_ratings_total': 3200,
            'address': 'Place de la Concorde, 75001 Paris, France',
            'location': {'lat': 48.8550, 'lng': 2.3500}
        },
        {
            'id': 'shopping_mall',
            'name': 'Forum des Halles',
            'types': ['shopping_mall', 'establishment'],
            'rating': 3.8,
            'price_level': 2,
            'user_ratings_total': 950,
            'address': '101 Porte Berger, 75001 Paris, France',
            'location': {'lat': 48.8619, 'lng': 2.3467}
        },
        {
            'id': 'art_gallery',
            'name': 'Galerie d\'Art Moderne',
            'types': ['art_gallery', 'establishment'],
            'rating': 4.2,
            'price_level': 1,
            'user_ratings_total': 420,
            'address': '78 Rue de la Culture, 75002 Paris, France',
            'location': {'lat': 48.8580, 'lng': 2.3410}
        },
        {
            'id': 'expensive_restaurant',
            'name': 'Restaurant Gastronomique',
            'types': ['restaurant', 'food', 'establishment'],
            'rating': 4.8,
            'price_level': 4,
            'user_ratings_total': 670,
            'address': '456 Avenue de Luxe, 75008 Paris, France',
            'location': {'lat': 48.8700, 'lng': 2.3100}
        }
    ]
    
    print(f"🏛️ Available Activities ({len(sample_activities)}):")
    for i, activity in enumerate(sample_activities, 1):
        price_indicator = '$' * (activity.get('price_level', 1) + 1)
        print(f"   {i}. {activity['name']}")
        print(f"      Types: {', '.join(activity['types'][:2])}")
        print(f"      Rating: {activity['rating']}★ ({activity['user_ratings_total']} reviews)")
        print(f"      Price: {price_indicator}")
        print()
    
    # Create recommendation engine and get recommendations
    print("🔄 Processing with ML Recommendation Engine...")
    print("   - Extracting features from activities")
    print("   - Training content-based model with TF-IDF and cosine similarity")
    print("   - Creating user preference vector")
    print("   - Calculating personalized similarity scores")
    print("   - Applying preference-based boosting")
    print()
    
    engine = ActivityRecommendationEngine()
    
    try:
        recommendations = engine.get_personalized_recommendations(
            user_profile, 
            sample_activities, 
            top_n=5
        )
        
        print("🎯 ML-Powered Recommendations (Ranked by Personalization Score):")
        print("-" * 60)
        
        for i, (activity, score) in enumerate(recommendations, 1):
            # Determine why this was recommended
            reasons = []
            activity_types = [t.lower() for t in activity['types']]
            
            if any(interest in ['art', 'culture'] for interest in user_profile['interests']):
                if any(t in ['museum', 'art_gallery'] for t in activity_types):
                    reasons.append("matches art/culture interest")
            
            if 'food' in user_profile['interests'] and 'restaurant' in activity_types:
                reasons.append("matches food interest")
            
            if activity.get('price_level', 1) <= user_profile['budget']:
                reasons.append("fits budget")
            
            if activity.get('rating', 0) >= 4.0:
                reasons.append("highly rated")
            
            price_indicator = '$' * (activity.get('price_level', 1) + 1)
            
            print(f"   {i}. {activity['name']} (Score: {score:.3f})")
            print(f"      📍 {activity['address']}")
            print(f"      ⭐ {activity['rating']}★ | 💰 {price_indicator} | 📝 {activity['user_ratings_total']} reviews")
            if reasons:
                print(f"      🎯 Why recommended: {', '.join(reasons)}")
            print()
        
        print("✅ ML Recommendation Demo Complete!")
        print()
        print("🔍 Key ML Features Demonstrated:")
        print("   ✓ Content-based filtering with TF-IDF vectorization")
        print("   ✓ Multi-feature analysis (text, categorical, numerical)")
        print("   ✓ User preference matching with cosine similarity")
        print("   ✓ Interest-based activity ranking")
        print("   ✓ Budget and quality considerations")
        print("   ✓ Sophisticated scoring with multiple boosting factors")
        
    except Exception as e:
        print(f"❌ Error in ML recommendation engine: {e}")
        print("This might happen if scikit-learn dependencies are not installed.")
        print("Run './setup-ml.sh' to install required dependencies.")

if __name__ == '__main__':
    demo_ml_recommendations()
