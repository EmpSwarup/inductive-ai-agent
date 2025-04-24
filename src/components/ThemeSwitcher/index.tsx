import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      className="gap-1 border-slate-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-white cursor-pointer"
    >
      {/* conditional rendering for dark and light mode */}
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDarkMode ? "Light" : "Dark"}</span>
    </Button>
  );
}
