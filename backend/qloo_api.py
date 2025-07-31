#!/usr/bin/env python3
"""
Qloo Hackathon API Wrapper - Production Ready
Optimized wrapper for building hackathon projects with the Qloo API
"""

import requests
import json
import time
import hashlib
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from functools import lru_cache

@dataclass
class QlooEntity:
    """Represents a Qloo entity with all available information"""
    name: str
    entity_id: Optional[str] = None
    types: Optional[List[str]] = None
    properties: Optional[Dict] = None
    popularity: Optional[float] = None
    raw_data: Optional[Dict] = None
    
    def __post_init__(self):
        """Extract additional info from raw_data if available"""
        if self.raw_data:
            self.entity_id = self.raw_data.get("entity_id", self.entity_id)
            self.types = self.raw_data.get("types", self.types)
            self.properties = self.raw_data.get("properties", self.properties)
            self.popularity = self.raw_data.get("popularity", self.popularity)
    
    def get_category(self) -> str:
        """Infer the main category from types or properties"""
        if self.types:
            # Common type mappings
            type_categories = {
                "music": ["artist", "song", "album", "band"],
                "movie": ["film", "movie", "cinema"],
                "book": ["book", "novel", "literature"],
                "restaurant": ["restaurant", "cuisine", "food"],
                "fashion": ["brand", "clothing", "fashion"]
            }
            
            for category, keywords in type_categories.items():
                if any(keyword in str(self.types).lower() for keyword in keywords):
                    return category
        return "general"
    
    def __str__(self):
        return f"{self.name} ({self.get_category()})"

class QlooAPI:
    """Production-ready Qloo API wrapper for hackathon development"""
    
    def __init__(self, api_key: str, base_url: str = "https://hackathon.api.qloo.com"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 0.1  # 100ms between requests
        
        # Cache for search results
        self._search_cache = {}
    
    def _rate_limit(self):
        """Simple rate limiting to avoid overwhelming the API"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()
    
    def _make_request(self, endpoint: str, params: Dict = None, use_cache: bool = True) -> Optional[Dict]:
        """Make a request with error handling and caching"""
        self._rate_limit()
        
        # Create cache key
        cache_key = None
        if use_cache and params:
            cache_key = hashlib.md5(f"{endpoint}_{json.dumps(params, sort_keys=True)}".encode()).hexdigest()
            if cache_key in self._search_cache:
                return self._search_cache[cache_key]
        
        try:
            url = f"{self.base_url}{endpoint}"
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if use_cache and cache_key:
                    self._search_cache[cache_key] = data
                return data
            elif response.status_code == 403:
                print(f"⚠️ Access forbidden for {endpoint} with params {params}")
                return None
            else:
                print(f"❌ Request failed: {response.status_code} - {response.text[:100]}")
                return None
                
        except Exception as e:
            print(f"❌ Request error: {e}")
            return None
    
    def search(self, query: str, limit: int = 20, offset: int = 0) -> List[QlooEntity]:
        """
        Search for entities across all categories
        This is the main working endpoint for the hackathon API
        """
        params = {
            "query": query,
            "limit": limit,
            "offset": offset
        }
        
        data = self._make_request("/search", params)
        if not data or "results" not in data:
            return []
        
        entities = []
        for result in data["results"]:
            entity = QlooEntity(
                name=result.get("name", "Unknown"),
                raw_data=result
            )
            entities.append(entity)
        
        return entities
    
    def discover_by_category(self, category: str, limit: int = 10) -> List[QlooEntity]:
        """
        Discover entities by category using smart search queries
        Works around API limitations by using creative search terms
        """
        category_queries = {
            "music": ["popular music", "trending songs", "new artists", "indie music", "rock bands"],
            "movies": ["popular movies", "new films", "blockbuster", "indie films", "classic movies"],
            "books": ["bestselling books", "popular novels", "new releases", "fiction books"],
            "restaurants": ["popular restaurants", "fine dining", "casual dining", "food trends"],
            "fashion": ["fashion brands", "clothing brands", "streetwear", "luxury fashion"]
        }
        
        queries = category_queries.get(category.lower(), [category])
        all_entities = []
        
        for query in queries[:2]:  # Limit to 2 queries to avoid rate limits
            entities = self.search(query, limit=limit//2)
            all_entities.extend(entities)
            if len(all_entities) >= limit:
                break
        
        # Remove duplicates based on name
        seen_names = set()
        unique_entities = []
        for entity in all_entities:
            if entity.name not in seen_names:
                seen_names.add(entity.name)
                unique_entities.append(entity)
        
        return unique_entities[:limit]
    
    def find_similar(self, entity_name: str, limit: int = 10) -> List[QlooEntity]:
        """
        Find similar entities by using the entity name in search queries
        Simulates recommendation functionality
        """
        # Try different search patterns to find similar items
        search_patterns = [
            f"similar to {entity_name}",
            f"like {entity_name}",
            f"{entity_name} related",
            entity_name.split()[0] if " " in entity_name else entity_name  # First word
        ]
        
        all_entities = []
        for pattern in search_patterns:
            entities = self.search(pattern, limit=limit//2)
            # Filter out exact matches
            filtered = [e for e in entities if e.name.lower() != entity_name.lower()]
            all_entities.extend(filtered)
            
            if len(all_entities) >= limit:
                break
        
        # Remove duplicates and return
        seen_names = set()
        unique_entities = []
        for entity in all_entities:
            if entity.name not in seen_names:
                seen_names.add(entity.name)
                unique_entities.append(entity)
        
        return unique_entities[:limit]
    
    def get_trending(self, category: Optional[str] = None, limit: int = 10) -> List[QlooEntity]:
        """
        Get trending items by searching for trend-related terms
        """
        if category:
            queries = [f"trending {category}", f"popular {category}", f"hot {category}"]
        else:
            queries = ["trending", "popular", "hot", "viral"]
        
        for query in queries:
            entities = self.search(query, limit=limit)
            if entities:
                return entities
        
        return []
    
    def multi_search(self, queries: List[str], limit_per_query: int = 5) -> Dict[str, List[QlooEntity]]:
        """
        Perform multiple searches in one call
        Useful for building comprehensive discovery experiences
        """
        results = {}
        for query in queries:
            entities = self.search(query, limit=limit_per_query)
            results[query] = entities
        return results
    
    def build_taste_profile(self, user_interests: List[str]) -> Dict[str, List[QlooEntity]]:
        """
        Build a taste profile by searching for user interests
        Returns categorized recommendations
        """
        profile = {}
        
        for interest in user_interests:
            # Search for the interest
            entities = self.search(interest, limit=10)
            
            if entities:
                # Group by category
                categorized = {}
                for entity in entities:
                    category = entity.get_category()
                    if category not in categorized:
                        categorized[category] = []
                    categorized[category].append(entity)
                
                profile[interest] = categorized
        
        return profile
    
    def cross_domain_discovery(self, seed_entity: str, target_domains: List[str], limit: int = 5) -> Dict[str, List[QlooEntity]]:
        """
        Discover items across different domains based on a seed entity
        E.g., from "Taylor Swift" find movies, books, fashion related to pop culture
        """
        results = {}
        
        for domain in target_domains:
            # Create cross-domain search queries
            queries = [
                f"{seed_entity} {domain}",
                f"{domain} like {seed_entity}",
                f"{domain} inspired by {seed_entity}"
            ]
            
            domain_entities = []
            for query in queries:
                entities = self.search(query, limit=limit//len(queries) + 1)
                domain_entities.extend(entities)
                
                if len(domain_entities) >= limit:
                    break
            
            # Remove duplicates
            seen_names = set()
            unique_entities = []
            for entity in domain_entities:
                if entity.name not in seen_names:
                    seen_names.add(entity.name)
                    unique_entities.append(entity)
            
            results[domain] = unique_entities[:limit]
        
        return results



