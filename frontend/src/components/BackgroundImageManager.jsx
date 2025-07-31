import React, { useState, useEffect, useCallback } from 'react'

// Mapping des images de fond disponibles avec leurs contextes
const BACKGROUND_IMAGES = {
  // Images générales de musique
  general: [
    '/images/backgrounds/beat_waves_1.png', // BeatTeller purple-blue waves
    '/images/backgrounds/beat_waves_2.png', // BeatTeller geometric patterns
    '/images/backgrounds/beat_waves_3.png', // BeatTeller warm gradients
    '/images/backgrounds/beat_waves_4.png', // BeatTeller modern visualization
    '/images/backgrounds/L4F4YBMe4MQW.jpg', // Music background coloré
    '/images/backgrounds/cpg4bA2EF94F.jpg', // Colorful music background
    '/images/backgrounds/WJJgAdBrfIET.jpg'  // Dream concert background
  ],
  // Images de concert/scène
  concert: [
    '/images/backgrounds/beat_waves_2.png', // BeatTeller geometric patterns for concerts
    '/images/backgrounds/oxwwUhRR1BHc.jpg', // Concert stage outdoor
    '/images/backgrounds/i57RQOfd6chf.jpg', // Concert stage
    '/images/backgrounds/WzCW99P0gLk8.jpg'  // Empty concert stage
  ],
  // Images de vinyles/rétro
  vinyl: [
    '/images/backgrounds/beat_waves_3.png', // BeatTeller warm gradients for vintage
    '/images/backgrounds/T4kZxbtfqPfV.jpg', // Vinyl records
    '/images/backgrounds/PTOI6WAfDWMA.jpg'  // Multiple vinyl records
  ]
}

// Mots-clés pour déterminer le type d'image approprié
const KEYWORD_MAPPING = {
  concert: ['concert', 'live', 'stage', 'performance', 'show', 'festival'],
  vinyl: ['vinyl', 'record', 'retro', 'classic', 'vintage', 'old school'],
  general: ['music', 'song', 'track', 'artist', 'band', 'album', 'sound']
}

export const BackgroundImageManager = ({ searchQuery, mood, genre, children, className = '' }) => {
  const [currentBackground, setCurrentBackground] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Fonction pour déterminer le type d'image basé sur la requête
  const determineImageType = useCallback((query, mood, genre) => {
    if (!query) return 'general'
    
    const searchText = `${query} ${mood || ''} ${genre || ''}`.toLowerCase()
    
    // Vérifier les mots-clés pour concert
    if (KEYWORD_MAPPING.concert.some(keyword => searchText.includes(keyword))) {
      return 'concert'
    }
    
    // Vérifier les mots-clés pour vinyl
    if (KEYWORD_MAPPING.vinyl.some(keyword => searchText.includes(keyword))) {
      return 'vinyl'
    }
    
    return 'general'
  }, [])

  // Fonction pour sélectionner une image aléatoire du type approprié
  const selectRandomImage = useCallback((imageType) => {
    const images = BACKGROUND_IMAGES[imageType] || BACKGROUND_IMAGES.general
    const randomIndex = Math.floor(Math.random() * images.length)
    return images[randomIndex]
  }, [])

  // Effet pour changer l'image de fond quand la recherche change
  useEffect(() => {
    if (searchQuery) {
      setIsLoading(true)
      setImageLoaded(false)
      
      const imageType = determineImageType(searchQuery, mood, genre)
      const selectedImage = selectRandomImage(imageType)
      
      // Précharger l'image
      const img = new Image()
      img.onload = () => {
        setCurrentBackground(selectedImage)
        setImageLoaded(true)
        setIsLoading(false)
      }
      img.onerror = () => {
        // Fallback vers une image générale en cas d'erreur
        const fallbackImage = BACKGROUND_IMAGES.general[0]
        setCurrentBackground(fallbackImage)
        setImageLoaded(true)
        setIsLoading(false)
      }
      img.src = selectedImage
    } else {
      // Pas de recherche, utiliser une image par défaut
      setCurrentBackground(BACKGROUND_IMAGES.general[0])
      setImageLoaded(true)
    }
  }, [searchQuery, mood, genre, determineImageType, selectRandomImage])

  // Styles pour l'arrière-plan
  const backgroundStyle = {
    backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative'
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={backgroundStyle}>
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-sm"></div>
      
      {/* Overlay décoratif avec motif musical */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-8 h-8 border-2 border-primary rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-6 h-6 border-2 border-accent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-4 h-4 border-2 border-primary rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 right-10 w-10 h-10 border-2 border-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export const MusicCardBackground = ({ music, children, className = '' }) => {
  const [backgroundImage, setBackgroundImage] = useState('')

  useEffect(() => {
    if (music?.name) {
      // Déterminer le type d'image basé sur le nom de la musique
      const musicName = music.name.toLowerCase()
      let imageType = 'general'
      
      if (KEYWORD_MAPPING.concert.some(keyword => musicName.includes(keyword))) {
        imageType = 'concert'
      } else if (KEYWORD_MAPPING.vinyl.some(keyword => musicName.includes(keyword))) {
        imageType = 'vinyl'
      }
      
      const images = BACKGROUND_IMAGES[imageType] || BACKGROUND_IMAGES.general
      const randomIndex = Math.floor(Math.random() * images.length)
      setBackgroundImage(images[randomIndex])
    }
  }, [music?.name])

  const backgroundStyle = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={backgroundStyle}>
      {/* Overlay pour la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm"></div>
      
      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Hook personnalisé pour gérer les images de fond
export const useBackgroundImage = (searchQuery, mood, genre) => {
  const [backgroundImage, setBackgroundImage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const determineImageType = useCallback((query, mood, genre) => {
    if (!query) return 'general'
    
    const searchText = `${query} ${mood || ''} ${genre || ''}`.toLowerCase()
    
    if (KEYWORD_MAPPING.concert.some(keyword => searchText.includes(keyword))) {
      return 'concert'
    }
    
    if (KEYWORD_MAPPING.vinyl.some(keyword => searchText.includes(keyword))) {
      return 'vinyl'
    }
    
    return 'general'
  }, [])

  const selectRandomImage = useCallback((imageType) => {
    const images = BACKGROUND_IMAGES[imageType] || BACKGROUND_IMAGES.general
    const randomIndex = Math.floor(Math.random() * images.length)
    return images[randomIndex]
  }, [])

  useEffect(() => {
    if (searchQuery) {
      setIsLoading(true)
      const imageType = determineImageType(searchQuery, mood, genre)
      const selectedImage = selectRandomImage(imageType)
      
      const img = new Image()
      img.onload = () => {
        setBackgroundImage(selectedImage)
        setIsLoading(false)
      }
      img.onerror = () => {
        setBackgroundImage(BACKGROUND_IMAGES.general[0])
        setIsLoading(false)
      }
      img.src = selectedImage
    } else {
      setBackgroundImage('')
      setIsLoading(false)
    }
  }, [searchQuery, mood, genre, determineImageType, selectRandomImage])

  return { backgroundImage, isLoading }
}

// Composant pour afficher des images de fond animées
export const AnimatedMusicBackground = ({ isActive = false, className = '' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const allImages = [...BACKGROUND_IMAGES.general, ...BACKGROUND_IMAGES.concert, ...BACKGROUND_IMAGES.vinyl]

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % allImages.length)
    }, 5000) // Changer d'image toutes les 5 secondes

    return () => clearInterval(interval)
  }, [isActive, allImages.length])

  const backgroundStyle = {
    backgroundImage: `url(${allImages[currentImageIndex]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'background-image 1s ease-in-out'
  }

  return (
    <div className={`absolute inset-0 ${className}`} style={backgroundStyle}>
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-background/90"></div>
    </div>
  )
}

export default BackgroundImageManager

