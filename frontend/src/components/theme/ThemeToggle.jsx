import { useTheme } from './ThemeContext';
import { HiSun, HiMoon } from 'react-icons/hi';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg text-black dark:text-black hover:text-red-500 dark:hover:text-red-500"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <HiSun className="h-5 w-5" />
      ) : (
        <HiMoon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;