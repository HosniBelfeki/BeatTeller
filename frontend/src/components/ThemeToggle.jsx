import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { useTheme } from './ThemeProvider.jsx'
import { useState } from 'react'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[1]
  const CurrentIcon = currentTheme.icon

  const handleThemeChange = () => {
    const currentIndex = themes.findIndex(t => t.value === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].value)
  }

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleThemeChange}
        className="h-9 w-9 p-0 hover:bg-white/10 text-white border-white/20 theme-toggle"
        title={`Current: ${currentTheme.label} - Click to change`}
      >
        <CurrentIcon className="h-4 w-4 transition-all" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}

