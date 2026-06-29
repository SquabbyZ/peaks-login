import { memo, useEffect, useMemo, useState } from "react"

import iconDark from "~/assets/icon-dark.png"
import icon from "~/assets/icon.png"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "~/components/ui/select"
import { TagBadge } from "~/components/ui/tag-badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "~/components/ui/tooltip"
import { getAppSettings } from "~/lib/storage"
import { useCombos } from "~/lib/useCombos"
import { useTheme } from "~/lib/useTheme"
import { useTranslation } from "~/lib/useTranslation"

import "~/style.css"

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  LogIn,
  Moon,
  Pin,
  Search,
  Settings,
  Sun,
  X
} from "lucide-react"

import type { AppSettings, LoginCombo, Tag } from "~/types"

type LoginStatus = "idle" | "loading" | "success" | "error"

interface ComboCardProps {
  combo: LoginCombo
  tag: Tag | null | undefined
  isActive: boolean
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  disabled: boolean
  onClick: () => void
}

const ComboCard = memo(function ComboCard({
  combo,
  tag,
  isActive,
  isLoading,
  isSuccess,
  isError,
  disabled,
  onClick
}: ComboCardProps) {
  const { t } = useTranslation()
  return (
    <Button
      data-testid={`combo-button-${combo.id}`}
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={`group h-auto w-full justify-between whitespace-normal rounded-lg border-border px-3 py-2.5 text-left transition-all ${
        isActive
          ? "border-primary/60 bg-primary/5"
          : "hover:border-primary/50 hover:bg-accent/40"
      }`}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {combo.pinned && (
            <Pin
              className="h-3.5 w-3.5 shrink-0 text-primary"
              aria-label={t("pinnedAria")}
            />
          )}
          <span className="truncate">{combo.name}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {tag ? (
            <TagBadge tag={tag} />
          ) : (
            <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {t("unconfigured")}
            </span>
          )}
        </div>
      </div>
      <div className="ml-2 flex shrink-0 items-center">
        {isLoading && (
          <Loader2
            className="h-4 w-4 animate-spin text-primary"
            aria-label={t("loggingInAria")}
          />
        )}
        {isSuccess && (
          <CheckCircle2
            className="h-4 w-4 text-green-600 dark:text-green-400"
            aria-label={t("success")}
          />
        )}
        {isError && (
          <AlertCircle
            className="h-4 w-4 text-destructive"
            aria-label={t("failure")}
          />
        )}
        {!isLoading && !isSuccess && !isError && (
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        )}
      </div>
    </Button>
  )
})

function ComboSkeleton() {
  return (
    <div
      data-testid="combo-skeleton"
      className="w-full rounded-lg border border-border p-3"
      aria-hidden="true">
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted/60" />
      </div>
    </div>
  )
}

function PopupIndex() {
  const { t, language, setLanguage } = useTranslation()
  const { resolvedTheme, toggleTheme } = useTheme()
  const currentIcon = resolvedTheme === "dark" ? iconDark : icon

  const { combos, loading: combosLoading, touch } = useCombos()

  const [settings, setSettings] = useState<AppSettings>({
    casConfigs: [],
    callbackConfigs: [],
    accounts: []
  })
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("idle")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // search debounce: input 立即更新, query 200ms 后才触发过滤
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 200)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const loaded = await getAppSettings()
        if (!cancelled) {
          setSettings(loaded)
          setSettingsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Unknown error"
          setErrorMessage(message)
          setSettingsLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  const openOptionsTab = (tab: "combos" | "cas" | "callback" | "account") => {
    // 通过 URL hash 传参, options 页读取后激活对应 tab
    const url = chrome.runtime.getURL(`options.html#${tab}`)
    chrome.tabs.create({ url })
  }

  const casMap = useMemo(
    () => new Map(settings.casConfigs.map((c) => [c.id, c])),
    [settings.casConfigs]
  )
  const accMap = useMemo(
    () => new Map(settings.accounts.map((a) => [a.id, a])),
    [settings.accounts]
  )
  const cbMap = useMemo(
    () => new Map(settings.callbackConfigs.map((c) => [c.id, c])),
    [settings.callbackConfigs]
  )
  const tagMap = useMemo(
    () => new Map((settings.tags ?? []).map((t: Tag) => [t.id, t])),
    [settings.tags]
  )

  // 排序: 置顶在前, 然后按最近使用倒序, 没有 lastUsedAt 的排最后
  const sortedCombos = useMemo(() => {
    return [...combos].sort((a, b) => {
      const ap = a.pinned ?? false
      const bp = b.pinned ?? false
      if (ap !== bp) return ap ? -1 : 1
      const al = a.lastUsedAt ?? 0
      const bl = b.lastUsedAt ?? 0
      if (al === bl) return b.updatedAt - a.updatedAt
      return bl - al
    })
  }, [combos])

  const filteredCombos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return sortedCombos
    return sortedCombos.filter((c) => {
      const effectiveTagId = c.tagId ?? c.tagIds?.[0]
      const tagName = effectiveTagId
        ? (tagMap.get(effectiveTagId)?.name ?? "").toLowerCase()
        : ""
      return c.name.toLowerCase().includes(q) || tagName.includes(q)
    })
  }, [sortedCombos, searchQuery, tagMap])

  const handleComboLogin = async (combo: LoginCombo) => {
    if (loginStatus === "loading") return

    // settings 还没加载完时, 先 await 再读 map, 保证一致性
    const liveSettings = settingsLoading ? await getAppSettings() : settings
    const liveCasMap = new Map(liveSettings.casConfigs.map((c) => [c.id, c]))
    const liveAccMap = new Map(liveSettings.accounts.map((a) => [a.id, a]))
    const liveCbMap = new Map(
      liveSettings.callbackConfigs.map((c) => [c.id, c])
    )

    const casConfig = liveCasMap.get(combo.casId)
    const accountConfig = liveAccMap.get(combo.accountId)
    const callbackConfig = liveCbMap.get(combo.callbackId)

    if (!casConfig || !accountConfig || !callbackConfig) {
      const msg = t("invalidConfiguration")
      setErrorMessage(msg)
      setLoginStatus("error")
      return
    }

    setActiveId(combo.id)
    setLoginStatus("loading")
    setErrorMessage("")

    try {
      // 构建当前回调地址相关的 token 映射关系
      const currentTokenMappings: Record<string, string> = {}
      if (callbackConfig.tokenKeys && callbackConfig.tokenKeys.length > 0) {
        for (const tokenKey of callbackConfig.tokenKeys) {
          const mappingKey = `${callbackConfig.id}:${tokenKey}`
          const casId = combo.tokenKeyMappings?.[mappingKey] || casConfig.id
          currentTokenMappings[tokenKey] = casId
        }
      }

      const response = await chrome.runtime.sendMessage({
        type: "LOGIN_REQUEST",
        data: {
          casId: casConfig.id,
          username: accountConfig.username,
          accountId: accountConfig.id,
          callbackId: callbackConfig.id,
          callbackUrl: callbackConfig.url,
          tokenKeyMappings: currentTokenMappings
        }
      })

      if (response?.success) {
        setLoginStatus("success")
        // 标记最近使用
        void touch(combo.id)
        setTimeout(() => {
          setLoginStatus("idle")
          setActiveId(null)
        }, 2000)
      } else {
        const msg = response?.error || t("error")
        setErrorMessage(msg)
        setLoginStatus("error")
        setTimeout(() => {
          setLoginStatus("idle")
          setActiveId(null)
        }, 2000)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error")
      setErrorMessage(message)
      setLoginStatus("error")
      setTimeout(() => {
        setLoginStatus("idle")
        setActiveId(null)
      }, 2000)
    }
  }

  const hasUnderlyingConfigs =
    settings.casConfigs.length > 0 &&
    settings.accounts.length > 0 &&
    settings.callbackConfigs.length > 0

  return (
    <TooltipProvider>
      <div className="w-[340px] bg-background">
        <div className="p-5">
          {/* header: 永远立即渲染 (无 IO 依赖) */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <img src={currentIcon} alt="Peaks Login" className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {t("appName")}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t("appDescription")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    {resolvedTheme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {resolvedTheme === "dark"
                      ? t("lightTheme")
                      : t("darkTheme")}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Select
                value={language}
                onValueChange={(value: "en" | "zh") => setLanguage(value)}>
                <SelectTrigger
                  className="h-8 w-8 border-0 bg-transparent p-0 shadow-none focus:ring-0"
                  aria-label={t("language")}>
                  <span className="text-lg leading-none">
                    {language === "en" ? "🇺🇸" : "🇨🇳"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="zh">🇨🇳 中文</SelectItem>
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openOptions}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("openSettings")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* 内容区: 根据数据状态分 3 支渲染 */}
          {!hasUnderlyingConfigs ? (
            <Card className="border-border bg-muted/50 shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-muted p-1.5">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-sm font-medium text-foreground">
                      {t("configurationRequired")}
                    </p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {t("configurationRequiredDescription")}
                    </p>
                    <Button size="sm" onClick={openOptions}>
                      {t("openSettings")}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : combosLoading ? (
            <div
              data-testid="combos-skeleton"
              className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
              <ComboSkeleton />
              <ComboSkeleton />
              <ComboSkeleton />
            </div>
          ) : (
            <>
              {/* 搜索框: 加载完成后才有意义 (避免对空列表显示) */}
              {combos.length > 0 && (
                <div className="relative mb-2">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t("popupSearchPlaceholder")}
                    className="h-8 pl-8 pr-8 text-xs"
                    data-testid="combo-search"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      aria-label={t("clearSearch")}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              {filteredCombos.length === 0 ? (
                <Card className="border-border bg-muted/50 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-md bg-muted p-1.5">
                        <LogIn className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 text-sm font-medium text-foreground">
                          {combos.length === 0
                            ? t("combosEmpty")
                            : t("combosNoMatch")}
                        </p>
                        <p className="mb-3 text-xs text-muted-foreground">
                          {t("popupEmptyDescription")}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => openOptionsTab("combos")}>
                          {t("openSettings")}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div
                  data-testid="combos-list"
                  className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                  {filteredCombos.map((combo) => {
                    const effectiveTagId = combo.tagId ?? combo.tagIds?.[0]
                    const tag = effectiveTagId
                      ? tagMap.get(effectiveTagId)
                      : null
                    const isActive = activeId === combo.id
                    const isLoading = isActive && loginStatus === "loading"
                    const isSuccess = isActive && loginStatus === "success"
                    const isError = isActive && loginStatus === "error"
                    const disabled = loginStatus === "loading" && !isActive
                    return (
                      <ComboCard
                        key={combo.id}
                        combo={combo}
                        tag={tag}
                        isActive={isActive}
                        isLoading={isLoading}
                        isSuccess={isSuccess}
                        isError={isError}
                        disabled={disabled}
                        onClick={() => handleComboLogin(combo)}
                      />
                    )
                  })}
                </div>
              )}

              {errorMessage && loginStatus === "error" && (
                <Card className="mt-3 border-destructive/50 bg-destructive/10 shadow-none">
                  <CardContent className="flex items-center gap-2 p-3">
                    <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{errorMessage}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* footer */}
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              {t("popupComboCount")(combos.length)}
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={openOptions}
              className="h-auto p-0 text-xs text-primary">
              {t("settings")}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default PopupIndex
