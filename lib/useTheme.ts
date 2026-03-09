import { useState, useEffect, useCallback } from "react"

export type Theme = "light" | "dark" | "system"

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null
      return stored || "system"
    }
    return "system"
  })

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (newTheme: "light" | "dark") => {
      root.classList.remove("light", "dark")
      root.classList.add(newTheme)
      setResolvedTheme(newTheme)
    }

    if (theme === "system") {
      applyTheme(getSystemTheme())

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light")
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      applyTheme(theme)
    }
  }, [theme, getSystemTheme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === "light" ? "dark" : "light"
    setTheme(nextTheme)
  }, [resolvedTheme, setTheme])

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }
}
