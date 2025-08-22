import { useState, useEffect, useRef } from 'react';

export function AutoComplete({ 
  value, 
  onChange, 
  placeholder = "Search destinations...",
  className = "",
  onSelect = null 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(value || '');
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    
    // Debounce the API call
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/autocomplete?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Auto-complete error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(e);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.fullName);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Create a synthetic event for the onChange handler
    const syntheticEvent = {
      target: { value: suggestion.fullName }
    };
    onChange?.(syntheticEvent);
    
    // Call the onSelect callback if provided
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length >= 2 && setShowSuggestions(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 placeholder-gray-400"
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full border-2 border-orange-200 border-t-orange-600 w-4 h-4"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="text-orange-500">
                  {suggestion.type === 'city' ? '🏙️' : '📍'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {suggestion.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {suggestion.country}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-center">
            No destinations found
          </div>
        </div>
      )}
    </div>
  );
}
