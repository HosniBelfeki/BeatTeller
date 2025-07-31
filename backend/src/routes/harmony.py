from flask import Blueprint, request, jsonify
import os
import google.generativeai as genai
from qloo_api import QlooAPI
import json
import traceback
import random
from datetime import datetime

harmony_bp = Blueprint("harmony", __name__)

# Initialize APIs
qloo_api = QlooAPI(os.getenv("QLOO_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@harmony_bp.route("/discover", methods=["POST"])
def discover_music():
    """Discover music based on user preferences with enhanced filtering"""
    try:
        data = request.get_json()
        user_input = data.get("input", "")
        mood = data.get("mood", "happy")
        genre_preference = data.get("genre", "")
        limit = data.get("limit", 10)
        
        # Build enhanced search query
        search_query = f"{user_input} {genre_preference} music"
        
        # Search with Qloo
        music_entities = qloo_api.search(search_query, limit=limit * 2)
        
        # Enhanced filtering and scoring
        music_results = []
        for entity in music_entities:
            if entity.get_category() == "music" or "music" in str(entity.types).lower():
                # Calculate relevance score
                relevance_score = calculate_relevance_score(entity, mood, genre_preference)
                
                music_results.append({
                    "name": entity.name,
                    "category": entity.get_category(),
                    "types": entity.types,
                    "popularity": entity.popularity,
                    "relevance_score": relevance_score,
                    "mood_match": get_mood_match(entity, mood),
                    "genre_tags": extract_genre_tags(entity)
                })
        
        # Sort by relevance score and limit results
        music_results.sort(key=lambda x: x["relevance_score"], reverse=True)
        music_results = music_results[:limit]
        
        # If not enough results, perform broader search
        if len(music_results) < 5:
            additional_entities = qloo_api.discover_by_category("music", limit=10)
            for entity in additional_entities:
                if entity.name not in [r["name"] for r in music_results]:
                    music_results.append({
                        "name": entity.name,
                        "category": entity.get_category(),
                        "types": entity.types,
                        "popularity": entity.popularity,
                        "relevance_score": random.uniform(0.3, 0.7),
                        "mood_match": get_mood_match(entity, mood),
                        "genre_tags": extract_genre_tags(entity)
                    })
        
        return jsonify({
            "success": True,
            "results": music_results[:limit],
            "query": search_query,
            "total_found": len(music_results),
            "search_metadata": {
                "mood": mood,
                "genre": genre_preference,
                "timestamp": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"Error in discover_music: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@harmony_bp.route("/story", methods=["POST"])
def generate_story():
    """Generate enhanced personalized stories with multiple styles and themes"""
    try:
        data = request.get_json()
        music_preferences = data.get("music_preferences", [])
        user_name = data.get("user_name", "User")
        story_type = data.get("story_type", "journey")
        story_length = data.get("story_length", "medium")  # short, medium, long
        theme = data.get("theme", "inspirational")  # inspirational, nostalgic, adventurous
        
        # Prepare enhanced prompt for Gemini
        music_list = ", ".join([music["name"] for music in music_preferences[:8]])
        
        # Enhanced story prompts with themes
        prompts = {
            "journey": {
                "inspirational": f"""
                Write an inspiring and uplifting story about {user_name}'s transformative musical journey.
                
                Featured music: {music_list}
                
                The story should:
                - Be written in second person ("You")
                - Be approximately {get_word_count(story_length)} words
                - Show how music became a source of strength and growth
                - Include specific moments where each song played a pivotal role
                - Incorporate sensory details and emotional depth
                - End with a powerful message about the future
                
                Start with "Your musical awakening began..." and weave each song into key life moments.
                """,
                "nostalgic": f"""
                Write a deeply nostalgic story about {user_name}'s musical memories and connections.
                
                Featured music: {music_list}
                
                The story should:
                - Be written in second person ("You")
                - Be approximately {get_word_count(story_length)} words
                - Evoke strong memories and emotional connections
                - Show how music connects to specific people, places, and times
                - Include bittersweet moments and cherished memories
                - End with reflection on how music preserves our past
                
                Start with "The first notes took you back..." and explore the emotional landscape of memory.
                """,
                "adventurous": f"""
                Write an adventurous story about {user_name}'s musical exploration and discovery.
                
                Featured music: {music_list}
                
                The story should:
                - Be written in second person ("You")
                - Be approximately {get_word_count(story_length)} words
                - Frame music discovery as an exciting quest
                - Include unexpected discoveries and bold choices
                - Show courage in exploring new musical territories
                - End with anticipation for future musical adventures
                
                Start with "Your musical expedition began..." and treat each discovery as a new frontier.
                """
            },
            "concert": {
                "inspirational": f"""
                Write an electrifying story about {user_name} experiencing a life-changing concert.
                
                The concert features: {music_list}
                
                The story should:
                - Be written in second person ("You")
                - Be approximately {get_word_count(story_length)} words
                - Capture the transformative power of live music
                - Include detailed descriptions of lights, sound, and crowd energy
                - Show personal breakthrough moments during the performance
                - End with lasting impact and renewed purpose
                
                Start with "The venue doors opened..." and build to an emotional crescendo.
                """,
                "nostalgic": f"""
                Write a touching story about {user_name} at a concert that brings back precious memories.
                
                The concert features: {music_list}
                
                The story should:
                - Be written in second person ("You")
                - Be approximately {get_word_count(story_length)} words
                - Connect live music to cherished memories
                - Include moments of recognition and emotional connection
                - Show how music bridges past and present
                - End with gratitude for musical memories
                
                Start with "As the first song began..." and weave memories throughout the performance.
                """,
                "adventurous": f"""
                Write a thrilling story about {user_name} at an unexpected and amazing concert experience.
                
                The concert features: {music_list}
                
                The story should:
                - Be written in second person ("You")
                - Be approximately {get_word_count(story_length)} words
                - Include surprising elements and unexpected moments
                - Show spontaneous decisions and bold experiences
                - Capture the thrill of musical discovery
                - End with excitement for future musical adventures
                
                Start with "You never expected..." and build an exciting narrative.
                """
            },
            "playlist": {
                "inspirational": f"""
                Write an empowering story about {user_name} creating a playlist that changes their life.
                
                Including: {music_list}
                
                The story should:
                - Be written in second person ("You")
                - Be approximately {get_word_count(story_length)} words
                - Show how curating music becomes an act of self-discovery
                - Explain the deeper meaning behind each song choice
                - Include moments of clarity and personal growth
                - End with confidence and self-understanding
                
                Start with "You opened your music app with purpose..." and show intentional curation.
                """,
                "nostalgic": f"""
                Write a heartwarming story about {user_name} creating a playlist filled with meaningful memories.
                
                Including: {music_list}
                
                The story should:
                - Be written in second person ("You")
                - Be approximately {get_word_count(story_length)} words
                - Connect each song to a specific memory or person
                - Show how music preserves relationships and moments
                - Include emotional discoveries while organizing music
                - End with appreciation for music's role in life
                
                Start with "Each song held a story..." and explore the memories within.
                """,
                "adventurous": f"""
                Write an exciting story about {user_name} creating a playlist for their next big adventure.
                
                Including: {music_list}
                
                The story should:
                - Be written in second person ("You")
                - Be approximately {get_word_count(story_length)} words
                - Frame playlist creation as preparation for adventure
                - Show bold musical choices and risk-taking
                - Include anticipation and excitement for what's ahead
                - End with readiness to embrace new experiences
                
                Start with "The adventure playlist needed..." and build anticipation.
                """
            }
        }
        
        # Select appropriate prompt
        prompt = prompts.get(story_type, {}).get(theme, prompts["journey"]["inspirational"])
        
        # Generate story with Gemini
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        
        # Calculate story metrics
        story_text = response.text
        word_count = len(story_text.split())
        reading_time = max(1, word_count // 200)  # Approximate reading time in minutes
        
        return jsonify({
            "success": True,
            "story": story_text,
            "story_type": story_type,
            "theme": theme,
            "music_featured": music_list,
            "metadata": {
                "word_count": word_count,
                "reading_time_minutes": reading_time,
                "generated_at": datetime.now().isoformat(),
                "story_length": story_length
            }
        })
        
    except Exception as e:
        print(f"Error in generate_story: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@harmony_bp.route("/recommendations", methods=["POST"])
def get_recommendations():
    """Get enhanced recommendations with similarity scoring"""
    try:
        data = request.get_json()
        seed_entity = data.get("seed_entity", "")
        limit = data.get("limit", 8)
        include_metadata = data.get("include_metadata", True)
        
        # Find similar items with Qloo
        similar_entities = qloo_api.find_similar(seed_entity, limit=limit * 2)
        
        recommendations = []
        for entity in similar_entities:
            similarity_score = calculate_similarity_score(seed_entity, entity)
            
            rec_data = {
                "name": entity.name,
                "category": entity.get_category(),
                "types": entity.types,
                "popularity": entity.popularity,
                "similarity_score": similarity_score
            }
            
            if include_metadata:
                rec_data.update({
                    "genre_tags": extract_genre_tags(entity),
                    "recommendation_reason": generate_recommendation_reason(seed_entity, entity)
                })
            
            recommendations.append(rec_data)
        
        # Sort by similarity score and limit
        recommendations.sort(key=lambda x: x["similarity_score"], reverse=True)
        recommendations = recommendations[:limit]
        
        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "seed": seed_entity,
            "metadata": {
                "total_found": len(recommendations),
                "algorithm": "qloo_similarity_enhanced",
                "generated_at": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@harmony_bp.route("/trending", methods=["GET"])
def get_trending():
    """Get enhanced trending music with categories and time periods"""
    try:
        category = request.args.get("category", "music")
        time_period = request.args.get("time_period", "current")  # current, week, month
        limit = int(request.args.get("limit", 12))
        
        # Get trending music with enhanced queries
        trending_queries = {
            "current": ["trending music", "popular songs", "hot tracks"],
            "week": ["weekly trending music", "this week popular", "weekly hits"],
            "month": ["monthly trending music", "this month popular", "monthly hits"]
        }
        
        queries = trending_queries.get(time_period, trending_queries["current"])
        all_trending = []
        
        for query in queries:
            trending_music = qloo_api.search(query, limit=limit//len(queries) + 2)
            all_trending.extend(trending_music)
        
        # Process and enhance trending results
        trending_results = []
        seen_names = set()
        
        for entity in all_trending:
            if entity.name not in seen_names and len(trending_results) < limit:
                seen_names.add(entity.name)
                
                trending_data = {
                    "name": entity.name,
                    "category": entity.get_category(),
                    "types": entity.types,
                    "popularity": entity.popularity,
                    "trend_score": calculate_trend_score(entity),
                    "genre_tags": extract_genre_tags(entity),
                    "trend_reason": generate_trend_reason(entity)
                }
                
                trending_results.append(trending_data)
        
        # Sort by trend score
        trending_results.sort(key=lambda x: x["trend_score"], reverse=True)
        
        return jsonify({
            "success": True,
            "trending": trending_results,
            "metadata": {
                "category": category,
                "time_period": time_period,
                "total_results": len(trending_results),
                "generated_at": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"Error in get_trending: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@harmony_bp.route("/mood-analysis", methods=["POST"])
def analyze_mood():
    """Analyze mood from text input and suggest music"""
    try:
        data = request.get_json()
        text_input = data.get("text", "")
        
        if not text_input.strip():
            return jsonify({
                "success": False,
                "error": "Text input is required"
            }), 400
        
        # Use Gemini to analyze mood
        model = genai.GenerativeModel("gemini-2.5-flash")
        mood_prompt = f"""
        Analyze the emotional tone and mood of this text: "{text_input}"
        
        Return your response as valid JSON with the following structure:
        {{
            "primary_mood": "happy",
            "mood_intensity": 7,
            "secondary_moods": ["energetic", "optimistic"],
            "music_suggestions": ["pop", "upbeat rock", "dance"],
            "explanation": "The text expresses joy and excitement with energetic language"
        }}
        
        Primary mood options: happy, sad, energetic, calm, romantic, nostalgic, anxious, excited, angry, peaceful
        Mood intensity: 1-10 scale
        Include 2-3 music suggestions that match the mood.
        
        Respond ONLY with valid JSON, no other text.
        """
        
        response = model.generate_content(mood_prompt)
        response_text = response.text.strip()
        
        # Clean the response - remove markdown formatting if present
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()
        elif response_text.startswith("```"):
            response_text = response_text.replace("```", "").strip()
        
        # Try to parse JSON with fallback
        try:
            mood_analysis = json.loads(response_text)
        except json.JSONDecodeError as json_error:
            print(f"JSON parsing failed. Response text: {response_text}")
            # Create fallback mood analysis
            mood_analysis = create_fallback_mood_analysis(text_input)
        
        # Validate and fix mood_analysis structure
        mood_analysis = validate_mood_analysis(mood_analysis)
        
        # Get music recommendations based on mood
        primary_mood = mood_analysis.get("primary_mood", "happy")
        music_suggestions = mood_analysis.get("music_suggestions", ["pop"])
        
        # Search for music matching the analyzed mood
        mood_music = []
        try:
            for suggestion in music_suggestions[:2]:  # Limit to 2 suggestions
                search_query = f"{suggestion} {primary_mood} music"
                entities = qloo_api.search(search_query, limit=3)
                for entity in entities:
                    if entity.get_category() == "music" or "music" in str(entity.types).lower():
                        mood_music.append({
                            "name": entity.name,
                            "category": entity.get_category(),
                            "types": entity.types,
                            "popularity": entity.popularity,
                            "mood_match_reason": f"Matches {primary_mood} mood with {suggestion} style"
                        })
                        if len(mood_music) >= 6:  # Stop at 6 recommendations
                            break
                if len(mood_music) >= 6:
                    break
        except Exception as search_error:
            print(f"Music search error: {search_error}")
            # Add some default music if search fails
            mood_music = get_default_mood_music(primary_mood)
        
        return jsonify({
            "success": True,
            "mood_analysis": mood_analysis,
            "recommended_music": mood_music[:6],  # Limit to 6 recommendations
            "metadata": {
                "analyzed_text_length": len(text_input),
                "generated_at": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"Error in analyze_mood: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "Failed to analyze mood. Please try again."
        }), 500

def create_fallback_mood_analysis(text_input):
    """Create fallback mood analysis when AI parsing fails"""
    # Simple keyword-based mood detection
    text_lower = text_input.lower()
    
    mood_keywords = {
        "happy": ["happy", "joy", "excited", "great", "awesome", "love", "amazing", "wonderful"],
        "sad": ["sad", "depressed", "down", "upset", "crying", "hurt", "disappointed"],
        "energetic": ["energy", "pumped", "motivated", "active", "intense", "powerful"],
        "calm": ["calm", "peaceful", "relaxed", "quiet", "serene", "tranquil"],
        "romantic": ["love", "romance", "heart", "romantic", "dating", "relationship"],
        "nostalgic": ["remember", "past", "memories", "nostalgic", "old", "childhood"],
        "anxious": ["worried", "nervous", "anxious", "stress", "fear", "scared"],
        "angry": ["angry", "mad", "frustrated", "annoyed", "rage", "furious"]
    }
    
    detected_mood = "happy"  # default
    max_matches = 0
    
    for mood, keywords in mood_keywords.items():
        matches = sum(1 for keyword in keywords if keyword in text_lower)
        if matches > max_matches:
            max_matches = matches
            detected_mood = mood
    
    # Determine intensity based on punctuation and caps
    intensity = 5  # default
    if "!" in text_input:
        intensity += 2
    if text_input.isupper():
        intensity += 1
    if len(text_input) > 100:
        intensity += 1
    
    intensity = min(10, max(1, intensity))
    
    # Map moods to music suggestions
    music_mapping = {
        "happy": ["pop", "upbeat rock", "dance"],
        "sad": ["ballads", "indie folk", "acoustic"],
        "energetic": ["rock", "electronic", "hip hop"],
        "calm": ["ambient", "classical", "jazz"],
        "romantic": ["R&B", "soft rock", "romantic pop"],
        "nostalgic": ["classic rock", "oldies", "folk"],
        "anxious": ["calming ambient", "soft instrumental", "meditation music"],
        "angry": ["hard rock", "metal", "aggressive hip hop"]
    }
    
    return {
        "primary_mood": detected_mood,
        "mood_intensity": intensity,
        "secondary_moods": [],
        "music_suggestions": music_mapping.get(detected_mood, ["pop", "rock", "alternative"]),
        "explanation": f"Text analysis suggests a {detected_mood} mood based on keyword patterns"
    }

def validate_mood_analysis(analysis):
    """Validate and fix mood analysis structure"""
    valid_moods = ["happy", "sad", "energetic", "calm", "romantic", "nostalgic", "anxious", "excited", "angry", "peaceful"]
    
    # Ensure required fields exist with defaults
    validated = {
        "primary_mood": analysis.get("primary_mood", "happy"),
        "mood_intensity": analysis.get("mood_intensity", 5),
        "secondary_moods": analysis.get("secondary_moods", []),
        "music_suggestions": analysis.get("music_suggestions", ["pop", "rock"]),
        "explanation": analysis.get("explanation", "Mood analysis completed")
    }
    
    # Validate primary mood
    if validated["primary_mood"] not in valid_moods:
        validated["primary_mood"] = "happy"
    
    # Validate intensity
    try:
        validated["mood_intensity"] = max(1, min(10, int(validated["mood_intensity"])))
    except (ValueError, TypeError):
        validated["mood_intensity"] = 5
    
    # Validate secondary moods
    if not isinstance(validated["secondary_moods"], list):
        validated["secondary_moods"] = []
    validated["secondary_moods"] = [mood for mood in validated["secondary_moods"] if mood in valid_moods][:2]
    
    # Validate music suggestions
    if not isinstance(validated["music_suggestions"], list):
        validated["music_suggestions"] = ["pop", "rock"]
    if not validated["music_suggestions"]:
        validated["music_suggestions"] = ["pop", "rock"]
    
    return validated

def get_default_mood_music(mood):
    """Get default music recommendations when search fails"""
    default_music = {
        "happy": [
            {"name": "Happy Songs", "category": "music", "types": ["pop"], "popularity": 0.8, "mood_match_reason": "Uplifting pop music"},
            {"name": "Feel Good Hits", "category": "music", "types": ["rock"], "popularity": 0.7, "mood_match_reason": "Energetic feel-good music"}
        ],
        "sad": [
            {"name": "Sad Ballads", "category": "music", "types": ["ballad"], "popularity": 0.6, "mood_match_reason": "Emotional ballads"},
            {"name": "Melancholy Music", "category": "music", "types": ["indie"], "popularity": 0.5, "mood_match_reason": "Reflective indie music"}
        ],
        "energetic": [
            {"name": "High Energy Rock", "category": "music", "types": ["rock"], "popularity": 0.8, "mood_match_reason": "Pumping rock music"},
            {"name": "Electronic Dance", "category": "music", "types": ["electronic"], "popularity": 0.7, "mood_match_reason": "High-energy electronic"}
        ],
        "calm": [
            {"name": "Peaceful Ambient", "category": "music", "types": ["ambient"], "popularity": 0.6, "mood_match_reason": "Calming ambient sounds"},
            {"name": "Soft Jazz", "category": "music", "types": ["jazz"], "popularity": 0.5, "mood_match_reason": "Relaxing jazz music"}
        ]
    }
    
    return default_music.get(mood, default_music["happy"])

@harmony_bp.route("/playlist-generator", methods=["POST"])
def generate_playlist():
    """Generate a curated playlist based on advanced criteria"""
    try:
        data = request.get_json()
        theme = data.get("theme", "")
        duration_minutes = data.get("duration_minutes", 60)
        mood = data.get("mood", "mixed")
        activity = data.get("activity", "general")  # workout, study, party, relax, etc.
        include_popular = data.get("include_popular", True)
        include_discovery = data.get("include_discovery", True)
        
        # Generate playlist based on criteria
        playlist_queries = []
        
        # Add theme-based queries
        if theme:
            playlist_queries.append(f"{theme} music")
        
        # Add activity-based queries
        activity_queries = {
            "workout": ["energetic music", "pump up songs", "high energy"],
            "study": ["focus music", "ambient study", "concentration music"],
            "party": ["party music", "dance hits", "upbeat songs"],
            "relax": ["relaxing music", "chill songs", "calm music"],
            "commute": ["commute music", "travel songs", "road trip music"],
            "work": ["background music", "productive music", "work playlist"]
        }
        
        if activity in activity_queries:
            playlist_queries.extend(activity_queries[activity])
        
        # Add mood-based queries
        if mood != "mixed":
            playlist_queries.append(f"{mood} music")
        
        # Search for tracks
        all_tracks = []
        for query in playlist_queries[:3]:  # Limit queries to avoid rate limits
            tracks = qloo_api.search(query, limit=8)
            all_tracks.extend([t for t in tracks if t.get_category() == "music"])
        
        # Remove duplicates and score tracks
        unique_tracks = {}
        for track in all_tracks:
            if track.name not in unique_tracks:
                playlist_score = calculate_playlist_score(track, theme, mood, activity)
                unique_tracks[track.name] = {
                    "name": track.name,
                    "category": track.get_category(),
                    "types": track.types,
                    "popularity": track.popularity,
                    "playlist_score": playlist_score,
                    "genre_tags": extract_genre_tags(track),
                    "estimated_duration": random.randint(180, 300)  # 3-5 minutes
                }
        
        # Sort by playlist score and create balanced playlist
        sorted_tracks = sorted(unique_tracks.values(), key=lambda x: x["playlist_score"], reverse=True)
        
        # Calculate how many tracks we need (assuming average 4 minutes per track)
        target_tracks = max(10, duration_minutes // 4)
        playlist_tracks = sorted_tracks[:target_tracks]
        
        # Calculate actual playlist duration
        total_duration = sum(track["estimated_duration"] for track in playlist_tracks)
        
        return jsonify({
            "success": True,
            "playlist": {
                "name": f"{theme.title() if theme else activity.title()} Playlist",
                "description": f"Curated {activity} playlist for {mood} mood",
                "tracks": playlist_tracks,
                "total_tracks": len(playlist_tracks),
                "total_duration_seconds": total_duration,
                "total_duration_minutes": round(total_duration / 60, 1),
                "created_at": datetime.now().isoformat()
            },
            "criteria": {
                "theme": theme,
                "mood": mood,
                "activity": activity,
                "target_duration_minutes": duration_minutes
            }
        })
        
    except Exception as e:
        print(f"Error in generate_playlist: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Helper functions
def calculate_relevance_score(entity, mood, genre):
    """Calculate relevance score for music entity"""
    score = 0.5  # Base score
    
    # Popularity boost
    if entity.popularity:
        score += entity.popularity * 0.3
    
    # Genre matching
    if genre and entity.types:
        genre_match = any(genre.lower() in str(t).lower() for t in entity.types)
        if genre_match:
            score += 0.2
    
    # Random factor for diversity
    score += random.uniform(0, 0.1)
    
    return min(1.0, score)

def get_mood_match(entity, mood):
    """Get mood matching score"""
    mood_keywords = {
        "happy": ["upbeat", "cheerful", "positive", "joyful"],
        "sad": ["melancholic", "emotional", "slow", "ballad"],
        "energetic": ["high energy", "fast", "pump", "intense"],
        "calm": ["peaceful", "relaxing", "ambient", "soft"],
        "romantic": ["love", "romantic", "intimate", "tender"]
    }
    
    keywords = mood_keywords.get(mood, [])
    if entity.types:
        for keyword in keywords:
            if any(keyword in str(t).lower() for t in entity.types):
                return 0.8
    
    return 0.3

def extract_genre_tags(entity):
    """Extract genre tags from entity"""
    if not entity.types:
        return []
    
    # Common genre keywords
    genres = ["rock", "pop", "jazz", "classical", "electronic", "hip hop", "country", "folk", "blues", "reggae"]
    found_genres = []
    
    for genre in genres:
        if any(genre in str(t).lower() for t in entity.types):
            found_genres.append(genre.title())
    
    return found_genres[:3]  # Limit to 3 genres

def calculate_similarity_score(seed, entity):
    """Calculate similarity score between seed and entity"""
    base_score = 0.5
    
    # Name similarity (simple check)
    if seed.lower() in entity.name.lower() or entity.name.lower() in seed.lower():
        base_score += 0.3
    
    # Add randomness for diversity
    base_score += random.uniform(0, 0.2)
    
    return min(1.0, base_score)

def generate_recommendation_reason(seed, entity):
    """Generate reason for recommendation"""
    reasons = [
        f"Similar style to {seed}",
        f"Fans of {seed} also enjoy this",
        f"Shares musical DNA with {seed}",
        f"Recommended based on {seed}",
        f"Perfect companion to {seed}"
    ]
    return random.choice(reasons)

def calculate_trend_score(entity):
    """Calculate trending score"""
    score = 0.5
    if entity.popularity:
        score += entity.popularity * 0.4
    score += random.uniform(0, 0.1)
    return min(1.0, score)

def generate_trend_reason(entity):
    """Generate reason for trending"""
    reasons = [
        "Rising in popularity",
        "Viral on social media",
        "Featured in popular playlists",
        "Gaining mainstream attention",
        "Trending across platforms"
    ]
    return random.choice(reasons)

def get_word_count(length):
    """Get target word count for story length"""
    counts = {
        "short": "200-300",
        "medium": "400-500",
        "long": "600-800"
    }
    return counts.get(length, "400-500")

def calculate_playlist_score(track, theme, mood, activity):
    """Calculate score for playlist inclusion"""
    score = 0.5
    
    if track.popularity:
        score += track.popularity * 0.3
    
    # Theme matching
    if theme and track.types:
        if any(theme.lower() in str(t).lower() for t in track.types):
            score += 0.2
    
    # Activity matching
    activity_boosts = {
        "workout": 0.2 if any(word in str(track.types).lower() for word in ["energetic", "fast", "pump"]) else 0,
        "study": 0.2 if any(word in str(track.types).lower() for word in ["ambient", "calm", "focus"]) else 0,
        "party": 0.2 if any(word in str(track.types).lower() for word in ["dance", "upbeat", "party"]) else 0
    }
    
    score += activity_boosts.get(activity, 0)
    score += random.uniform(0, 0.1)
    
    return min(1.0, score)

@harmony_bp.route("/profile", methods=["POST"])
def build_taste_profile():
    """Build enhanced taste profile with detailed analysis"""
    try:
        data = request.get_json()
        interests = data.get("interests", [])
        
        # Build taste profile with Qloo
        taste_profile = qloo_api.build_taste_profile(interests)
        
        # Enhanced profile formatting with analytics
        formatted_profile = {}
        total_entities = 0
        category_distribution = {}
        
        for interest, categories in taste_profile.items():
            formatted_profile[interest] = {}
            for category, entities in categories.items():
                entity_data = []
                for entity in entities[:5]:  # Limit to 5 per category
                    entity_info = {
                        "name": entity.name,
                        "category": entity.get_category(),
                        "types": entity.types,
                        "popularity": entity.popularity,
                        "profile_relevance": calculate_relevance_score(entity, "mixed", interest)
                    }
                    entity_data.append(entity_info)
                    total_entities += 1
                
                formatted_profile[interest][category] = entity_data
                category_distribution[category] = category_distribution.get(category, 0) + len(entity_data)
        
        # Generate profile insights
        insights = generate_profile_insights(formatted_profile, category_distribution)
        
        return jsonify({
            "success": True,
            "profile": formatted_profile,
            "analytics": {
                "total_entities": total_entities,
                "category_distribution": category_distribution,
                "interests_analyzed": len(interests),
                "profile_diversity_score": calculate_diversity_score(category_distribution)
            },
            "insights": insights,
            "generated_at": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in build_taste_profile: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@harmony_bp.route("/cross-domain", methods=["POST"])
def cross_domain_discovery():
    """Enhanced cross-domain discovery with detailed connections"""
    try:
        data = request.get_json()
        seed_entity = data.get("seed_entity", "")
        domains = data.get("domains", ["movies", "books", "restaurants"])
        limit = data.get("limit", 5)
        
        # Cross-domain discovery with Qloo
        cross_results = qloo_api.cross_domain_discovery(seed_entity, domains, limit=limit)
        
        # Enhanced formatting with connection explanations
        formatted_results = {}
        for domain, entities in cross_results.items():
            domain_data = []
            for entity in entities:
                entity_info = {
                    "name": entity.name,
                    "category": entity.get_category(),
                    "types": entity.types,
                    "popularity": entity.popularity,
                    "connection_strength": calculate_connection_strength(seed_entity, entity),
                    "connection_explanation": generate_connection_explanation(seed_entity, entity, domain)
                }
                domain_data.append(entity_info)
            
            formatted_results[domain] = domain_data
        
        return jsonify({
            "success": True,
            "cross_domain_results": formatted_results,
            "seed": seed_entity,
            "metadata": {
                "domains_explored": len(domains),
                "total_connections": sum(len(entities) for entities in formatted_results.values()),
                "generated_at": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"Error in cross_domain_discovery: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def generate_profile_insights(profile, distribution):
    """Generate insights about user's taste profile"""
    insights = []
    
    # Diversity insight
    if len(distribution) > 3:
        insights.append("You have diverse tastes across multiple categories")
    elif len(distribution) <= 2:
        insights.append("You have focused preferences in specific areas")
    
    # Dominant category insight
    if distribution:
        dominant_category = max(distribution.items(), key=lambda x: x[1])
        insights.append(f"Your strongest interest area is {dominant_category[0]}")
    
    # Music preference insight
    if "music" in distribution:
        insights.append("Music plays a significant role in your taste profile")
    
    return insights

def calculate_diversity_score(distribution):
    """Calculate diversity score for taste profile"""
    if not distribution:
        return 0.0
    
    total = sum(distribution.values())
    if total == 0:
        return 0.0
    
    # Calculate entropy-based diversity score
    diversity = 0
    for count in distribution.values():
        if count > 0:
            p = count / total
            diversity -= p * (p.bit_length() - 1) if p > 0 else 0
    
    return min(1.0, diversity / 3)  # Normalize to 0-1 scale

def calculate_connection_strength(seed, entity):
    """Calculate connection strength between entities"""
    base_strength = 0.5
    
    # Simple name similarity check
    if seed.lower() in entity.name.lower():
        base_strength += 0.3
    
    # Add randomness for variety
    base_strength += random.uniform(0, 0.2)
    
    return min(1.0, base_strength)

def generate_connection_explanation(seed, entity, domain):
    """Generate explanation for cross-domain connection"""
    explanations = {
        "movies": [
            f"Shares thematic elements with {seed}",
            f"Appeals to similar audiences as {seed}",
            f"Has cultural connections to {seed}"
        ],
        "books": [
            f"Explores similar themes as {seed}",
            f"Appeals to fans of {seed}",
            f"Shares artistic sensibilities with {seed}"
        ],
        "restaurants": [
            f"Matches the vibe of {seed}",
            f"Popular among {seed} fans",
            f"Complements the {seed} experience"
        ]
    }
    
    domain_explanations = explanations.get(domain, [f"Connected to {seed} through cultural relevance"])
    return random.choice(domain_explanations)

@harmony_bp.route("/health", methods=["GET"])
def health_check():
    """Enhanced API health check with feature status"""
    return jsonify({
        "success": True,
        "message": "Harmony AI API is running",
        "version": "2.0.0",
        "features": {
            "music_discovery": True,
            "story_generation": True,
            "recommendations": True,
            "trending": True,
            "mood_analysis": True,
            "playlist_generation": True,
            "taste_profile": True,
            "cross_domain": True
        },
        "apis": {
            "qloo_configured": bool(os.getenv("QLOO_API_KEY")),
            "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
        },
        "timestamp": datetime.now().isoformat()
    })


