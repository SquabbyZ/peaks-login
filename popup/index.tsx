import { useEffect, useMemo, useState } from "react"

import iconDark from "~/assets/icon-dark.png"
import icon from "~/assets/icon.png"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Toaster } from "~/components/ui/toaster"
import { TagBadge } from "~/components/ui/tag-badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "~/components/ui/tooltip"
import { useToast } from "~/hooks/use-toast"
import { getAppSettings } from "~/lib/storage"
import { useCombos } from "~/lib/useCombos"
import { useTheme } from "~/lib/useTheme"
import { useTranslation } from "~/lib/useTranslation"

import "~/style.css"

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Globe,
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

function PopupIndex() {
  const { t, language, setLanguage } = useTranslation()
  const { resolvedTheme, toggleTheme } = useTheme()
  const { toast } = useToast()
  const currentIcon = resolvedTheme === "dark" ? iconDark : icon
  const buttonCurrentIcon = resolvedTheme === "dark" ? icon : iconDark

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
  const [searchQuery, setSearchQuery] = useState("")

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
      const tagNames = (c.tagIds ?? [])
        .map((id) => tagMap.get(id)?.name ?? "")
        .join(" ")
        .toLowerCase()
      return c.name.toLowerCase().includes(q) || tagNames.includes(q)
    })
  }, [sortedCombos, searchQuery, tagMap])

  const handleComboLogin = async (combo: LoginCombo) => {
    if (loginStatus === "loading") return

    const casConfig = casMap.get(combo.casId)
    const accountConfig = accMap.get(combo.accountId)
    const callbackConfig = cbMap.get(combo.callbackId)

    if (!casConfig || !accountConfig || !callbackConfig) {
      const msg = t("invalidConfiguration")
      setErrorMessage(msg)
      setLoginStatus("error")
      toast({ title: t("error"), description: msg, variant: "destructive" })
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
        toast({
          title: t("success"),
          description: t("loginSuccessful"),
          variant: "success"
        })
        setTimeout(() => {
          setLoginStatus("idle")
          setActiveId(null)
        }, 2000)
      } else {
        const msg = response?.error || t("error")
        setErrorMessage(msg)
        setLoginStatus("error")
        toast({ title: t("error"), description: msg, variant: "destructive" })
        setTimeout(() => {
          setLoginStatus("idle")
          setActiveId(null)
        }, 2000)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error")
      setErrorMessage(message)
      setLoginStatus("error")
      toast({
        title: t("error"),
        description: message,
        variant: "destructive"
      })
      setTimeout(() => {
        setLoginStatus("idle")
        setActiveId(null)
      }, 2000)
    }
  }

  if (combosLoading || settingsLoading) {
    return (
      <div className="flex h-[420px] w-[340px] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{t("loading")}</span>
        </div>
      </div>
    )
  }

  const hasUnderlyingConfigs =
    settings.casConfigs.length > 0 &&
    settings.accounts.length > 0 &&
    settings.callbackConfigs.length > 0

  // 当没有底层配置 (CAS/账号/回调) 时, 引导去 options
  if (!hasUnderlyingConfigs) {
    return (
      <TooltipProvider>
        <div className="w-[340px] bg-background">
          <div className="p-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <img
                    src={currentIcon}
                    alt="Peaks Login"
                    className="h-5 w-5"
                  />
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openOptions}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

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
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="w-[340px] bg-background">
        <div className="p-5">
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLanguage(language === "en" ? "zh" : "en")}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Globe className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {language === "en" ? "Switch to 中文" : "Switch to English"}
                  </p>
                </TooltipContent>
              </Tooltip>
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

          {combos.length > 0 && (
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索组合名称 / 标签"
                className="h-8 pl-8 pr-8 text-xs"
                data-testid="combo-search"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="清除搜索"
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
                        ? "还没有登录组合"
                        : "没有匹配的组合"}
                    </p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      先在选项页配好 CAS、账号、回调, 再把常用组合打包,
                      这里就能一键登录。
                    </p>
                    <Button size="sm" onClick={() => openOptionsTab("combos")}>
                      去选项页配置
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
                const cas = casMap.get(combo.casId)
                const acc = accMap.get(combo.accountId)
                const cb = cbMap.get(combo.callbackId)
                const isActive = activeId === combo.id
                const isLoading = isActive && loginStatus === "loading"
                const isSuccess = isActive && loginStatus === "success"
                const isError = isActive && loginStatus === "error"
                const disabled = loginStatus === "loading" && !isActive
                return (
                  <Button
                    key={combo.id}
                    data-testid={`combo-button-${combo.id}`}
                    variant="outline"
                    onClick={() => handleComboLogin(combo)}
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
                            aria-label="已置顶"
                          />
                        )}
                        <span className="truncate">{combo.name}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {(combo.tagIds ?? []).length > 0 ? (
                          (combo.tagIds ?? [])
                            .map((id) => tagMap.get(id))
                            .filter((t): t is Tag => Boolean(t))
                            .map((tag) => <TagBadge key={tag.id} tag={tag} />)
                        ) : (
                          <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            未设置
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 flex shrink-0 items-center">
                      {isLoading && (
                        <Loader2
                          className="h-4 w-4 animate-spin text-primary"
                          aria-label="登录中"
                        />
                      )}
                      {isSuccess && (
                        <CheckCircle2
                          className="h-4 w-4 text-green-600 dark:text-green-400"
                          aria-label="成功"
                        />
                      )}
                      {isError && (
                        <AlertCircle
                          className="h-4 w-4 text-destructive"
                          aria-label="失败"
                        />
                      )}
                      {!isLoading && !isSuccess && !isError && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>
                  </Button>
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

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              {combos.length} 个登录组合
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
        <Toaster />
      </div>
    </TooltipProvider>
  )
}

export default PopupIndex
