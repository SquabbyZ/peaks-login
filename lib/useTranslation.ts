import { useState, useEffect, useCallback } from "react"
import { translations, type Language, type Translations } from "./i18n/translations"
import { getLanguage, setLanguage as saveLanguage } from "./storage"

const DEFAULT_LANGUAGE: Language = "en"

export function useTranslation() {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await getLanguage()
      setLanguageState(savedLanguage)
    }
    loadLanguage()
  }, [])

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang)
    await saveLanguage(lang)
  }, [])

  const t = useCallback((key: keyof Translations): string => {
    return translations[language][key]
  }, [language])

  return { t, language, setLanguage }
}

export { translations }
export type { Language, Translations }
