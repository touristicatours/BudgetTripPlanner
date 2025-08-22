"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { copy } from "@/lib/share";

type Tab = "autopilot" | "receipts" | "export" | "share" | "weather" | "budget" | "split" | "ai" | "visual" | "predict" | "story";

interface LoadingState {
  [key: string]: boolean;
}

interface ErrorState {
  [key: string]: string | null;
}

export default function TabbedEnhancements({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("autopilot");
  const [sugs, setSugs] = useState<any[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteMessage, setInviteMessage] = useState<string>("");
  const [inviteStatus, setInviteStatus] = useState<string>("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [budgetAlerts, setBudgetAlerts] = useState<any[]>([]);
  const [tripData, setTripData] = useState<any>(null);
  const [splitData, setSplitData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);

  const [storyData, setStoryData] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState([
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob", email: "bob@example.com" },
    { name: "Charlie", email: "charlie@example.com" }
  ]);

  // Loading and error states
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const [errorStates, setErrorStates] = useState<ErrorState>({});
  const [dataCache, setDataCache] = useState<{ [key: string]: { data: any; timestamp: number } }>({});

  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Optimized data fetching with caching
  const fetchWithCache = useCallback(async (key: string, url: string, options?: RequestInit) => {
    const now = Date.now();
    const cached = dataCache[key];
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    setLoadingStates(prev => ({ ...prev, [key]: true }));
    setErrorStates(prev => ({ ...prev, [key]: null }));

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      setDataCache(prev => ({
        ...prev,
        [key]: { data, timestamp: now }
      }));
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrorStates(prev => ({ ...prev, [key]: errorMessage }));
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, [dataCache]);

  // Memoized tab data
  const tabData = useMemo(() => ({
    autopilot: sugs,
    weather: weatherData,
    budget: budgetAlerts,
    split: splitData,
    ai: aiAnalysis,
    predict: predictions,
    story: storyData
  }), [sugs, weatherData, budgetAlerts, splitData, aiAnalysis, predictions, storyData]);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load trip data
        const trip = await fetchWithCache('trip', `/api/trips/${id}`);
        setTripData(trip.trip);

        // Load autopilot suggestions
        const autopilot = await fetchWithCache('autopilot', `/api/trips/${id}/autopilot`);
        setSugs(autopilot.suggestions || []);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [id, fetchWithCache]);

  // Optimized tab-specific data loading
  useEffect(() => {
    const loadTabData = async () => {
      if (loadingStates[activeTab]) return;

      try {
        switch (activeTab) {
          case "weather":
            if (tripData?.form?.destination) {
              const weather = await fetchWithCache(
                'weather',
                `/api/weather?destination=${encodeURIComponent(tripData.form.destination)}&date=${tripData.form.startDate}`
              );
              setWeatherData(weather);
            }
            break;

          case "budget":
            const budget = await fetchWithCache('budget', `/api/budget/alerts?tripId=${id}`);
            setBudgetAlerts(budget.alerts || []);
            break;

          case "split":
            if (tripData) {
              const split = await fetchWithCache('split', `/api/trips/${id}/split`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expenses: [], groupMembers })
              });
              setSplitData(split);
            }
            break;

          case "ai":
            const ai = await fetchWithCache('ai', '/api/ai/preferences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tripHistory: [], currentPreferences: {} })
            });
            setAiAnalysis(ai);
            break;

          case "predict":
            const predict = await fetchWithCache('predict', '/api/ai/predict', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userProfile: {}, travelHistory: [], preferences: {} })
            });
            setPredictions(predict);
            break;



          case "story":
            if (tripData) {
              const story = await fetchWithCache('story', '/api/storytelling/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripData, userPreferences: {}, storyType: "adventure" })
              });
              setStoryData(story);
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to load ${activeTab} data:`, error);
      }
    };

    loadTabData();
  }, [activeTab, tripData, groupMembers, id, fetchWithCache, loadingStates]);

  // Optimized file upload with progress
  async function uploadReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoadingStates(prev => ({ ...prev, receipt: true }));
    setErrorStates(prev => ({ ...prev, receipt: null }));

    try {
      const response = await fetch(`/api/trips/${id}/receipts`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      setMsg(`Uploaded: ${file.name}`);
      
      // Clear cache to refresh data
      setDataCache(prev => {
        const newCache = { ...prev };
        delete newCache.receipts;
        return newCache;
      });
    } catch (error) {
      setErrorStates(prev => ({ ...prev, receipt: 'Upload failed' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, receipt: false }));
    }
  }

  // Optimized invitation sending
  async function sendInvitation() {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setErrorStates(prev => ({ ...prev, invite: 'Please enter a valid email' }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, invite: true }));
    setErrorStates(prev => ({ ...prev, invite: null }));

    try {
      const response = await fetch(`/api/trips/${id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, message: inviteMessage }),
      });

      if (!response.ok) throw new Error('Failed to send invitation');

      const result = await response.json();
      setInviteStatus(`✅ Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteMessage("");
    } catch (error) {
      setErrorStates(prev => ({ ...prev, invite: 'Failed to send invitation' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, invite: false }));
    }
  }

  // Optimized tab configuration
  const tabs = useMemo(() => [
    { id: "autopilot" as Tab, label: "Autopilot", icon: "🤖", priority: "high" },
    { id: "receipts" as Tab, label: "Receipts", icon: "🧾", priority: "medium" },
    { id: "weather" as Tab, label: "Weather", icon: "🌤️", priority: "high" },
    { id: "budget" as Tab, label: "Budget", icon: "💰", priority: "high" },
    { id: "split" as Tab, label: "Split", icon: "👥", priority: "medium" },
    { id: "ai" as Tab, label: "AI", icon: "🧠", priority: "medium" },
    { id: "visual" as Tab, label: "Visual", icon: "🗺️", priority: "low" },
    { id: "predict" as Tab, label: "Predict", icon: "🔮", priority: "high" },

    { id: "story" as Tab, label: "Story", icon: "📖", priority: "low" },
    { id: "share" as Tab, label: "Share", icon: "📧", priority: "medium" },
    { id: "export" as Tab, label: "Export", icon: "📄", priority: "low" },
  ], []);

  // Loading component
  const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-8 w-8", 
      lg: "h-12 w-12"
    };
    
    return (
      <div className="flex items-center justify-center p-4">
        <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}></div>
      </div>
    );
  };

  // Error component
  const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <div className="text-red-600 text-sm mb-2">{message}</div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );

  // Get tab priority color
  const getTabPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-4 border-l-red-500";
      case "medium": return "border-l-4 border-l-yellow-500";
      case "low": return "border-l-4 border-l-green-500";
      default: return "";
    }
  };

  return (
    <div className="border-t pt-6">
      {/* Enhanced Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
            } ${getTabPriorityColor(tab.priority)}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {loadingStates[tab.id] && (
              <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Tab Content */}
      <div className="min-h-[400px]">
        {/* Show loading state */}
        {loadingStates[activeTab] && <LoadingSpinner size="lg" />}
        
        {/* Show error state */}
        {errorStates[activeTab] && (
          <ErrorMessage 
            message={errorStates[activeTab]!} 
            onRetry={() => {
              setErrorStates(prev => ({ ...prev, [activeTab]: null }));
              // Trigger reload by clearing cache
              setDataCache(prev => {
                const newCache = { ...prev };
                delete newCache[activeTab];
                return newCache;
              });
            }}
          />
        )}

        {/* Tab content - only show when not loading and no errors */}
        {!loadingStates[activeTab] && !errorStates[activeTab] && (
          <>
            {activeTab === "autopilot" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">🤖 AI Autopilot Suggestions</h3>
                {sugs.length > 0 ? (
                  <div className="space-y-4">
                    {sugs.map((sug, i) => (
                      <div key={i} className="bg-white border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{sug.title}</h4>
                          <span className="text-sm text-gray-500">{sug.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{sug.reasoning}</p>
                        <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
                          Apply Suggestion
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">No suggestions available</div>
                    <div className="text-xs mt-1">AI will analyze your trip and provide recommendations</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "receipts" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">🧾 Receipt Management</h3>
                <div className="bg-white border rounded-lg p-4">
                  <input
                    type="file"
                    onChange={uploadReceipt}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    accept="image/*,.pdf"
                  />
                  {loadingStates.receipt && <LoadingSpinner size="sm" />}
                  {errorStates.receipt && <ErrorMessage message={errorStates.receipt} />}
                  {msg && <div className="mt-2 text-sm text-green-600">{msg}</div>}
                </div>
              </div>
            )}

            {activeTab === "predict" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">🔮 Predictive Travel AI</h3>
                {predictions ? (
                  <div className="space-y-6">
                    {/* Confidence Score */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Prediction Confidence</h4>
                          <p className="text-sm text-gray-600">How accurate our AI predictions are</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">{predictions.confidence}%</div>
                          <div className="text-xs text-gray-500">AI Confidence</div>
                        </div>
                      </div>
                    </div>

                    {/* Top Destinations */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">🎯 Your Next Destinations</h4>
                      {predictions.predictions.topDestinations.map((dest: any, index: number) => (
                        <div key={index} className="bg-white border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-medium text-lg">{dest.destination}</h5>
                              <div className="text-sm text-gray-600">{dest.reasoning}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-green-600">{dest.confidence}%</div>
                              <div className="text-xs text-gray-500">Match Score</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Best Time:</span>
                              <span className="font-medium ml-2">{dest.bestTime}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Budget:</span>
                              <span className="font-medium ml-2">${dest.estimatedBudget}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs text-gray-600">Unique Experiences:</div>
                            <div className="flex flex-wrap gap-1">
                              {dest.uniqueSellingPoints.map((point: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Emerging Trends */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">📈 Emerging Travel Trends</h4>
                      {predictions.predictions.emergingTrends.map((trend: any, index: number) => (
                        <div key={index} className="bg-white border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">{trend.destination}</h5>
                            <span className="text-sm font-semibold text-green-600">{trend.growth}</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{trend.reasoning}</div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Best Time: {trend.bestTime}</span>
                            <span>Budget: ${trend.estimatedBudget}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Travel Insights */}
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">🧠 Travel Personality Insights</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Personality:</span>
                          <span className="font-medium ml-2">{predictions.insights.travelPersonality}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Style:</span>
                          <span className="font-medium ml-2">{predictions.insights.travelStyle}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Budget Range:</span>
                          <span className="font-medium ml-2">{predictions.insights.budgetRange}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Regions:</span>
                          <span className="font-medium ml-2">{predictions.insights.preferredRegions.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">Analyzing your travel patterns...</div>
                    <div className="text-xs mt-1">AI-powered destination predictions</div>
                  </div>
                )}
              </div>
            )}



            {activeTab === "story" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">📖 AI-Generated Trip Storytelling</h3>
                {storyData ? (
                  <div className="space-y-6">
                    {/* Story Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{storyData.story.title}</h4>
                      <div className="flex flex-wrap gap-2">
                        {storyData.story.themes.map((theme: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Story Chapters */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Story Chapters</h4>
                      {storyData.story.chapters.map((chapter: any, index: number) => (
                        <div key={index} className="bg-white border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-medium">{chapter.title}</h5>
                            <div className="text-right">
                              <div className="text-sm font-medium capitalize">{chapter.mood}</div>
                              <div className="text-xs text-gray-500">{chapter.timeOfDay}</div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-700 mb-3 leading-relaxed">
                            {chapter.content}
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs text-gray-600">Sensory Details:</div>
                            <div className="flex flex-wrap gap-1">
                              {chapter.sensoryDetails.map((detail: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">
                                  {detail}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Immersive Content */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Immersive Experience</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border rounded-lg p-4">
                          <div className="text-2xl mb-2">🎧</div>
                          <h5 className="font-medium">Audio Narration</h5>
                          <div className="text-sm text-gray-600 mb-3">{storyData.immersiveContent.audioNarration.totalDuration}</div>
                          <button className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                            Listen to Story
                          </button>
                        </div>
                        
                        <div className="bg-white border rounded-lg p-4">
                          <div className="text-2xl mb-2">🗺️</div>
                          <h5 className="font-medium">Interactive Map</h5>
                          <div className="text-sm text-gray-600 mb-3">{storyData.immersiveContent.interactiveMap.locations.length} locations</div>
                          <button className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                            Explore Map
                          </button>
                        </div>
                        
                        <div className="bg-white border rounded-lg p-4">
                          <div className="text-2xl mb-2">📸</div>
                          <h5 className="font-medium">Photo Gallery</h5>
                          <div className="text-sm text-gray-600 mb-3">{storyData.immersiveContent.photoGallery.totalPhotos} photos</div>
                          <button className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                            View Gallery
                          </button>
                        </div>
                        
                        <div className="bg-white border rounded-lg p-4">
                          <div className="text-2xl mb-2">🎭</div>
                          <h5 className="font-medium">Cultural Insights</h5>
                          <div className="text-sm text-gray-600 mb-3">{storyData.immersiveContent.culturalInsights.insights.length} themes</div>
                          <button className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Shareable Content */}
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Share Your Story</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          📱 Share on Social
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                          📝 Create Blog Post
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                          🎥 Generate Video
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">Crafting your personalized story...</div>
                    <div className="text-xs mt-1">AI-generated immersive storytelling</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "share" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Share Trip</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (optional)
                    </label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder="Check out this amazing trip I planned!"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <button
                    onClick={sendInvitation}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                  >
                    Send Invitation
                  </button>
                  
                  {inviteStatus && (
                    <div className={`text-sm p-3 rounded-md ${
                      inviteStatus.includes('✅') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : inviteStatus.includes('❌') 
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {inviteStatus}
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Share Link</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/share/${id}`}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/share/${id}`);
                          setInviteStatus("✅ Share link copied to clipboard!");
                        }}
                        className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "weather" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Weather-Aware Planning</h3>
                {weatherData ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {weatherData.destination} - {weatherData.date}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl">
                              {weatherData.weather.condition === "sunny" && "☀️"}
                              {weatherData.weather.condition === "cloudy" && "☁️"}
                              {weatherData.weather.condition === "rainy" && "🌧️"}
                              {weatherData.weather.condition === "partly_cloudy" && "⛅"}
                            </span>
                            <span className="text-lg font-semibold">{weatherData.weather.temp}°C</span>
                            <span className="text-sm text-gray-600">
                              {weatherData.weather.rain > 0 ? `${weatherData.weather.rain}% rain chance` : "No rain"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {weatherData.suggestions && weatherData.suggestions.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">Smart Suggestions</h5>
                        {weatherData.suggestions.map((suggestion: any, index: number) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg border ${
                              suggestion.priority === "high" 
                                ? "border-red-200 bg-red-50" 
                                : suggestion.priority === "medium"
                                ? "border-yellow-200 bg-yellow-50"
                                : "border-green-200 bg-green-50"
                            }`}
                          >
                            <div className="text-sm">{suggestion.message}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Weather-Aware Tips</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Check weather 3 days before your trip for better planning</li>
                        <li>• Pack accordingly - layers for variable weather</li>
                        <li>• Have indoor backup plans for rainy days</li>
                        <li>• Consider weather when booking outdoor activities</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">Loading weather data...</div>
                    <div className="text-xs mt-1">This feature provides weather-aware planning suggestions</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "budget" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Smart Budget Monitoring</h3>
                {budgetAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {budgetAlerts.map((alert, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border ${
                          alert.type === "critical" || alert.type === "overspend"
                            ? "border-red-200 bg-red-50" 
                            : alert.type === "warning"
                            ? "border-yellow-200 bg-yellow-50"
                            : alert.type === "info"
                            ? "border-blue-200 bg-blue-50"
                            : "border-green-200 bg-green-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">{alert.message}</div>
                            {alert.suggestion && (
                              <div className="text-sm text-gray-600 mb-2">{alert.suggestion}</div>
                            )}
                            {alert.suggestions && (
                              <div className="space-y-1">
                                {alert.suggestions.map((suggestion: string, idx: number) => (
                                  <div key={idx} className="text-sm text-gray-600">• {suggestion}</div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            alert.priority === "high" 
                              ? "bg-red-100 text-red-800" 
                              : alert.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {alert.priority}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">Loading budget alerts...</div>
                    <div className="text-xs mt-1">Smart budget monitoring and saving suggestions</div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Budget Optimization Tips</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Upload receipts to track spending in real-time</li>
                    <li>• Set spending alerts to stay on budget</li>
                    <li>• Use local transport instead of taxis</li>
                    <li>• Eat at local markets and street food</li>
                    <li>• Look for free attractions and activities</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "split" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Smart Group Cost Splitting</h3>
                {splitData ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Trip Cost Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="font-medium ml-2">${splitData.summary.totalTripCost}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Average per Person:</span>
                          <span className="font-medium ml-2">${splitData.summary.averagePerPerson}</span>
                        </div>
                      </div>
                    </div>

                    {/* Individual Splits */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Individual Breakdowns</h4>
                      {splitData.split.individualSplits.map((split: any, index: number) => (
                        <div key={index} className="bg-white border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium">{split.member}</h5>
                            <span className="text-lg font-semibold text-indigo-600">
                              ${split.totalOwed}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Individual Expenses:</span>
                              <span className="font-medium ml-2">${split.individualExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Shared Contribution:</span>
                              <span className="font-medium ml-2">${split.sharedContribution}</span>
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-xs text-gray-600 mb-2">Cost Breakdown:</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>🏨 Accommodation: ${split.breakdown.accommodation}</div>
                              <div>🚇 Transport: ${split.breakdown.transport}</div>
                              <div>🍽️ Food: ${split.breakdown.food}</div>
                              <div>🎭 Activities: ${split.breakdown.activities}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    {splitData.split.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Smart Recommendations</h4>
                        {splitData.split.recommendations.map((rec: any, index: number) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg border ${
                              rec.priority === "high" 
                                ? "border-red-200 bg-red-50" 
                                : rec.priority === "medium"
                                ? "border-yellow-200 bg-yellow-50"
                                : "border-green-200 bg-green-50"
                            }`}
                          >
                            <div className="font-medium text-sm mb-1">{rec.message}</div>
                            <div className="text-xs text-gray-600">{rec.savings}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">Calculating cost splits...</div>
                    <div className="text-xs mt-1">Smart group expense management</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI Learning & Preferences</h3>
                {aiAnalysis ? (
                  <div className="space-y-6">
                    {/* Learning Score */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">AI Learning Score</h4>
                          <p className="text-sm text-gray-600">How well we understand your preferences</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">{aiAnalysis.learningScore}%</div>
                          <div className="text-xs text-gray-500">Learning Progress</div>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${aiAnalysis.learningScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Travel Style Analysis */}
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Your Travel Style</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Primary Pace:</span>
                          <span className="font-medium ml-2 capitalize">{aiAnalysis.analysis.travelStyle.primaryPace}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Average Budget:</span>
                          <span className="font-medium ml-2">${aiAnalysis.analysis.budgetPatterns.averageBudget}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Preferred Season:</span>
                          <span className="font-medium ml-2 capitalize">{aiAnalysis.analysis.timingPreferences.preferredSeason}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Group Size:</span>
                          <span className="font-medium ml-2">{aiAnalysis.analysis.groupSizePatterns.averageGroupSize} people</span>
                        </div>
                      </div>
                    </div>

                    {/* Personalized Recommendations */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">AI Recommendations</h4>
                      {aiAnalysis.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="bg-white border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">{rec.message}</div>
                              <div className="text-xs text-gray-500 capitalize">{rec.category.replace('_', ' ')}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-indigo-600">{rec.confidence}%</div>
                              <div className="text-xs text-gray-500">Confidence</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">Analyzing your preferences...</div>
                    <div className="text-xs mt-1">AI-powered personalized recommendations</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "visual" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Visual Trip Builder</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg text-center">
                  <div className="text-4xl mb-4">🗺️</div>
                  <h4 className="font-medium text-gray-900 mb-2">Interactive Map Planning</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop activities on an interactive map to create the perfect itinerary
                  </p>
                  <a 
                    href={`/trips/${id}/visual-builder`}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <span className="mr-2">🗺️</span>
                    Open Visual Builder
                  </a>
                  <a
                    href={`/workspace/${id}`}
                    className="ml-3 inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    ✨ Unified Workspace
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <h5 className="font-medium text-sm">Drag & Drop</h5>
                    <p className="text-xs text-gray-600">Organize activities visually</p>
                  </div>
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <h5 className="font-medium text-sm">Route Optimization</h5>
                    <p className="text-xs text-gray-600">Smart path planning</p>
                  </div>
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <h5 className="font-medium text-sm">Real-time Stats</h5>
                    <p className="text-xs text-gray-600">Track your planning progress</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "export" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Export Options</h3>
                <div className="flex gap-3">
                  <a 
                    href={`/trips/${id}/export`} 
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
