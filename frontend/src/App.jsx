import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Music, Sparkles, Heart, TrendingUp, Search, Play, BookOpen, Loader2, Star, Zap, Headphones, Brain, Clock, Activity, Palette, User, Image, Settings } from 'lucide-react'
import { StoryDisplay, MoodAnalysisDisplay, PlaylistDisplay, RecommendationsDisplay } from './components/ResultsDisplay.jsx'
import { BackgroundImageManager, MusicCardBackground, AnimatedMusicBackground } from './components/BackgroundImageManager.jsx'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import { ThemeToggle } from './components/ThemeToggle.jsx'
import './App.css'

const API_BASE_URL = 'http://localhost:5001/api'

function App() {
  const [activeTab, setActiveTab] = useState('discover')
  const [searchInput, setSearchInput] = useState('')
  const [mood, setMood] = useState('happy')
  const [genre, setGenre] = useState('')
  const [userName, setUserName] = useState('')
  const [storyType, setStoryType] = useState('journey')
  const [storyTheme, setStoryTheme] = useState('inspirational')
  const [storyLength, setStoryLength] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [musicResults, setMusicResults] = useState([])
  const [story, setStory] = useState('')
  const [storyMetadata, setStoryMetadata] = useState(null)
  const [musicFeatured, setMusicFeatured] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [trending, setTrending] = useState([])
  const [selectedMusic, setSelectedMusic] = useState([])
  const [moodAnalysis, setMoodAnalysis] = useState(null)
  const [moodText, setMoodText] = useState('')
  const [playlist, setPlaylist] = useState(null)
  const [playlistCriteria, setPlaylistCriteria] = useState({
    theme: '',
    activity: 'general',
    duration: 60
  })
  const [showBackgrounds, setShowBackgrounds] = useState(true)

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchTrending = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trending`)
      const data = await response.json()
      if (data.success) {
        setTrending(data.trending)
      }
    } catch (error) {
      console.error('Error fetching trends:', error)
    }
  }

  const handleDiscover = async () => {
    if (!searchInput.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: searchInput,
          mood: mood,
          genre: genre,
          limit: 12
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setMusicResults(data.results)
      }
    } catch (error) {
      console.error('Error during discovery:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateStory = async () => {
    if (selectedMusic.length === 0 || !userName.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          music_preferences: selectedMusic,
          user_name: userName,
          story_type: storyType,
          theme: storyTheme,
          story_length: storyLength
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setStory(data.story)
        setStoryMetadata(data.metadata)
        setMusicFeatured(data.music_featured)
      }
    } catch (error) {
      console.error('Error generating story:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetRecommendations = async (seedEntity) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seed_entity: seedEntity,
          limit: 8,
          include_metadata: true
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMoodAnalysis = async () => {
    if (!moodText.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/mood-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: moodText
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setMoodAnalysis(data)
      }
    } catch (error) {
      console.error('Error analyzing mood:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePlaylist = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/playlist-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: playlistCriteria.theme,
          activity: playlistCriteria.activity,
          duration_minutes: playlistCriteria.duration,
          mood: mood,
          include_popular: true,
          include_discovery: true
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setPlaylist(data.playlist)
      }
    } catch (error) {
      console.error('Error generating playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMusicSelection = (music) => {
    setSelectedMusic(prev => {
      const isSelected = prev.some(m => m.name === music.name)
      if (isSelected) {
        return prev.filter(m => m.name !== music.name)
      } else {
        return [...prev, music]
      }
    })
  }

  const EnhancedMusicCard = ({ music, isSelected, onToggle, showRecommendations = false, showMetadata = false }) => (
    <MusicCardBackground music={music} className="rounded-lg">
      <Card 
        className={`cursor-pointer transition-all duration-500 hover:scale-105 music-wave card-enter ${
          isSelected ? 'ring-2 ring-primary pulse-glow' : ''
        } group relative overflow-hidden bg-transparent border-white/20`}
        onClick={() => onToggle && onToggle(music)}
      >
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="h-4 w-4 text-primary opacity-70" />
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors text-white">
                  {music.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
                  {music.category || 'Music'}
                </Badge>
                {music.popularity && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-white/80">
                      {Math.round(music.popularity * 100)}%
                    </span>
                  </div>
                )}
                {music.relevance_score && (
                  <Badge variant="outline" className="text-xs border-white/30 text-white/90 backdrop-blur-sm">
                    {Math.round(music.relevance_score * 100)}% match
                  </Badge>
                )}
              </div>
              {showMetadata && music.genre_tags && music.genre_tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {music.genre_tags.slice(0, 2).map((genre, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs opacity-70 border-white/20 text-white/70 backdrop-blur-sm">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
              {music.recommendation_reason && (
                <p className="text-xs text-white/70 mt-2 italic">
                  {music.recommendation_reason}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {showRecommendations && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGetRecommendations(music.name)
                  }}
                >
                  <Search className="h-3 w-3" />
                </Button>
              )}
              <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors backdrop-blur-sm">
                <Music className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
        {isSelected && (
          <div className="absolute top-2 right-2 z-20">
            <div className="bg-primary text-primary-foreground rounded-full p-1 backdrop-blur-sm">
              <Zap className="h-3 w-3" />
            </div>
          </div>
        )}
      </Card>
    </MusicCardBackground>
  )

  const LoadingSpinner = () => (
    <div className="flex items-center gap-2">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )

  return (
    <ThemeProvider defaultTheme="dark" storageKey="harmony-ai-theme">
      <div className="min-h-screen bg-background relative">
        {/* Background Animation for Header */}
        <AnimatedMusicBackground isActive={true} className="fixed inset-0 z-0" />
        
        {/* Enhanced Header with Professional Gradient */}
        <header className="gradient-bg text-white py-12 relative overflow-hidden z-10">
          <div className="container mx-auto px-4 text-center relative z-10">
            {/* Theme Toggle in top right */}
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="float-animation">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                  <img 
                    src="/images/BeatTeller_logo.png" 
                    alt="BeatTeller Logo" 
                    className="h-16 w-16 object-contain"
                  />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent header-text">
                  BeatTeller
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1 w-8 bg-white/60 rounded-full"></div>
                  <Sparkles className="h-5 w-5 float-animation" style={{ animationDelay: '1s' }} />
                  <div className="h-1 w-8 bg-white/60 rounded-full"></div>
                </div>
              </div>
            </div>
            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed header-text">
              Discover your perfect soundtrack with AI-powered taste intelligence and personalized storytelling
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-80 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Qloo Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span>Gemini AI Stories</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span>Smart Recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <span>Dynamic Backgrounds</span>
              </div>
            </div>
            
            {/* Background Toggle */}
            <div className="mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBackgrounds(!showBackgrounds)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Image className="h-4 w-4 mr-2" />
                {showBackgrounds ? 'Hide' : 'Show'} Dynamic Backgrounds
              </Button>
            </div>
          </div>
        </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full tabs-enhanced">
          <TabsList className="grid w-full grid-cols-6 mb-12 h-14 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="discover" className="flex items-center gap-2 text-sm font-medium">
              <Search className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="story" className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Story
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2 text-sm font-medium">
              <Heart className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2 text-sm font-medium">
              <Brain className="h-4 w-4" />
              Mood
            </TabsTrigger>
            <TabsTrigger value="playlist" className="flex items-center gap-2 text-sm font-medium">
              <Palette className="h-4 w-4" />
              Playlist
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Discover Tab with Dynamic Background */}
          <TabsContent value="discover" className="space-y-8 slide-up-enter">
            <BackgroundImageManager 
              searchQuery={showBackgrounds ? searchInput : ''}
              mood={mood}
              genre={genre}
              className="rounded-lg"
            >
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl text-white">
                    <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-sm">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    Personalized Music Discovery
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-white/80">
                    Harness the power of Qloo's taste intelligence to uncover music that resonates with your unique preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Describe your musical journey (e.g., 'atmospheric indie rock for late night drives')"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleDiscover()}
                        className="h-12 text-base focus-enhanced bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger className="h-12 focus-enhanced bg-white/10 border-white/20 text-white backdrop-blur-sm">
                          <SelectValue placeholder="Mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="happy">🌟 Happy</SelectItem>
                          <SelectItem value="sad">🌙 Melancholic</SelectItem>
                          <SelectItem value="energetic">⚡ Energetic</SelectItem>
                          <SelectItem value="calm">🧘 Calm</SelectItem>
                          <SelectItem value="romantic">💕 Romantic</SelectItem>
                          <SelectItem value="nostalgic">🌅 Nostalgic</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Genre (optional)"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="h-12 focus-enhanced bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleDiscover} 
                    disabled={loading || !searchInput.trim()}
                    className="w-full h-12 text-base btn-primary focus-enhanced backdrop-blur-sm"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner />
                        Discovering your perfect sound...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Discover Music
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </BackgroundImageManager>

            {musicResults.length > 0 && (
              <Card className="slide-up-enter bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Zap className="h-5 w-5 text-green-500" />
                    </div>
                    Discovery Results
                    <Badge variant="secondary" className="ml-auto">
                      {musicResults.length} tracks found
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Click on tracks to add them to your collection for personalized storytelling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {musicResults.map((music, index) => (
                      <EnhancedMusicCard
                        key={index}
                        music={music}
                        isSelected={selectedMusic.some(m => m.name === music.name)}
                        onToggle={toggleMusicSelection}
                        showRecommendations={true}
                        showMetadata={true}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Enhanced Story Tab */}
          <TabsContent value="story" className="space-y-8 slide-up-enter">
            <Card className="glass-effect">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  AI-Powered Story Generation
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Transform your musical selections into captivating narratives with Gemini AI's creative storytelling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-12 text-base focus-enhanced"
                  />
                  <Select value={storyType} onValueChange={setStoryType}>
                    <SelectTrigger className="h-12 focus-enhanced">
                      <SelectValue placeholder="Story Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="journey">🎵 Musical Journey</SelectItem>
                      <SelectItem value="concert">🎤 Magical Concert</SelectItem>
                      <SelectItem value="playlist">📱 Perfect Playlist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select value={storyTheme} onValueChange={setStoryTheme}>
                    <SelectTrigger className="h-12 focus-enhanced">
                      <SelectValue placeholder="Story Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inspirational">✨ Inspirational</SelectItem>
                      <SelectItem value="nostalgic">🌅 Nostalgic</SelectItem>
                      <SelectItem value="adventurous">🚀 Adventurous</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={storyLength} onValueChange={setStoryLength}>
                    <SelectTrigger className="h-12 focus-enhanced">
                      <SelectValue placeholder="Story Length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">📝 Short (200-300 words)</SelectItem>
                      <SelectItem value="medium">📄 Medium (400-500 words)</SelectItem>
                      <SelectItem value="long">📚 Long (600-800 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedMusic.length > 0 && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Music className="h-4 w-4 text-primary" />
                      Selected Music ({selectedMusic.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMusic.map((music, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-destructive/10 hover:border-destructive/50 transition-colors px-3 py-1" 
                          onClick={() => toggleMusicSelection(music)}
                        >
                          {music.name} ✕
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleGenerateStory} 
                  disabled={loading || selectedMusic.length === 0 || !userName.trim()}
                  className="w-full h-12 text-base btn-primary focus-enhanced"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Crafting your story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate My Story
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {story && (
              <StoryDisplay
                story={story}
                metadata={storyMetadata}
                theme={storyTheme}
                storyType={storyType}
                musicFeatured={musicFeatured}
              />
            )}
          </TabsContent>

          {/* Enhanced Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-8 slide-up-enter">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  Smart Recommendations
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Discover similar tracks by clicking the search icon next to any song
                </CardDescription>
              </CardHeader>
            </Card>

            {recommendations.length > 0 && (
              <RecommendationsDisplay
                recommendations={recommendations}
                onTrackSelect={toggleMusicSelection}
                selectedTracks={selectedMusic}
              />
            )}
          </TabsContent>

          {/* Enhanced Trending Tab */}
          <TabsContent value="trending" className="space-y-8 slide-up-enter">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  Music Trends
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Explore what's capturing hearts and minds in the music world right now
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trending.map((music, index) => (
                    <EnhancedMusicCard
                      key={index}
                      music={music}
                      isSelected={selectedMusic.some(m => m.name === music.name)}
                      onToggle={toggleMusicSelection}
                      showMetadata={true}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Mood Analysis Tab */}
          <TabsContent value="mood" className="space-y-8 slide-up-enter">
            <BackgroundImageManager 
              searchQuery={showBackgrounds ? moodText : ''}
              mood="mixed"
              genre=""
              className="rounded-lg"
            >
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl text-white">
                    <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-sm">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    AI Mood Analysis
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-white/80">
                    Describe how you're feeling and get personalized music recommendations based on your emotional state
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Textarea
                    placeholder="Tell me about your current mood, what you're thinking about, or how your day has been..."
                    value={moodText}
                    onChange={(e) => setMoodText(e.target.value)}
                    className="min-h-32 text-base focus-enhanced bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                  />
                  <Button 
                    onClick={handleMoodAnalysis} 
                    disabled={loading || !moodText.trim()}
                    className="w-full h-12 text-base btn-primary focus-enhanced backdrop-blur-sm"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner />
                        Analyzing your mood...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-5 w-5" />
                        Analyze Mood & Get Music
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </BackgroundImageManager>

            {moodAnalysis && (
              <MoodAnalysisDisplay
                analysis={moodAnalysis.mood_analysis}
                recommendedMusic={moodAnalysis.recommended_music}
              />
            )}
          </TabsContent>

          {/* Enhanced Playlist Generator Tab */}
          <TabsContent value="playlist" className="space-y-8 slide-up-enter">
            <BackgroundImageManager 
              searchQuery={showBackgrounds ? playlistCriteria.theme : ''}
              mood={mood}
              genre=""
              className="rounded-lg"
            >
              <Card className="glass-effect bg-transparent border-white/20">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl text-white">
                    <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-sm">
                      <Palette className="h-6 w-6 text-primary" />
                    </div>
                    Smart Playlist Generator
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed text-white/80">
                    Create curated playlists tailored to your activities, mood, and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      placeholder="Playlist theme (e.g., 'summer vibes', 'late night coding')"
                      value={playlistCriteria.theme}
                      onChange={(e) => setPlaylistCriteria(prev => ({ ...prev, theme: e.target.value }))}
                      className="h-12 text-base focus-enhanced bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                    />
                    <Select 
                      value={playlistCriteria.activity} 
                      onValueChange={(value) => setPlaylistCriteria(prev => ({ ...prev, activity: value }))}
                    >
                      <SelectTrigger className="h-12 focus-enhanced bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <SelectValue placeholder="Activity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">🎵 General Listening</SelectItem>
                        <SelectItem value="workout">💪 Workout</SelectItem>
                        <SelectItem value="study">📚 Study/Focus</SelectItem>
                        <SelectItem value="party">🎉 Party</SelectItem>
                        <SelectItem value="relax">🧘 Relax</SelectItem>
                        <SelectItem value="commute">🚗 Commute</SelectItem>
                        <SelectItem value="work">💼 Work</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Duration: {playlistCriteria.duration} minutes</label>
                      <input
                        type="range"
                        min="15"
                        max="180"
                        step="15"
                        value={playlistCriteria.duration}
                        onChange={(e) => setPlaylistCriteria(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer backdrop-blur-sm"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleGeneratePlaylist} 
                    disabled={loading}
                    className="w-full h-12 text-base btn-primary focus-enhanced backdrop-blur-sm"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner />
                        Generating playlist...
                      </>
                    ) : (
                      <>
                        <Palette className="mr-2 h-5 w-5" />
                        Generate Playlist
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </BackgroundImageManager>

            {playlist && (
              <PlaylistDisplay
                playlist={playlist}
                onTrackSelect={toggleMusicSelection}
                selectedTracks={selectedMusic}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-8 mt-16 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="h-5 w-5 text-primary" />
            <span className="font-semibold">BeatTeller</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <span className="text-sm text-muted-foreground">Qloo LLM Hackathon 2025</span>
          </div>
          <p className="text-sm opacity-70 mt-2">
            Where music meets artificial intelligence ✨
          </p>
        </div>
      </footer>
      </div>
    </ThemeProvider>
  )
}

export default App

