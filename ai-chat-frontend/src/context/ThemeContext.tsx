import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import type { PropsWithChildren } from 'react'

// 类型定义
type Theme = 'light' | 'dark'
type ThemeContextType = {
  theme: Theme
  isSystemTheme: boolean
  toggleTheme: (theme?: Theme) => void
}

// 创建 Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 主题提供者组件
export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>('light')
  const [isSystemTheme, setIsSystemTheme] = useState(true)

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches

    if (savedTheme) {
      setTheme(savedTheme)
      setIsSystemTheme(false)
    } else {
      setTheme(systemPrefersDark ? 'dark' : 'light')
    }
  }, [])

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (isSystemTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleSystemChange)
    return () => mediaQuery.removeEventListener('change', handleSystemChange)
  }, [isSystemTheme])

  // 应用主题到 DOM
  useEffect(() => {
    document.documentElement.className = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  // 切换主题方法
  const toggleTheme = useCallback((newTheme?: Theme) => {
    if (newTheme) {
      setTheme(newTheme)
      setIsSystemTheme(false)
    } else {
      setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
      setIsSystemTheme(false)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, isSystemTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 自定义 Hook
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
