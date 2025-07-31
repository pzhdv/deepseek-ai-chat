import { useTheme } from '@/context/ThemeContext'
import { FaMoon } from 'react-icons/fa'
import { FiSun } from 'react-icons/fi'
/**
 * @description:主题切换按钮组件
 */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const darkMode = theme === 'dark'
  return (
    <button
      onClick={() => toggleTheme()}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {darkMode ? (
        <FiSun className="h-6 w-6 text-gray-600 dark:text-yellow-400" />
      ) : (
        <FaMoon className="h-6 w-6 text-gray-600 dark:text-yellow-400" />
      )}
    </button>
  )
}

export default ThemeToggle
