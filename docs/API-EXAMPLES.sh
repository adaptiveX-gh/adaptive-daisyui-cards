#!/bin/bash
# Adaptive Cards Platform API - Example Requests
# Run these commands to test the API endpoints

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Adaptive Cards Platform API - Examples"
echo "=========================================="
echo ""

# Health Check
echo "1. Health Check"
echo "==============="
curl -s "$BASE_URL/health" | jq '.'
echo ""
echo ""

# API Info
echo "2. API Information"
echo "=================="
curl -s "$BASE_URL/api" | jq '.'
echo ""
echo ""

# List Topics
echo "3. Available Topics"
echo "==================="
curl -s "$BASE_URL/api/cards/topics" | jq '.'
echo ""
echo ""

# List Layouts
echo "4. Available Layouts"
echo "===================="
curl -s "$BASE_URL/api/cards/layouts" | jq '.'
echo ""
echo ""

# List Themes
echo "5. Available Themes"
echo "==================="
curl -s "$BASE_URL/api/themes" | jq '.themes[0:3]'
echo "... (showing first 3 themes)"
echo ""
echo ""

# Generate Single Card - Hero Overlay
echo "6. Generate Single Card (Hero Overlay)"
echo "======================================"
curl -s -X POST "$BASE_URL/api/cards/generate-content" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "layoutType": "hero-overlay",
    "style": "professional"
  }' | jq '.'
echo ""
echo ""

# Generate Single Card - Numbered List
echo "7. Generate Single Card (Numbered List)"
echo "========================================"
curl -s -X POST "$BASE_URL/api/cards/generate-content" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Digital Marketing Trends 2025",
    "layoutType": "numbered-list",
    "contentSections": ["objectives"]
  }' | jq '.'
echo ""
echo ""

# Generate Single Card - Grid
echo "8. Generate Single Card (Grid)"
echo "==============================="
curl -s -X POST "$BASE_URL/api/cards/generate-content" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Remote Team Management",
    "layoutType": "grid",
    "theme": {
      "name": "cyberpunk"
    }
  }' | jq '.'
echo ""
echo ""

# Generate Complete Presentation
echo "9. Generate Complete Presentation"
echo "=================================="
curl -s -X POST "$BASE_URL/api/presentations/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "cardCount": 6,
    "style": "professional",
    "theme": {
      "name": "corporate"
    }
  }' | jq '.cards | length, .[0]'
echo ""
echo ""

# Generate Presentation with Images
echo "10. Generate Presentation with Image Placeholders"
echo "=================================================="
curl -s -X POST "$BASE_URL/api/presentations/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Digital Marketing Trends 2025",
    "cardCount": 4,
    "includeImages": true,
    "theme": {
      "name": "synthwave"
    }
  }' | jq '.cards[0]'
echo ""
echo ""

# Get Specific Theme
echo "11. Get Specific Theme Details"
echo "==============================="
curl -s "$BASE_URL/api/themes/cyberpunk" | jq '.'
echo ""
echo ""

# Save Presentation to File
echo "12. Generate and Save Presentation"
echo "==================================="
PRESENTATION=$(curl -s -X POST "$BASE_URL/api/presentations/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Remote Team Management",
    "cardCount": 5,
    "style": "professional"
  }')
echo "$PRESENTATION" > /tmp/presentation.json
echo "Saved to /tmp/presentation.json"
echo ""
echo ""

# Export as HTML
echo "13. Export Presentation as HTML"
echo "================================"
curl -s -X POST "$BASE_URL/api/presentations/export" \
  -H "Content-Type: application/json" \
  -d "{
    \"cards\": $(echo "$PRESENTATION" | jq '.cards'),
    \"format\": \"html\",
    \"options\": {
      \"title\": \"Remote Team Management\",
      \"theme\": \"corporate\"
    }
  }" > /tmp/presentation.html
echo "Saved to /tmp/presentation.html"
echo ""
echo ""

# Preview URLs
echo "14. Browser Preview URLs"
echo "========================"
echo "AI in Product Discovery (Light):"
echo "$BASE_URL/api/presentations/preview/AI%20in%20Product%20Discovery?theme=light"
echo ""
echo "Digital Marketing (Cyberpunk):"
echo "$BASE_URL/api/presentations/preview/Digital%20Marketing%20Trends%202025?theme=cyberpunk&cardCount=4"
echo ""
echo "Remote Team Management (Corporate):"
echo "$BASE_URL/api/presentations/preview/Remote%20Team%20Management?theme=corporate&cardCount=6"
echo ""
echo ""

# Error Examples
echo "15. Error Handling Examples"
echo "==========================="
echo "a) Missing required field:"
curl -s -X POST "$BASE_URL/api/cards/generate-content" \
  -H "Content-Type: application/json" \
  -d '{"layoutType": "hero"}' | jq '.'
echo ""
echo ""

echo "b) Invalid topic:"
curl -s -X POST "$BASE_URL/api/cards/generate-content" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Nonexistent Topic",
    "layoutType": "hero"
  }' | jq '.'
echo ""
echo ""

echo "c) Invalid layout:"
curl -s -X POST "$BASE_URL/api/cards/generate-content" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Product Discovery",
    "layoutType": "invalid-layout"
  }' | jq '.'
echo ""
echo ""

echo "=========================================="
echo "Examples Complete!"
echo "=========================================="
echo ""
echo "To test in browser, visit:"
echo "$BASE_URL/api/presentations/preview/AI%20in%20Product%20Discovery"
echo ""
echo "For full documentation, see:"
echo "- docs/API-USAGE.md"
echo "- docs/API-SPEC.md"
echo "- API-README.md"
