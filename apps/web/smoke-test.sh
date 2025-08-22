#!/bin/bash

# Smoke test script for TripWeaver API endpoints
# Run this after starting the development server

echo "🚀 TripWeaver API Smoke Tests"
echo "=============================="

BASE_URL="http://localhost:3030"

# Test 1: Create demo trip
echo "1. Creating demo trip..."
DEMO_RESPONSE=$(curl -s "$BASE_URL/api/trips/demo")
DEMO_ID=$(echo $DEMO_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "   Demo trip created with ID: $DEMO_ID"

if [ -n "$DEMO_ID" ]; then
    echo "✅ Demo trip creation successful"
    
    # Test 2: Get trip details
    echo "2. Fetching trip details..."
    TRIP_RESPONSE=$(curl -s "$BASE_URL/api/trips/$DEMO_ID")
    if echo "$TRIP_RESPONSE" | grep -q "Rome"; then
        echo "✅ Trip details fetched successfully"
    else
        echo "❌ Failed to fetch trip details"
    fi
    
    # Test 3: Get autopilot suggestions
    echo "3. Fetching autopilot suggestions..."
    AUTOPILOT_RESPONSE=$(curl -s "$BASE_URL/api/trips/$DEMO_ID/autopilot")
    if echo "$AUTOPILOT_RESPONSE" | grep -q "suggestions"; then
        echo "✅ Autopilot suggestions fetched successfully"
    else
        echo "❌ Failed to fetch autopilot suggestions"
    fi
    
    # Test 4: Duplicate trip
    echo "4. Duplicating trip..."
    DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/trips/$DEMO_ID/duplicate")
    DUPLICATE_ID=$(echo $DUPLICATE_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$DUPLICATE_ID" ]; then
        echo "✅ Trip duplicated successfully (ID: $DUPLICATE_ID)"
    else
        echo "❌ Failed to duplicate trip"
    fi
    
    # Test 5: Create a poll
    echo "5. Creating a poll..."
    POLL_DATA='{"tripId":"'$DEMO_ID'","title":"Where to eat?","options":[{"id":"1","label":"Pizza"},{"id":"2","label":"Pasta"}]}'
    POLL_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$POLL_DATA" "$BASE_URL/api/polls")
    POLL_ID=$(echo $POLL_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$POLL_ID" ]; then
        echo "✅ Poll created successfully (ID: $POLL_ID)"
        
        # Test 6: Vote on poll
        echo "6. Voting on poll..."
        VOTE_DATA='{"optionId":"1"}'
        VOTE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "x-voter: test-user" -d "$VOTE_DATA" "$BASE_URL/api/polls/$POLL_ID/vote")
        if echo "$VOTE_RESPONSE" | grep -q "ok"; then
            echo "✅ Vote recorded successfully"
        else
            echo "❌ Failed to record vote"
        fi
    else
        echo "❌ Failed to create poll"
    fi
    
else
    echo "❌ Demo trip creation failed"
fi

echo ""
echo "🎯 Test Summary:"
echo "   - Demo trip creation: $(if [ -n "$DEMO_ID" ]; then echo "✅"; else echo "❌"; fi)"
echo "   - Trip details fetch: $(if echo "$TRIP_RESPONSE" | grep -q "Rome"; then echo "✅"; else echo "❌"; fi)"
echo "   - Autopilot suggestions: $(if echo "$AUTOPILOT_RESPONSE" | grep -q "suggestions"; then echo "✅"; else echo "❌"; fi)"
echo "   - Trip duplication: $(if [ -n "$DUPLICATE_ID" ]; then echo "✅"; else echo "❌"; fi)"
echo "   - Poll creation: $(if [ -n "$POLL_ID" ]; then echo "✅"; else echo "❌"; fi)"
echo "   - Poll voting: $(if echo "$VOTE_RESPONSE" | grep -q "ok"; then echo "✅"; else echo "❌"; fi)"

echo ""
echo "📝 Usage Examples:"
echo "   curl $BASE_URL/api/trips/demo"
echo "   curl $BASE_URL/api/trips/[ID]"
echo "   curl $BASE_URL/api/trips/[ID]/autopilot"
echo "   curl -X POST $BASE_URL/api/trips/[ID]/duplicate"
echo "   curl -X POST -H 'Content-Type: application/json' -d '{\"tripId\":\"[ID]\",\"title\":\"Test\",\"options\":[]}' $BASE_URL/api/polls"
