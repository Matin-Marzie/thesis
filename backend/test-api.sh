#!/bin/bash

# Test script for the backend API
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3500/api/v1"

echo "========================================="
echo "Testing Backend API"
echo "========================================="
echo ""

# Test 1: Root endpoint
echo "1. Testing root endpoint..."
curl -s http://localhost:3500 | jq '.'
echo ""

# Test 2: Register a new user
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken')
echo ""

# Test 3: Login with the registered user
echo "3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
echo ""

# Test 4: Get user profile
echo "4. Testing get user profile..."
curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""

# Test 5: Update user profile
echo "5. Testing update user profile..."
curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated",
    "last_name": "Name"
  }' | jq '.'
echo ""

# Test 6: Update energy
echo "6. Testing update energy..."
curl -s -X PATCH "$BASE_URL/users/me/energy" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"energy": 3}' | jq '.'
echo ""

# Test 7: Update coins
echo "7. Testing update coins..."
curl -s -X PATCH "$BASE_URL/users/me/coins" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"coins": 500}' | jq '.'
echo ""

# Test 8: Logout
echo "8. Testing logout..."
curl -s -X POST "$BASE_URL/logout" | jq '.'
echo ""

echo "========================================="
echo "All tests completed!"
echo "========================================="
