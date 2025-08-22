import { useState } from 'react';
import { Card, Button, Input, Badge, Alert, LoadingSpinner, showToast } from '../components/ui/Kit';

export default function AttractionsDemoPage() {
  const [searchQuery, setSearchQuery] = useState('Paris');
  const [attractionSlug, setAttractionSlug] = useState('prgsnhbbbkga-borobudur-temple-climb-to-the-top-prambanan-temple-1-day-tour');
  const [searchResults, setSearchResults] = useState(null);
  const [attractionDetails, setAttractionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({});

  const handleSearchAttractions = async () => {
    if (!searchQuery.trim()) {
      showToast('Please enter a search query', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/attractions/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      setSearchResults(data.attractions);
      setApiStatus(prev => ({ ...prev, search: { live: data.live, notice: data.notice } }));
      
      showToast(`Found ${data.attractions?.length || 0} attractions!`, 'success');
    } catch (error) {
      console.error('Attractions search error:', error);
      showToast('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetDetails = async () => {
    if (!attractionSlug.trim()) {
      showToast('Please enter an attraction slug', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/attractions/details/${attractionSlug}`);
      const data = await response.json();
      
      setAttractionDetails(data.attraction);
      setApiStatus(prev => ({ ...prev, details: { live: data.live, notice: data.notice } }));
      
      showToast('Attraction details loaded successfully!', 'success');
    } catch (error) {
      console.error('Attraction details error:', error);
      showToast('Failed to load attraction details. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const popularAttractions = [
    { 
      slug: 'prgsnhbbbkga-borobudur-temple-climb-to-the-top-prambanan-temple-1-day-tour',
      name: 'Borobudur Temple Tour',
      location: 'Yogyakarta, Indonesia'
    },
    { 
      slug: 'paris-eiffel-tower-skip-the-line-ticket',
      name: 'Eiffel Tower Skip-the-Line Ticket',
      location: 'Paris, France'
    },
    { 
      slug: 'paris-louvre-museum-guided-tour',
      name: 'Louvre Museum Guided Tour',
      location: 'Paris, France'
    }
  ];

  const handleQuickDetails = (slug) => {
    setAttractionSlug(slug);
    setTimeout(() => {
      setAttractionSlug(slug);
      handleGetDetails();
    }, 100);
  };

  const formatDuration = (duration) => {
    if (!duration) return 'Unknown';
    // Convert PT8H to "8 hours"
    const match = duration.match(/PT(\d+)H/);
    if (match) {
      const hours = parseInt(match[1]);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return duration;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Booking.com Attractions Demo
          </h1>
          <p className="text-xl text-gray-600">
            Discover and explore attractions with real-time Booking.com API integration
          </p>
        </div>

        {/* API Status */}
        {Object.keys(apiStatus).length > 0 && (
          <div className="mb-6 space-y-2">
            {apiStatus.search && (
              <Alert 
                variant={apiStatus.search.live ? 'success' : 'warning'}
                title={apiStatus.search.live ? 'Live Search API' : 'Mock Search Data'}
              >
                {apiStatus.search.notice}
              </Alert>
            )}
            {apiStatus.details && (
              <Alert 
                variant={apiStatus.details.live ? 'success' : 'warning'}
                title={apiStatus.details.live ? 'Live Details API' : 'Mock Details Data'}
              >
                {apiStatus.details.notice}
              </Alert>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                🔍 Search Attractions
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Query
                  </label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Yogyakarta, Bali, Paris"
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleSearchAttractions}
                  disabled={loading || !searchQuery.trim()}
                  className="w-full"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Search Attractions'}
                </Button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Get Attraction Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attraction Slug
                    </label>
                    <Input
                      value={attractionSlug}
                      onChange={(e) => setAttractionSlug(e.target.value)}
                      placeholder="Enter attraction slug"
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={handleGetDetails}
                    disabled={loading || !attractionSlug.trim()}
                    className="w-full"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Get Details'}
                  </Button>
                </div>
              </div>

              {/* Quick Details Buttons */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Quick Details
                </h3>
                <div className="space-y-2">
                  {popularAttractions.map((attraction) => (
                    <Button
                      key={attraction.slug}
                      onClick={() => handleQuickDetails(attraction.slug)}
                      variant="secondary"
                      size="sm"
                      className="w-full text-left justify-start"
                    >
                      <div>
                        <div className="font-semibold">{attraction.name}</div>
                        <div className="text-sm text-gray-600">{attraction.location}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {/* Search Results */}
            {searchResults && (
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  📋 Search Results
                </h2>

                <div className="space-y-4">
                  {searchResults.map((attraction, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {attraction.name}
                            </h3>
                            {attraction.isBookable && (
                              <Badge variant="success">Bookable</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{attraction.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📍 {attraction.location}</span>
                            <span>⭐ {attraction.rating} ({attraction.totalReviews} reviews)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-purple-600">
                            ${attraction.price}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attraction.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Attraction Details */}
            {attractionDetails && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  🎯 Attraction Details
                </h2>

                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {attractionDetails.name}
                        </h3>
                        {attractionDetails.isBookable && (
                          <Badge variant="success">Bookable</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{attractionDetails.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📍 {attractionDetails.location}, {attractionDetails.country}</span>
                        <span>⭐ {attractionDetails.rating} ({attractionDetails.totalReviews} reviews)</span>
                        <span>⏱️ {formatDuration(attractionDetails.duration)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">
                        ${attractionDetails.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        {attractionDetails.currency}
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  {attractionDetails.highlights && attractionDetails.highlights.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">✨ Highlights</h4>
                      <div className="flex flex-wrap gap-2">
                        {attractionDetails.highlights.map((highlight, index) => (
                          <Badge key={index} variant="primary">
                            {highlight.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* What's Included */}
                  {attractionDetails.whatsIncluded && attractionDetails.whatsIncluded.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">✅ What's Included</h4>
                      <ul className="space-y-1">
                        {attractionDetails.whatsIncluded.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-700">
                            <span className="text-green-500">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Not Included */}
                  {attractionDetails.notIncluded && attractionDetails.notIncluded.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">❌ Not Included</h4>
                      <ul className="space-y-1">
                        {attractionDetails.notIncluded.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-700">
                            <span className="text-red-500">✗</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cancellation Policy */}
                  {attractionDetails.cancellationPolicy && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">📋 Cancellation Policy</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {attractionDetails.cancellationPolicy.hasFreeCancellation ? (
                            <Badge variant="success">Free Cancellation</Badge>
                          ) : (
                            <Badge variant="warning">Cancellation Fees Apply</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {attractionDetails.cancellationPolicy.percentage}% refund up to {attractionDetails.cancellationPolicy.period} before start
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Operator */}
                  {attractionDetails.operatedBy && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">🏢 Operated By</h4>
                      <p className="text-gray-700">{attractionDetails.operatedBy}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Empty State */}
            {!searchResults && !attractionDetails && (
              <Card className="p-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No attraction data
                  </h3>
                  <p className="text-gray-600">
                    Search for attractions or get details to see results
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Integration Info */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            🎯 Attractions Integration Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Attraction Search</h3>
              <p className="text-gray-600 text-sm">
                Search for attractions by location or keywords
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Information</h3>
              <p className="text-gray-600 text-sm">
                Get comprehensive details including pricing and policies
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reviews & Ratings</h3>
              <p className="text-gray-600 text-sm">
                Real customer reviews and ratings for each attraction
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Ready</h3>
              <p className="text-gray-600 text-sm">
                Direct booking integration with cancellation policies
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
