import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => router.pathname === path;

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    router.push('/');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header with gradient background */}
      <header className="bg-gradient-sunset shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl font-bold bg-gradient-warm bg-clip-text text-transparent">
                  ✈️
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  BudgetTripPlanner
                </h1>
                <p className="text-orange-100 text-sm">Plan your dream vacation</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/trips/new" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/trips/new') 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                }`}
              >
                New Trip
              </Link>
              <Link 
                href="/plan" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/plan') 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                }`}
              >
                Plan
              </Link>
              <Link 
                href="/bookings" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/bookings') 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                }`}
              >
                Bookings
              </Link>
              {user ? (
                <div className="relative user-menu">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-white hover:bg-orange-600 hover:bg-opacity-20"
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <span>{user.name || user.email}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{user.name || 'User'}</p>
                        <p className="text-gray-500">{user.email}</p>
                      </div>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/auth/login" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/auth/login') 
                      ? 'bg-white text-orange-600 shadow-md' 
                      : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                  }`}
                >
                  Login
                </Link>
              )}
              <Link 
                href="/ui" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/ui') 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                }`}
              >
                UI Kit
              </Link>
              <Link 
                href="/demo" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/demo') 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                }`}
              >
                Demo
              </Link>
              <Link 
                href="/airbnb-demo" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/airbnb-demo') 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                }`}
              >
                Airbnb
              </Link>
              <Link 
                href="/booking-demo" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/booking-demo') 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                }`}
              >
                Booking
              </Link>
              <Link 
                href="/integration-demo" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/integration-demo') 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                }`}
              >
                All APIs
              </Link>
                              <Link
                  href="/attractions-demo"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/attractions-demo')
                      ? 'bg-white text-orange-600 shadow-md'
                      : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                  }`}
                >
                  Attractions
                </Link>
                <Link
                  href="/all-in-one-demo"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/all-in-one-demo')
                      ? 'bg-white text-orange-600 shadow-md'
                      : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                  }`}
                >
                  All-in-One
                </Link>
                <Link
                  href="/unified-demo"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/unified-demo')
                      ? 'bg-white text-orange-600 shadow-md'
                      : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                  }`}
                >
                  Unified UI
                </Link>
                <Link
                  href="/bookings-manager"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive('/bookings-manager')
                      ? 'bg-white text-orange-600 shadow-md'
                      : 'text-white hover:bg-orange-600 hover:bg-opacity-20'
                  }`}
                >
                  Bookings
                </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-white hover:text-orange-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-warm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-white font-medium">
              © 2024 BudgetTripPlanner. Made with ❤️ for travelers.
            </p>
            <p className="text-orange-100 text-sm mt-2">
              Plan your next adventure with confidence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


