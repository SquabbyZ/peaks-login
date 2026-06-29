import { useCallback, useEffect, useState } from "react"

import type {
  AccountConfig,
  AppSettings,
  CallbackConfig,
  CasConfig
} from "~/types"

import "~/style.css"

import {
  Download,
  Globe,
  Link2,
  Moon,
  Plus,
  Server,
  Settings,
  Shield,
  Sun,
  Upload,
  User
} from "lucide-react"

import iconDark from "~/assets/icon-dark.png"
import icon from "~/assets/icon.png"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "~/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "~/components/ui/tooltip"
import { Toaster } from "~/components/ui/toaster"
import { useToast } from "~/hooks/use-toast"
import { encrypt, exportKey, generateMasterKey, importKey } from "~/lib/crypto"
import {
  createTimestamp,
  generateId,
  getAppSettings,
  getMasterKey,
  setAppSettings,
  setMasterKey
} from "~/lib/storage"
import { useCombos } from "~/lib/useCombos"
import { useTheme } from "~/lib/useTheme"
import { useTranslation } from "~/lib/useTranslation"
import type { AccountFormData } from "~/options/dialogs/AccountDialogs"
import type { CallbackFormData } from "~/options/dialogs/CallbackDialogs"
import type { CasFormData } from "~/options/dialogs/CasDialogs"
import { AccountSection } from "~/options/sections/AccountSection"
import { CallbackSection } from "~/options/sections/CallbackSection"
import { CasSection } from "~/options/sections/CasSection"
import { CombosSection } from "~/options/sections/CombosSection"

function OptionsIndex() {
  const { t, language, setLanguage } = useTranslation()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { toast } = useToast()
  const currentIcon = resolvedTheme === "dark" ? iconDark : icon
  const [settings, setSettings] = useState<AppSettings>({
    casConfigs: [],
    callbackConfigs: [],
    accounts: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<
    "combos" | "cas" | "callback" | "account"
  >(() => {
    // 从 URL hash 读取初始 tab (e.g. popup 跳转 #combos)
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "")
      if (
        hash === "combos" ||
        hash === "cas" ||
        hash === "callback" ||
        hash === "account"
      ) {
        return hash
      }
    }
    return "combos"
  })
  const [masterKeyString, setMasterKeyString] = useState<string>("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { combos } = useCombos()

  const loadSettings = useCallback(async () => {
    const loaded = await getAppSettings()
    setSettings(loaded)
    const key = await getMasterKey()
    if (key) setMasterKeyString(key)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const initMasterKey = async () => {
    const key = await generateMasterKey()
    const keyString = await exportKey(key)
    await setMasterKey(keyString)
    setMasterKeyString(keyString)
    toast({
      title: t("success"),
      description: t("keyInitializedSuccess"),
      variant: "success"
    })
  }
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({
      title: t("success"),
      description: t("configCopiedSuccess"),
      variant: "success"
    })
  }
  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 一键导出所有数据 (CAS / 回调 / 账号 / 组合)
  const exportAll = () => {
    downloadJson(
      {
        casConfigs: settings.casConfigs,
        callbackConfigs: settings.callbackConfigs,
        accounts: settings.accounts,
        combos: combos,
        exportedAt: new Date().toISOString(),
        version: 1
      },
      `peaks-login-all-${new Date().toISOString().split("T")[0]}.json`
    )
    toast({
      title: t("success"),
      description: "已导出全部配置"
    })
  }

  // 一键导入所有数据, 覆盖当前
  const importAll = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (typeof data !== "object" || data === null) {
        throw new Error("Invalid configuration file")
      }
      const updated: AppSettings = {
        casConfigs: Array.isArray(data.casConfigs) ? data.casConfigs : [],
        callbackConfigs: Array.isArray(data.callbackConfigs)
          ? data.callbackConfigs
          : [],
        accounts: Array.isArray(data.accounts) ? data.accounts : [],
        combos: Array.isArray(data.combos) ? data.combos : []
      }
      await setAppSettings(updated)
      setSettings(updated)
      toast({
        title: t("success"),
        description: "已导入全部配置"
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error")
      toast({
        title: t("error"),
        description: message,
        variant: "destructive"
      })
    }
  }
  const handleAddCas = async (data: CasFormData) => {
    const config: CasConfig = {
      id: generateId(),
      name: data.name,
      url: data.url,
      usernameField: data.usernameField || "email",
      passwordField: data.passwordField || "password",
      tokenResponseKey: data.tokenResponseKey || "token",
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
    const updated = {
      ...settings,
      casConfigs: [...settings.casConfigs, config]
    }
    await setAppSettings(updated)
    setSettings(updated)
    toast({
      title: t("success"),
      description: t("casAddedSuccess"),
      variant: "success"
    })
  }
  const handleEditCas = async (id: string, data: CasFormData) => {
    const updated = {
      ...settings,
      casConfigs: settings.casConfigs.map((c) =>
        c.id === id
          ? {
              ...c,
              name: data.name,
              url: data.url,
              usernameField: data.usernameField || "email",
              passwordField: data.passwordField || "password",
              tokenResponseKey: data.tokenResponseKey || "token",
              updatedAt: createTimestamp()
            }
          : c
      )
    }
    await setAppSettings(updated)
    setSettings(updated)
    toast({
      title: t("success"),
      description: t("casUpdatedSuccess"),
      variant: "success"
    })
  }
  const handleDeleteCas = async (id: string) => {
    const updated = {
      ...settings,
      casConfigs: settings.casConfigs.filter((c) => c.id !== id)
    }
    await setAppSettings(updated)
    setSettings(updated)
    toast({
      title: t("success"),
      description: t("casDeletedSuccess"),
      variant: "success"
    })
  }
  const handleCopyCas = async (cas: CasConfig) => {
    const newConfig: CasConfig = {
      id: generateId(),
      name: `${cas.name} (${t("copy")})`,
      url: cas.url,
      usernameField: cas.usernameField || "email",
      passwordField: cas.passwordField || "password",
      tokenResponseKey: cas.tokenResponseKey || "token",
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
    const updated = {
      ...settings,
      casConfigs: [...settings.casConfigs, newConfig]
    }
    await setAppSettings(updated)
    setSettings(updated)
    await copyToClipboard(cas.url, newConfig.id)
  }
  const exportCas = () =>
    downloadJson(
      { casConfigs: settings.casConfigs, exportedAt: new Date().toISOString() },
      `peaks-login-cas-config-${new Date().toISOString().split("T")[0]}.json`
    )
  const importCas = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const config = JSON.parse(text)
      if (!config.casConfigs || !Array.isArray(config.casConfigs))
        throw new Error("Invalid CAS configuration file")
      const imported = config.casConfigs.map((cas: CasConfig) => ({
        ...cas,
        id: cas.id || generateId(),
        createdAt: cas.createdAt || createTimestamp(),
        updatedAt: createTimestamp()
      }))
      const merged = [...settings.casConfigs]
      imported.forEach((cas: CasConfig) => {
        const idx = merged.findIndex((c) => c.id === cas.id)
        if (idx >= 0) merged[idx] = cas
        else merged.push(cas)
      })
      const updated = { ...settings, casConfigs: merged }
      await setAppSettings(updated)
      setSettings(updated)
      toast({
        title: t("success"),
        description: t("importSuccess"),
        variant: "success"
      })
    } catch (error) {
      console.error("Import CAS error:", error)
      toast({
        title: t("error"),
        description: t("importError"),
        variant: "destructive"
      })
    }
    event.target.value = ""
  }
  const handleAddCallback = async (data: CallbackFormData) => {
    const config: CallbackConfig = {
      id: generateId(),
      name: data.name,
      url: data.url,
      tokenKeys: data.tokenKeys.filter((k) => k.trim() !== ""),
      enableCors: data.enableCors,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
    const updated = {
      ...settings,
      callbackConfigs: [...settings.callbackConfigs, config]
    }
    await setAppSettings(updated)
    setSettings(updated)
    toast({
      title: t("success"),
      description: t("callbackAddedSuccess"),
      variant: "success"
    })
  }
  const handleEditCallback = async (id: string, data: CallbackFormData) => {
    const updated = {
      ...settings,
      callbackConfigs: settings.callbackConfigs.map((c) =>
        c.id === id
          ? {
              ...c,
              name: data.name,
              url: data.url,
              tokenKeys: data.tokenKeys.filter((k) => k.trim() !== ""),
              enableCors: data.enableCors,
              updatedAt: createTimestamp()
            }
          : c
      )
    }
    await setAppSettings(updated)
    setSettings(updated)
    toast({
      title: t("success"),
      description: t("callbackUpdatedSuccess"),
      variant: "success"
    })
  }
  const handleDeleteCallback = async (id: string) => {
    const updated = {
      ...settings,
      callbackConfigs: settings.callbackConfigs.filter((c) => c.id !== id)
    }
    await setAppSettings(updated)
    setSettings(updated)
    toast({
      title: t("success"),
      description: t("callbackDeletedSuccess"),
      variant: "success"
    })
  }
  const handleCopyCallback = async (cb: CallbackConfig) => {
    const newConfig: CallbackConfig = {
      id: generateId(),
      name: `${cb.name} (${t("copy")})`,
      url: cb.url,
      tokenKeys: cb.tokenKeys || ["accessToken"],
      enableCors: cb.enableCors || false,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
    const updated = {
      ...settings,
      callbackConfigs: [...settings.callbackConfigs, newConfig]
    }
    await setAppSettings(updated)
    setSettings(updated)
    await copyToClipboard(cb.url, newConfig.id)
  }
  const exportCallback = () =>
    downloadJson(
      {
        callbackConfigs: settings.callbackConfigs,
        exportedAt: new Date().toISOString()
      },
      `peaks-login-callback-config-${new Date().toISOString().split("T")[0]}.json`
    )
  const importCallback = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const config = JSON.parse(text)
      if (!config.callbackConfigs || !Array.isArray(config.callbackConfigs))
        throw new Error("Invalid callback configuration file")
      const imported = config.callbackConfigs.map((cb: CallbackConfig) => ({
        ...cb,
        id: cb.id || generateId(),
        createdAt: cb.createdAt || createTimestamp(),
        updatedAt: createTimestamp()
      }))
      const merged = [...settings.callbackConfigs]
      imported.forEach((cb: CallbackConfig) => {
        const idx = merged.findIndex((c) => c.id === cb.id)
        if (idx >= 0) merged[idx] = cb
        else merged.push(cb)
      })
      const updated = { ...settings, callbackConfigs: merged }
      await setAppSettings(updated)
      setSettings(updated)
      toast({
        title: t("success"),
        description: t("importSuccess"),
        variant: "success"
      })
    } catch (error) {
      console.error("Import callback error:", error)
      toast({
        title: t("error"),
        description: t("importError"),
        variant: "destructive"
      })
    }
    event.target.value = ""
  }
  const ensureMasterKey = async (): Promise<string> => {
    if (masterKeyString) return masterKeyString
    const key = await generateMasterKey()
    const ks = await exportKey(key)
    await setMasterKey(ks)
    setMasterKeyString(ks)
    return ks
  }
  const handleAddAccount = async (data: AccountFormData) => {
    const keyToUse = await ensureMasterKey()
    const key = await importKey(keyToUse)
    const encrypted = await encrypt(data.password ?? "", key)
    const config: AccountConfig = {
      id: generateId(),
      name: data.name,
      username: data.username,
      encryptedPassword: JSON.stringify(encrypted),
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
    const updated = { ...settings, accounts: [...settings.accounts, config] }
    await setAppSettings(updated)
    setSettings(updated)
    toast({
      title: t("success"),
      description: t("accountAddedSuccess"),
      variant: "success"
    })
  }
  const handleEditAccount = async (id: string, data: AccountFormData) => {
    const updated = {
      ...settings,
      accounts: settings.accounts.map((a) =>
        a.id === id
          ? {
              ...a,
              name: data.name,
              username: data.username,
              updatedAt: createTimestamp()
            }
          : a
      )
    }
    await setAppSettings(updated)
    setSettings(updated)
  }
  const handleDeleteAccount = async (id: string) => {
    const updated = {
      ...settings,
      accounts: settings.accounts.filter((a) => a.id !== id)
    }
    await setAppSettings(updated)
    setSettings(updated)
    toast({
      title: t("success"),
      description: t("accountDeletedSuccess"),
      variant: "success"
    })
  }
  const handleCopyAccount = async (acc: AccountConfig) => {
    const newConfig: AccountConfig = {
      id: generateId(),
      name: `${acc.name} (${t("copy")})`,
      username: acc.username,
      encryptedPassword: acc.encryptedPassword,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
    const updated = { ...settings, accounts: [...settings.accounts, newConfig] }
    await setAppSettings(updated)
    setSettings(updated)
    await copyToClipboard(acc.username, newConfig.id)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <img src={currentIcon} alt="Peaks Token" className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("settingsTitle")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("settingsDescription")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLanguage(language === "en" ? "zh" : "en")}
                  aria-label="切换语言"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Globe className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>语言: {language === "en" ? "English" : "中文"}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
                    setTheme(next)
                  }}
                  aria-label="切换主题"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  {resolvedTheme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  主题:{" "}
                  {theme === "light"
                    ? t("lightTheme")
                    : theme === "dark"
                      ? t("darkTheme")
                      : t("systemTheme")}
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={exportAll}
                  aria-label="导出全部配置"
                  data-testid="export-all-button"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>导出全部 (CAS / 回调 / 账号 / 组合)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    document.getElementById("import-all-file")?.click()
                  }
                  aria-label="导入全部配置"
                  data-testid="import-all-button"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>导入全部 (覆盖当前)</p>
              </TooltipContent>
            </Tooltip>
            <input
              type="file"
              accept=".json"
              id="import-all-file"
              onChange={importAll}
              className="hidden"
            />
            </TooltipProvider>
          </div>
        </div>

        <div className="mx-auto">
          <main className="max-w-4xl space-y-8">
            {!masterKeyString && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Shield className="h-4 w-4" />
                    {t("initEncryptionKey")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("initEncryptionKeyDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={initMasterKey}>{t("initializeKey")}</Button>
                </CardContent>
              </Card>
            )}

            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as "combos" | "cas" | "callback" | "account")
              }
              className="w-full">
              <TabsList>
                <TabsTrigger value="combos">
                  <Plus className="mr-2 h-4 w-4" />
                  登录组合
                  {combos.length > 0 && (
                    <span
                      data-testid="combos-tab-badge"
                      className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                      {combos.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="cas">
                  <Server className="mr-2 h-4 w-4" />
                  CAS 登录地址
                </TabsTrigger>
                <TabsTrigger value="callback">
                  <Link2 className="mr-2 h-4 w-4" />
                  回调地址
                </TabsTrigger>
                <TabsTrigger value="account">
                  <User className="mr-2 h-4 w-4" />
                  账号
                </TabsTrigger>
              </TabsList>
              <TabsContent value="combos">
                <CombosSection settings={settings} />
              </TabsContent>
              <TabsContent value="cas">
                <CasSection
                  configs={settings.casConfigs}
                  t={t}
                  onAdd={handleAddCas}
                  onEdit={handleEditCas}
                  onDelete={handleDeleteCas}
                  onCopy={handleCopyCas}
                  onExport={exportCas}
                  onImport={importCas}
                  copiedId={copiedId}
                />
              </TabsContent>
              <TabsContent value="callback">
                <CallbackSection
                  configs={settings.callbackConfigs}
                  t={t}
                  onAdd={handleAddCallback}
                  onEdit={handleEditCallback}
                  onDelete={handleDeleteCallback}
                  onCopy={handleCopyCallback}
                  onExport={exportCallback}
                  onImport={importCallback}
                  copiedId={copiedId}
                />
              </TabsContent>
              <TabsContent value="account">
                <AccountSection
                  accounts={settings.accounts}
                  t={t}
                  onAdd={handleAddAccount}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                  onCopy={handleCopyAccount}
                  copiedId={copiedId}
                  masterKey={masterKeyString}
                />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default OptionsIndex
