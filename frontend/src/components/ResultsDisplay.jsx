import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { 
  Sparkles, 
  Clock, 
  User, 
  Music, 
  Brain, 
  Star, 
  Copy, 
  Share, 
  Download,
  Play,
  Pause,
  Volume2,
  BookOpen,
  Zap,
  Heart,
  TrendingUp
} from 'lucide-react'

export const StoryDisplay = ({ story, metadata, theme, storyType, musicFeatured }) => {
  const [isReading, setIsReading] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(story)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Harmony AI Story',
          text: story.substring(0, 100) + '...',
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing: ', err)
      }
    }
  }

  const getThemeIcon = (theme) => {
    switch (theme) {
      case 'inspirational': return <Sparkles className="h-4 w-4" />
      case 'nostalgic': return <Heart className="h-4 w-4" />
      case 'adventurous': return <Zap className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getThemeColor = (theme) => {
    switch (theme) {
      case 'inspirational': return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
      case 'nostalgic': return 'from-purple-500/10 to-pink-500/10 border-purple-500/20'
      case 'adventurous': return 'from-green-500/10 to-blue-500/10 border-green-500/20'
      default: return 'from-primary/10 to-accent/10 border-primary/20'
    }
  }

  return (
    <Card className="slide-up-enter overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${getThemeColor(theme)}`}>
              {getThemeIcon(theme)}
            </div>
            Your Personalized Story
            <Badge variant="outline" className="capitalize">
              {theme} {storyType}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="hover:bg-primary/10"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="hover:bg-primary/10"
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
        
        {metadata && (
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {metadata.reading_time_minutes} min read
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {metadata.word_count} words
            </div>
            <div className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              {musicFeatured?.split(', ').length || 0} tracks featured
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className={`p-6 rounded-lg bg-gradient-to-br ${getThemeColor(theme)} relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-transparent"></div>
          </div>
          
          <div className="relative z-10">
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed text-base font-medium">
                {story}
              </p>
            </div>
            
            {/* Reading progress indicator */}
            {isReading && (
              <div className="mt-4 w-full bg-muted rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
        
        {musicFeatured && (
          <div className="mt-4 p-4 rounded-lg bg-card/50">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              Featured Music
            </h4>
            <p className="text-sm text-muted-foreground">
              {musicFeatured}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const MoodAnalysisDisplay = ({ analysis, recommendedMusic }) => {
  const getMoodColor = (mood) => {
    const colors = {
      happy: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
      sad: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
      energetic: 'from-red-500/20 to-pink-500/20 border-red-500/30',
      calm: 'from-green-500/20 to-teal-500/20 border-green-500/30',
      romantic: 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
      nostalgic: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
      anxious: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
      excited: 'from-orange-500/20 to-red-500/20 border-orange-500/30'
    }
    return colors[mood] || colors.happy
  }

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      energetic: '⚡',
      calm: '🧘',
      romantic: '💕',
      nostalgic: '🌅',
      anxious: '😰',
      excited: '🎉'
    }
    return emojis[mood] || '🎵'
  }

  return (
    <div className="space-y-6">
      <Card className="slide-up-enter overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Brain className="h-5 w-5 text-purple-500" />
            </div>
            Mood Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Mood Section */}
            <div className={`p-6 rounded-lg bg-gradient-to-br ${getMoodColor(analysis.primary_mood)} border relative overflow-hidden`}>
              <div className="absolute top-2 right-2 text-4xl opacity-20">
                {getMoodEmoji(analysis.primary_mood)}
              </div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">{getMoodEmoji(analysis.primary_mood)}</span>
                  Primary Mood
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Badge variant="default" className="text-lg px-4 py-2 capitalize">
                      {analysis.primary_mood}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Intensity</span>
                      <span className="text-sm font-bold">{analysis.mood_intensity}/10</span>
                    </div>
                    <div className="w-full bg-background/30 rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${analysis.mood_intensity * 10}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Analysis & Secondary Moods */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Analysis Insights
                </h4>
                <div className="p-4 rounded-lg bg-card/50 border">
                  <p className="text-muted-foreground leading-relaxed">
                    {analysis.explanation}
                  </p>
                </div>
              </div>
              
              {analysis.secondary_moods && analysis.secondary_moods.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Secondary Moods</h4>
                  <div className="flex gap-2 flex-wrap">
                    {analysis.secondary_moods.map((mood, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="px-3 py-1 capitalize flex items-center gap-1"
                      >
                        <span>{getMoodEmoji(mood)}</span>
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.music_suggestions && (
                <div>
                  <h4 className="font-semibold mb-3">Suggested Styles</h4>
                  <div className="flex gap-2 flex-wrap">
                    {analysis.music_suggestions.map((suggestion, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Music Recommendations */}
      {recommendedMusic && recommendedMusic.length > 0 && (
        <Card className="slide-up-enter">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Music className="h-5 w-5 text-green-500" />
              </div>
              Mood-Based Music Recommendations
              <Badge variant="secondary" className="ml-auto">
                {recommendedMusic.length} tracks
              </Badge>
            </CardTitle>
            <CardDescription>
              Music that perfectly matches your current emotional state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedMusic.map((music, index) => (
                <MoodMusicCard key={index} music={music} mood={analysis.primary_mood} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const MoodMusicCard = ({ music, mood }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:scale-105 group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
              {music.name}
            </h4>
            <Badge variant="secondary" className="text-xs mb-2">
              {music.category}
            </Badge>
            {music.mood_match_reason && (
              <p className="text-xs text-muted-foreground italic">
                {music.mood_match_reason}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {music.popularity && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs">{Math.round(music.popularity * 100)}%</span>
              </div>
            )}
            <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Music className="h-3 w-3 text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Hover effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none"></div>
      )}
    </Card>
  )
}

export const PlaylistDisplay = ({ playlist, onTrackSelect, selectedTracks = [] }) => {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = (track) => {
    if (currentTrack?.name === track.name) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
    }
  }

  return (
    <Card className="slide-up-enter">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <Music className="h-6 w-6 text-primary" />
            </div>
            {playlist.name}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              {playlist.total_tracks} tracks
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {playlist.total_duration_minutes} min
            </div>
          </div>
        </div>
        <CardDescription className="flex items-center gap-2">
          {playlist.description}
          <Badge variant="outline" className="ml-auto">
            Generated Playlist
          </Badge>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {playlist.tracks.map((track, index) => (
            <PlaylistTrack
              key={index}
              track={track}
              index={index}
              isSelected={selectedTracks.some(t => t.name === track.name)}
              isCurrentTrack={currentTrack?.name === track.name}
              isPlaying={isPlaying && currentTrack?.name === track.name}
              onSelect={() => onTrackSelect && onTrackSelect(track)}
              onPlayPause={() => handlePlayPause(track)}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const PlaylistTrack = ({ 
  track, 
  index, 
  isSelected, 
  isCurrentTrack, 
  isPlaying, 
  onSelect, 
  onPlayPause, 
  formatDuration 
}) => {
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-card/70 group ${
      isCurrentTrack ? 'bg-primary/5 border border-primary/20' : 'bg-card/30'
    }`}>
      {/* Track Number / Play Button */}
      <div className="flex items-center justify-center w-8 h-8">
        <Button
          size="sm"
          variant="ghost"
          className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
        <span className={`text-sm font-medium group-hover:opacity-0 transition-opacity ${
          isCurrentTrack ? 'text-primary' : 'text-muted-foreground'
        }`}>
          {index + 1}
        </span>
      </div>
      
      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold truncate ${isCurrentTrack ? 'text-primary' : ''}`}>
          {track.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {track.category}
          </Badge>
          {track.genre_tags && track.genre_tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {track.genre_tags[0]}
            </Badge>
          )}
          {track.playlist_score && (
            <Badge variant="outline" className="text-xs">
              {Math.round(track.playlist_score * 100)}% match
            </Badge>
          )}
        </div>
      </div>
      
      {/* Duration */}
      <div className="text-sm text-muted-foreground">
        {formatDuration(track.estimated_duration)}
      </div>
      
      {/* Add to Selection */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onSelect}
        className={`transition-colors ${isSelected ? 'text-primary hover:text-primary/80' : 'hover:text-primary'}`}
      >
        {isSelected ? (
          <Zap className="h-4 w-4" />
        ) : (
          <Music className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

export const RecommendationsDisplay = ({ recommendations, onTrackSelect, selectedTracks = [] }) => {
  return (
    <Card className="slide-up-enter">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Heart className="h-5 w-5 text-blue-500" />
          </div>
          Smart Recommendations
          <Badge variant="secondary" className="ml-auto">
            {recommendations.length} suggestions
          </Badge>
        </CardTitle>
        <CardDescription>
          Discover music that matches your taste profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((music, index) => (
            <RecommendationCard
              key={index}
              music={music}
              isSelected={selectedTracks.some(t => t.name === music.name)}
              onSelect={() => onTrackSelect && onTrackSelect(music)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const RecommendationCard = ({ music, isSelected, onSelect }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:scale-105 group relative overflow-hidden ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
              {music.name}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {music.category}
              </Badge>
              {music.similarity_score && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(music.similarity_score * 100)}% similar
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {music.popularity && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs">{Math.round(music.popularity * 100)}%</span>
              </div>
            )}
            <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Music className="h-3 w-3 text-primary" />
            </div>
          </div>
        </div>
        
        {music.genre_tags && music.genre_tags.length > 0 && (
          <div className="flex gap-1 mb-2">
            {music.genre_tags.slice(0, 2).map((genre, idx) => (
              <Badge key={idx} variant="outline" className="text-xs opacity-70">
                {genre}
              </Badge>
            ))}
          </div>
        )}
        
        {music.recommendation_reason && (
          <p className="text-xs text-muted-foreground italic">
            {music.recommendation_reason}
          </p>
        )}
      </CardContent>
      
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <Zap className="h-3 w-3" />
          </div>
        </div>
      )}
    </Card>
  )
}

export default {
  StoryDisplay,
  MoodAnalysisDisplay,
  PlaylistDisplay,
  RecommendationsDisplay
}

