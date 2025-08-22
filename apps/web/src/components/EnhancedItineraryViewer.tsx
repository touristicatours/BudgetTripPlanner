"use client";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { downloadJSON, copy, compressToParam } from "@/lib/share";
import TripMap from "./TripMap";
import { Star, ThumbsUp, ThumbsDown, RefreshCw, MapPin, Users, Euro } from "lucide-react";
import { AIExplanationTooltip } from "@/components/AIExplanationTooltip";
import { ItinerarySummary } from "@/components/ItinerarySummary";
import ProactiveTipsSection from '@/components/ProactiveTipsSection';
import FeatureGuard from '@/components/FeatureGuard';
import UsageTracker from '@/components/UsageTracker';
import { useSubscription } from '@/components/SubscriptionProvider';

interface Activity {
  timeOfDay?: string;
  name: string;
  note?: string;
  category?: string;
  cost?: string;
  link?: string;
  // New ML-powered data fields
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  placeId?: string;
  address?: string;
  lat?: number;
  lng?: number;
  mlScore?: number;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

interface EnhancedItineraryViewerProps {
  form: any;
  itinerary: ItineraryDay[];
  tripId?: string;
}

export default function EnhancedItineraryViewer({ form, itinerary, tripId }: EnhancedItineraryViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState<string | null>(null);
  const { userTier, isActive, usageStats } = useSubscription();

  async function exportPDF() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    const r = Math.min(W / canvas.width, H / canvas.height);
    const w = canvas.width * r, h = canvas.height * r;
    pdf.addImage(img, "PNG", (W - w) / 2, 24, w, h);
    pdf.save(`itinerary-${form.destination}.pdf`);
  }

  async function shareLink() {
    const p = compressToParam({ form, itinerary });
    const url = `${location.origin}/plan?p=${p}`;
    await copy(url);
    alert("Share link copied!");
  }

  async function refreshRecommendations() {
    if (!tripId || refreshing) return;
    
    setRefreshing(true);
    try {
      const response = await fetch(`/api/itinerary/${tripId}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form })
      });
      
      if (response.ok) {
        const newItinerary = await response.json();
        // Update the itinerary in the parent component
        window.location.reload(); // Simple refresh for demo
      } else {
        console.error('Failed to refresh recommendations');
      }
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    } finally {
      setRefreshing(false);
    }
  }

  async function submitFeedback(activityId: string, feedback: 'positive' | 'negative') {
    if (feedbackSubmitting) return;
    
    setFeedbackSubmitting(activityId);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          activityId,
          feedback,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        // Show success feedback
        const button = document.querySelector(`[data-feedback="${activityId}"]`);
        if (button) {
          button.classList.add('bg-green-100', 'text-green-700');
          setTimeout(() => {
            button.classList.remove('bg-green-100', 'text-green-700');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setFeedbackSubmitting(null);
    }
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  const renderPriceLevel = (priceLevel: number) => {
    const levels = ['Free', '€', '€€', '€€€', '€€€€'];
    return levels[priceLevel] || 'N/A';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'culture': '🏛️',
      'food': '🍽️',
      'shopping': '🛍️',
      'nature': '🌳',
      'relaxation': '😌',
      'nightlife': '🌙',
      'must-see': '⭐',
      'sightseeing': '👁️',
      'activity': '🎯'
    };
    return icons[category] || '📍';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'culture': 'bg-blue-100 text-blue-800',
      'food': 'bg-red-100 text-red-800',
      'shopping': 'bg-purple-100 text-purple-800',
      'nature': 'bg-green-100 text-green-800',
      'relaxation': 'bg-yellow-100 text-yellow-800',
      'nightlife': 'bg-indigo-100 text-indigo-800',
      'must-see': 'bg-orange-100 text-orange-800',
      'sightseeing': 'bg-teal-100 text-teal-800',
      'activity': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleTipApplied = (modifiedItinerary: any, tip: any) => {
    // This function is not directly used in the current EnhancedItineraryViewer
    // but is part of the new_code. It would be called by ProactiveTipsSection
    // if it were integrated.
    console.log("Tip applied:", tip.message);
    // For now, we'll just log it.
  };

  return (
    <div>
      {/* Usage Tracker */}
      <div className="mb-6">
        <UsageTracker
          userId="demo-user"
          usageStats={usageStats}
          userTier={userTier}
          isActive={isActive}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={() => downloadJSON(`itinerary-${form.destination}.json`, { form, itinerary })} 
            className="border rounded-md px-3 py-1 bg-white hover:bg-gray-50 transition-colors"
          >
            Download JSON
          </button>
          <button 
            onClick={shareLink} 
            className="border rounded-md px-3 py-1 bg-white hover:bg-gray-50 transition-colors"
          >
            Copy share link
          </button>
          <FeatureGuard feature="api_export">
            <button 
              onClick={exportPDF} 
              className="border rounded-md px-3 py-1 bg-white hover:bg-gray-50 transition-colors"
            >
              Export PDF
            </button>
          </FeatureGuard>
        </div>
        
        {tripId && (
          <FeatureGuard feature="ai_recommendations">
            <button
              onClick={refreshRecommendations}
              disabled={refreshing}
              className="flex items-center gap-2 border rounded-md px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Recommendations'}
            </button>
          </FeatureGuard>
        )}
      </div>

      <div ref={ref} className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{form.destination}</h2>
          <p className="text-lg text-gray-600">
            {form.startDate} – {form.endDate} • {form.travelers} traveler{form.travelers > 1 ? "s" : ""}
          </p>
          {form.budget && (
            <p className="text-sm text-gray-500 mt-1">
              Budget: {form.budget} {form.currency} • Pace: {form.pace}
            </p>
          )}
        </div>
        
        {/* Trip Map */}
        <TripMap 
          destination={form.destination} 
          itinerary={itinerary}
        />
        
        {/* AI Itinerary Summary */}
        <ItinerarySummary
          userProfile={{
            interests: form.interests || [],
            budget: form.budget,
            pace: form.pace,
            userId: 'user-' + Date.now()
          }}
          destination={form.destination}
          totalActivities={itinerary.reduce((total, day) => total + day.activities.length, 0)}
          dataPoints={12500} // Example data points
        />
        
        {/* Enhanced Itinerary Display */}
        {itinerary?.map((day: ItineraryDay, i: number) => (
          <div key={i} className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{day.title}</h3>
                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                  Day {day.day}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {day.activities?.map((activity: Activity, j: number) => (
                  <div key={j} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg">{getCategoryIcon(activity.category || '')}</span>
                          <span className="text-xs text-gray-400 w-16">{activity.timeOfDay || ""}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category || '')}`}>
                            {activity.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{activity.name}</h4>
                          <AIExplanationTooltip
                            activity={activity}
                            userProfile={{
                              interests: form.interests || [],
                              budget: form.budget,
                              pace: form.pace,
                              userId: 'user-' + Date.now() // Fallback user ID
                            }}
                            decisionFactors={{
                              ml_score: activity.mlScore
                            }}
                            size="sm"
                          />
                        </div>
                        
                        {/* ML-Powered Data Display */}
                        {(activity.rating || activity.user_ratings_total || activity.price_level) && (
                          <div className="flex items-center gap-4 mb-3 text-sm">
                            {activity.rating && (
                              <div className="flex items-center gap-1">
                                {renderStars(activity.rating)}
                                <span className="text-gray-600 ml-1">({activity.rating})</span>
                              </div>
                            )}
                            
                            {activity.user_ratings_total && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{activity.user_ratings_total.toLocaleString()} reviews</span>
                              </div>
                            )}
                            
                            {activity.price_level !== undefined && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Euro className="w-4 h-4" />
                                <span>{renderPriceLevel(activity.price_level)}</span>
                              </div>
                            )}
                            
                            {activity.mlScore && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <span className="text-xs font-medium">ML Score: {activity.mlScore.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Address */}
                        {activity.address && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{activity.address}</span>
                          </div>
                        )}
                        
                        {/* Notes and Cost */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {activity.note && (
                              <p className="text-sm text-gray-600">{activity.note}</p>
                            )}
                          </div>
                          {activity.cost && (
                            <span className="text-sm font-medium text-green-600 ml-4">
                              {activity.cost}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Feedback Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => submitFeedback(activity.placeId || `${i}-${j}`, 'positive')}
                          disabled={feedbackSubmitting === (activity.placeId || `${i}-${j}`)}
                          data-feedback={activity.placeId || `${i}-${j}`}
                          className="p-2 rounded-full hover:bg-green-50 transition-colors"
                          title="Like this recommendation"
                        >
                          <ThumbsUp className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => submitFeedback(activity.placeId || `${i}-${j}`, 'negative')}
                          disabled={feedbackSubmitting === (activity.placeId || `${i}-${j}`)}
                          className="p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Dislike this recommendation"
                        >
                          <ThumbsDown className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Tips & Suggestions Section */}
      <FeatureGuard feature="proactive_tips">
        <ProactiveTipsSection
          itinerary={itinerary}
          userProfile={{
            interests: form.interests || [],
            budget: form.budget,
            pace: form.pace,
            userId: 'user-' + Date.now()
          }}
          destination={form.destination}
          onTipApplied={handleTipApplied}
        />
      </FeatureGuard>
    </div>
  );
}
