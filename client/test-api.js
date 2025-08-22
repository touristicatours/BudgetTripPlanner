// Simple test script to verify the API works
const testItinerary = async () => {
  const testData = {
    destination: "Paris, France",
    startDate: "2025-09-10",
    endDate: "2025-09-13",
    budgetTotal: 600,
    travelers: 2,
    pace: "relaxed",
    interests: ["food", "history", "art"],
    mustSee: ["Louvre", "Eiffel Tower"]
  };

  try {
    const response = await fetch('http://localhost:3000/api/itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testItinerary();
}
