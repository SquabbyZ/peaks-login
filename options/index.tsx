import { useCallback, useEffect, useState } from "react"

import type {
  AccountConfig,
  AppSettings,
  CallbackConfig,
  CasConfig
} from "~/types"

import "~/style.css"

import { Globe, Moon, Plus, Settings, Shield, Sun } from "lucide-react"

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
  const [activeTab, setActiveTab] = useState<"config" | "combos">(() => {
    // 从 URL hash 读取初始 tab (e.g. popup 跳转 #combos)
    if (typeof window !== "undefined" && window.location.hash === "#combos") {
      return "combos"
    }
    return "config"
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
          <div className="flex items-center gap-3">
            <Select
              value={language}
              onValueChange={(value: "en" | "zh") => setLanguage(value)}>
              <SelectTrigger className="w-32">
                <Globe className="mr-1 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={theme}
              onValueChange={(value: "light" | "dark" | "system") =>
                setTheme(value)
              }>
              <SelectTrigger className="w-auto min-w-28 gap-1">
                {resolvedTheme === "dark" ? (
                  <Moon className="h-4 w-4 shrink-0" />
                ) : (
                  <Sun className="h-4 w-4 shrink-0" />
                )}
                <span className="whitespace-nowrap">
                  {theme === "light"
                    ? t("lightTheme")
                    : theme === "dark"
                      ? t("darkTheme")
                      : t("systemTheme")}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("lightTheme")}</SelectItem>
                <SelectItem value="dark">{t("darkTheme")}</SelectItem>
                <SelectItem value="system">{t("systemTheme")}</SelectItem>
              </SelectContent>
            </Select>
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="config">
                  <Settings className="mr-2 h-4 w-4" />
                  配置
                </TabsTrigger>
                <TabsTrigger value="combos">
                  <Plus className="mr-2 h-4 w-4" />
                  组合
                  {combos.length > 0 && (
                    <span
                      data-testid="combos-tab-badge"
                      className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                      {combos.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="config" className="space-y-8">
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
                <AccountSection
                  accounts={settings.accounts}
                  t={t}
                  onAdd={handleAddAccount}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                  onCopy={handleCopyAccount}
                  copiedId={copiedId}
                />
              </TabsContent>
              <TabsContent value="combos">
                <CombosSection settings={settings} />
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
