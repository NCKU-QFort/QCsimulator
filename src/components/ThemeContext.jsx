import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const lightTheme = {
  bg: "#F4F6FB",
  surface: "#FFFFFF",
  sidebar: "#EEF1F8",
  border: "#D8DEE9",
  borderLight: "#3A4045",
  text: "#1E293B",
  textMid: "#475569",
  textLight: "#94A3B8",
  wire: "#B0BEC5",
  accent: "#3B82F6",
  accentBg: "#EFF6FF",
  run: "#0EA5E9",
  hover: "#F1F5F9",
  cvalue: "#000000",
  instructionBg: "#DBEAFE",
  instructionBorder: "#3B82F6",
  instructionText: "#1E40AF",
};

const darkTheme = {
  bg: "#21272A",
  surface: "#2A3035",
  sidebar: "#252B2E",
  border: "#3A4045",
  borderLight: "#D8DEE9",
  text: "#E8EAED",
  textMid: "#C8CCD0",
  textLight: "#8A8E92",
  wire: "#5A5E62",
  accent: "#539BF5",
  accentBg: "#2A3A4A",
  run: "#4A9EF5",
  hover: "#333940",
  cvalue: "#FFFFFF",
  instructionBg: "#1E3A5F",
  instructionBorder: "#3B82F6",
  instructionText: "#BFDBFE",
};

export function ThemeProvider({ children }) {
  // Initialize from localStorage or default to light
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    // Update document background
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
  }, [isDark, theme.bg, theme.text]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
