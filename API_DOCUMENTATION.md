# BeatTeller API Documentation

## 🌐 API Overview

The Harmony AI API provides RESTful endpoints for intelligent music discovery, personalized story generation, and cross-domain recommendations. The API is built with Flask and integrates Qloo and Gemini AI services to offer a unique music discovery experience.

**Base URL:** `http://localhost:5001/api` (development)
**Version:** 1.0.0
**Response Format:** JSON
**Authentication:** API Keys (configured server-side)

## 🔐 Authentication

The API uses server-side configured API keys. Qloo and Gemini keys are securely stored in environment variables and are not exposed to clients.

```bash
# Required environment variables
QLOO_API_KEY=your_qloo_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## 📋 Main Endpoints

### 1. Music Discovery

#### `POST /api/discover`

Discovers music based on user preferences using Qloo taste intelligence.

**Request Parameters:**
```json
{
  "input": "string (required) - Description of musical preferences",
  "mood": "string (optional) - Mood (happy, sad, energetic, calm, etc.)",
  "genre": "string (optional) - Specific musical genre",
  "limit": "integer (optional) - Number of results (default: 10, max: 50)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/discover \
  -H "Content-Type: application/json" \
  -d '{
    "input": "atmospheric indie rock for late night drives",
    "mood": "calm",
    "genre": "indie rock",
    "limit": 12
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "results": [
    {
      "name": "Midnight City",
      "artist": "M83",
      "category": "Music",
      "popularity": 0.85,
      "relevance_score": 0.92,
      "genre_tags": ["indie", "electronic", "atmospheric"],
      "recommendation_reason": "Perfect atmospheric indie sound for nighttime listening"
    }
  ],
  "total_results": 12,
  "query_metadata": {
    "processed_input": "atmospheric indie rock for late night drives",
    "mood": "calm",
    "genre": "indie rock"
  }
}
```

**Error Codes:**
- `400`: Invalid request parameters
- `429`: Rate limit exceeded
- `500`: Internal server error

### 2. Story Generation

#### `POST /api/story`

Generates a personalized story based on user music selections using Gemini AI.

**Request Parameters:**
```json
{
  "music_preferences": [
    {
      "name": "string (required) - Track name",
      "artist": "string (optional) - Artist",
      "genre": "string (optional) - Genre"
    }
  ],
  "user_name": "string (required) - User's name",
  "story_type": "string (optional) - Story type (journey, adventure, reflection)",
  "theme": "string (optional) - Theme (inspirational, mysterious, romantic)",
  "story_length": "string (optional) - Length (short, medium, long)"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/story \
  -H "Content-Type: application/json" \
  -d '{
    "music_preferences": [
      {"name": "Midnight City", "artist": "M83"},
      {"name": "Drive", "artist": "The Cars"}
    ],
    "user_name": "Alex",
    "story_type": "journey",
    "theme": "inspirational",
    "story_length": "medium"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "story": "Alex's musical journey began on a quiet evening...",
  "metadata": {
    "story_type": "journey",
    "theme": "inspirational",
    "word_count": 450,
    "estimated_reading_time": "2 minutes"
  },
  "music_featured": [
    {
      "name": "Midnight City",
      "context_in_story": "The opening scene with city lights"
    }
  ]
}
```

### 3. Similar Recommendations

#### `POST /api/recommendations`

Obtains similar recommendations based on a specific musical entity.

**Request Parameters:**
```json
{
  "seed_entity": "string (required) - Base entity name",
  "limit": "integer (optional) - Number of recommendations (default: 8)",
  "include_metadata": "boolean (optional) - Include detailed metadata"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "seed_entity": "Radiohead",
    "limit": 8,
    "include_metadata": true
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "recommendations": [
    {
      "name": "Thom Yorke",
      "category": "Music",
      "similarity_score": 0.95,
      "recommendation_reason": "Lead singer of Radiohead with similar experimental style"
    }
  ],
  "seed_entity": "Radiohead",
  "total_recommendations": 8
}
```

### 4. Music Trends

#### `GET /api/trending`

Retrieves current music trends.

**Request Parameters:**
- `limit` (optional): Number of trends to return (default: 20)
- `category` (optional): Specific category (music, artist, genre)

**Example Request:**
```bash
curl "http://localhost:5001/api/trending?limit=15&category=music"
```

**Success Response (200):**
```json
{
  "success": true,
  "trending": [
    {
      "name": "As It Was",
      "artist": "Harry Styles",
      "trend_score": 0.98,
      "category": "Music",
      "trend_reason": "Viral on social media platforms"
    }
  ],
  "last_updated": "2025-01-31T12:00:00Z",
  "total_trends": 15
}
```

### 5. Mood Analysis

#### `POST /api/mood-analysis`

Analyzes the mood of a text and suggests corresponding music.

**Request Parameters:**
```json
{
  "text": "string (required) - Text to analyze"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/mood-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I feel nostalgic and contemplative today, thinking about old memories"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "mood_analysis": {
    "primary_mood": "nostalgic",
    "secondary_mood": "contemplative",
    "emotional_intensity": 0.7,
    "sentiment_score": 0.3
  },
  "music_suggestions": [
    {
      "name": "Mad World",
      "artist": "Gary Jules",
      "match_reason": "Contemplative and nostalgic atmosphere"
    }
  ]
}
```

### 6. Playlist Generator

#### `POST /api/playlist-generator`

Generates a thematic playlist based on specific criteria.

**Request Parameters:**
```json
{
  "theme": "string (required) - Playlist theme",
  "activity": "string (optional) - Activity (workout, study, party, relaxation)",
  "duration_minutes": "integer (optional) - Desired duration in minutes",
  "mood": "string (optional) - General mood",
  "include_popular": "boolean (optional) - Include popular tracks",
  "include_discovery": "boolean (optional) - Include discoveries"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/playlist-generator \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "Sunday morning coffee",
    "activity": "relaxation",
    "duration_minutes": 60,
    "mood": "calm",
    "include_popular": true,
    "include_discovery": true
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "playlist": {
    "name": "Sunday Morning Coffee Vibes",
    "description": "Perfect tracks for a relaxing Sunday morning with coffee",
    "total_duration_minutes": 58,
    "track_count": 15,
    "tracks": [
      {
        "name": "Sunday Morning",
        "artist": "The Velvet Underground",
        "duration_seconds": 168,
        "position": 1
      }
    ]
  },
  "generation_metadata": {
    "theme": "Sunday morning coffee",
    "activity": "relaxation",
    "mood": "calm"
  }
}
```

### 7. User Taste Profile

#### `POST /api/profile`

Analyzes and creates a taste profile based on user interactions.

**Request Parameters:**
```json
{
  "user_interactions": [
    {
      "entity": "string - Entity name",
      "interaction_type": "string - Type (like, dislike, play, skip)",
      "timestamp": "string - ISO timestamp"
    }
  ],
  "preferences": {
    "genres": ["string"],
    "moods": ["string"],
    "activities": ["string"]
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "taste_profile": {
    "primary_genres": ["indie rock", "electronic"],
    "mood_preferences": ["calm", "energetic"],
    "discovery_openness": 0.8,
    "popularity_preference": 0.6,
    "diversity_score": 0.75
  },
  "recommendations": [
    {
      "name": "Recommended Artist",
      "reason": "Based on your taste profile"
    }
  ]
}
```

### 8. Cross-Domain Discovery

#### `POST /api/cross-domain`

Discovers connections between music and other domains (movies, books, restaurants).

**Request Parameters:**
```json
{
  "music_entity": "string (required) - Base musical entity",
  "target_domains": ["string"] - Target domains (movies, books, restaurants, fashion),
  "limit_per_domain": "integer (optional) - Limit per domain"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/cross-domain \
  -H "Content-Type: application/json" \
  -d '{
    "music_entity": "Pink Floyd",
    "target_domains": ["movies", "books"],
    "limit_per_domain": 5
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "cross_domain_recommendations": {
    "movies": [
      {
        "name": "The Wall",
        "connection_reason": "Based on Pink Floyd's concept album",
        "relevance_score": 0.95
      }
    ],
    "books": [
      {
        "name": "The Dark Side of the Moon: The Making of the Pink Floyd Masterpiece",
        "connection_reason": "Deep dive into the band's creative process",
        "relevance_score": 0.88
      }
    ]
  },
  "source_entity": "Pink Floyd"
}
```

## 📊 HTTP Status Codes

| Code | Meaning | Description |
|------|---------------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Endpoint not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | External service error |
| 503 | Service Unavailable | Service temporarily unavailable |

## ⚠️ Error Handling

All error responses follow the standard format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": "Additional information (optional)"
  },
  "timestamp": "2025-01-31T12:00:00Z"
}
```

**Examples of common errors:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "The 'input' parameter is required",
    "details": "Please provide a description of your musical preferences"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "API_LIMIT_EXCEEDED",
    "message": "Request limit exceeded",
    "details": "Please wait before making a new request"
  }
}
```

## 🔄 Rate Limiting

The API implements rate limiting to ensure service stability:

- **Default Limit:** 100 requests per hour per IP
- **Burst Limit:** 10 requests per minute
- **Response Headers:**
  - `X-RateLimit-Limit`: Total limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## 📝 Usage Examples

### JavaScript/Fetch

```javascript
// Music Discovery
async function discoverMusic(preferences) {
  try {
    const response = await fetch('http://localhost:5001/api/discover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: preferences.description,
        mood: preferences.mood,
        limit: 10
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.results;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error during discovery:', error);
    throw error;
  }
}

// Usage
discoverMusic({
  description: "upbeat electronic music for working out",
  mood: "energetic"
}).then(results => {
  console.log('Discovered music:', results);
});
```

### Python/Requests

```python
import requests
import json

class HarmonyAIClient:
    def __init__(self, base_url="http://localhost:5001/api"):
        self.base_url = base_url
    
    def discover_music(self, input_text, mood=None, genre=None, limit=10):
        """Discovers music based on preferences."""
        payload = {
            "input": input_text,
            "limit": limit
        }
        
        if mood:
            payload["mood"] = mood
        if genre:
            payload["genre"] = genre
        
        response = requests.post(
            f"{self.base_url}/discover",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            response.raise_for_status()
    
    def generate_story(self, music_list, user_name, story_type="journey"):
        """Generates a story based on music selections."""
        payload = {
            "music_preferences": music_list,
            "user_name": user_name,
            "story_type": story_type
        }
        
        response = requests.post(
            f"{self.base_url}/story",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        return response.json()

# Usage
client = HarmonyAIClient()

# Discovery
results = client.discover_music(
    "chill lo-fi beats for studying",
    mood="calm",
    limit=5
)

# Story Generation
story = client.generate_story(
    music_list=[{"name": "Lofi Hip Hop", "artist": "ChillHop"}],
    user_name="Alice",
    story_type="reflection"
)
```

### cURL

```bash
# Music Discovery
curl -X POST http://localhost:5001/api/discover \
  -H "Content-Type: application/json" \
  -d '{
    "input": "jazz music for a romantic dinner",
    "mood": "romantic",
    "limit": 8
  }'

# Story Generation
curl -X POST http://localhost:5001/api/story \
  -H "Content-Type: application/json" \
  -d '{
    "music_preferences": [
      {"name": "Autumn Leaves", "artist": "Miles Davis"}
    ],
    "user_name": "John",
    "story_type": "romantic"
  }'

# Trends
curl "http://localhost:5001/api/trending?limit=10"
```

## 🔧 Configuration and Customization

### Environment Variables

```bash
# External APIs
QLOO_API_KEY=your_qloo_api_key
QLOO_API_BASE=https://api.qloo.com
GEMINI_API_KEY=your_gemini_api_key

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your_secret_key

# Limits and Timeouts
API_TIMEOUT=30
RATE_LIMIT=100 per hour
MAX_RESULTS_PER_REQUEST=50

# Cache
CACHE_TIMEOUT=300
REDIS_URL=redis://localhost:6379
```

### Customizing Responses

The API allows customizing certain aspects of responses:

```python
# Configuration in src/main.py
app.config.update({
    'DEFAULT_MUSIC_LIMIT': 10,
    'MAX_STORY_LENGTH': 1000,
    'ENABLE_CROSS_DOMAIN': True,
    'CACHE_ENABLED': True
})
```

## 📈 Monitoring and Metrics

### Monitoring Endpoints

#### `GET /api/health`

Checks the API's health status.

```json
{
  "status": "healthy",
  "timestamp": "2025-01-31T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "qloo_api": "connected",
    "gemini_api": "connected",
    "database": "connected"
  }
}
```

#### `GET /api/metrics`

Returns performance metrics (Prometheus format).

```
# HELP api_requests_total Total number of API requests
# TYPE api_requests_total counter
api_requests_total{method="POST",endpoint="/discover"} 1234

# HELP api_request_duration_seconds Request duration in seconds
# TYPE api_request_duration_seconds histogram
api_request_duration_seconds_bucket{le="0.1"} 100
```

## 🚀 Performance Optimization

### Cache

The API uses a caching system to optimize performance:

- **Qloo Request Cache:** 5 minutes
- **Generated Story Cache:** 1 hour
- **Trends Cache:** 15 minutes

### Pagination

For endpoints returning large amounts of data:

```json
{
  "results": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### Compression

The API supports gzip compression to reduce response size:

```bash
curl -H "Accept-Encoding: gzip" http://localhost:5001/api/discover
```

## 🔒 Security

### Input Validation

All inputs are validated and sanitized:

```python
from marshmallow import Schema, fields, validate

class DiscoverSchema(Schema):
    input = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    mood = fields.Str(validate=validate.OneOf(['happy', 'sad', 'energetic', 'calm']))
    limit = fields.Int(validate=validate.Range(min=1, max=50))
```

### CSRF Protection

For web applications, implement CSRF protection:

```javascript
// Include CSRF token in headers
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/discover', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

## 📚 Additional Resources

### External API Documentation

- [Qloo API Documentation](https://docs.qloo.com)
- [Gemini AI Documentation](https://ai.google.dev/docs)

### Development Tools

- **Postman Collection**: Complete collection for API testing
- **OpenAPI Spec**: OpenAPI 3.0 specification available
- **Python SDK**: Official Python client for the API

### Support and Community

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Complete usage guide
- **Examples**: Integration examples repository

---

This documentation covers all aspects of the BeatTeller API API. For specific questions or advanced use cases, consult the provided examples or contact the development team.

