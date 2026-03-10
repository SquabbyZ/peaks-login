import { useState, useCallback, useEffect } from "react"
import type { CasConfig, CallbackConfig, AccountConfig, AppSettings } from "~/types"
import "~/style.css"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { getAppSettings, setAppSettings, generateId, createTimestamp, getMasterKey, setMasterKey } from "~/lib/storage"
import { encrypt, generateMasterKey, exportKey, importKey } from "~/lib/crypto"
import { useTranslation } from "~/lib/useTranslation"
import { useTheme } from "~/lib/useTheme"
import { useToast } from "~/hooks/use-toast"
import { Plus, Trash2, Server, Link, User, Globe, Pencil, AlertTriangle, Copy, Check, Shield, Moon, Sun, Download, Upload, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import icon from "~/assets/icon.png"
import iconDark from "~/assets/icon-dark.png"
import { Switch } from "~/components/ui/switch"
import { Toaster } from "~/components/ui/toaster"

function OptionsIndex() {
  const { t, language, setLanguage } = useTranslation()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { toast } = useToast()
  const currentIcon = resolvedTheme === "dark" ? iconDark : icon
  const [settings, setSettings] = useState<AppSettings>({
    casConfigs: [],
    callbackConfigs: [],
    accounts: [],
  })
  const [loading, setLoading] = useState(true)
  const [masterKeyString, setMasterKeyString] = useState<string>("")
  
  const [newCas, setNewCas] = useState({ name: "", url: "", usernameField: "email", passwordField: "password", tokenResponseKey: "token" })
  const [newCallback, setNewCallback] = useState({ name: "", url: "", tokenKeys: ["accessToken"], enableCors: false })
  const [newAccount, setNewAccount] = useState({ name: "", username: "", password: "" })
  
  const [editingCas, setEditingCas] = useState<CasConfig | null>(null)
  const [editingCallback, setEditingCallback] = useState<CallbackConfig | null>(null)
  const [editingAccount, setEditingAccount] = useState<AccountConfig | null>(null)
  
  const [editCasData, setEditCasData] = useState({ name: "", url: "", usernameField: "email", passwordField: "password", tokenResponseKey: "token" })
  const [editCallbackData, setEditCallbackData] = useState({ name: "", url: "", tokenKeys: ["accessToken"], enableCors: false })
  const [editAccountData, setEditAccountData] = useState({ name: "", username: "" })
  
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const [isAddingCas, setIsAddingCas] = useState(false)
  const [isAddingCallback, setIsAddingCallback] = useState(false)
  const [isAddingAccount, setIsAddingAccount] = useState(false)

  const loadSettings = useCallback(async () => {
    const loaded = await getAppSettings()
    setSettings(loaded)
    const key = await getMasterKey()
    if (key) {
      setMasterKeyString(key)
    }
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
      variant: "success",
    })
  }

  const addCasConfig = async () => {
    if (!newCas.name || !newCas.url) return
    const config: CasConfig = {
      id: generateId(),
      name: newCas.name,
      url: newCas.url,
      usernameField: newCas.usernameField || "email",
      passwordField: newCas.passwordField || "password",
      tokenResponseKey: newCas.tokenResponseKey || "token",
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    }
    const updated = { ...settings, casConfigs: [...settings.casConfigs, config] }
    await setAppSettings(updated)
    setSettings(updated)
    setNewCas({ name: "", url: "", usernameField: "email", passwordField: "password", tokenResponseKey: "token" })
    setIsAddingCas(false)
    toast({
      title: t("success"),
      description: t("casAddedSuccess"),
      variant: "success",
    })
  }

  const addCallbackConfig = async () => {
    if (!newCallback.name || !newCallback.url) return
    const config: CallbackConfig = {
      id: generateId(),
      name: newCallback.name,
      url: newCallback.url,
      tokenKeys: newCallback.tokenKeys.filter(k => k.trim() !== ""),
      enableCors: newCallback.enableCors,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    }
    const updated = { ...settings, callbackConfigs: [...settings.callbackConfigs, config] }
    await setAppSettings(updated)
    setSettings(updated)
    setNewCallback({ name: "", url: "", tokenKeys: ["accessToken"], enableCors: false })
    setIsAddingCallback(false)
    toast({
      title: t("success"),
      description: t("callbackAddedSuccess"),
      variant: "success",
    })
  }

  const addAccount = async () => {
    if (!newAccount.name || !newAccount.username || !newAccount.password) return
    
    let keyToUse = masterKeyString
    if (!keyToUse) {
      const key = await generateMasterKey()
      keyToUse = await exportKey(key)
      await setMasterKey(keyToUse)
      setMasterKeyString(keyToUse)
    }
    
    const key = await importKey(keyToUse)
    const encrypted = await encrypt(newAccount.password, key)
    const config: AccountConfig = {
      id: generateId(),
      name: newAccount.name,
      username: newAccount.username,
      encryptedPassword: JSON.stringify(encrypted),
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    }
    const updated = { ...settings, accounts: [...settings.accounts, config] }
    await setAppSettings(updated)
    setSettings(updated)
    setNewAccount({ name: "", username: "", password: "" })
    setIsAddingAccount(false)
    toast({
      title: t("success"),
      description: t("accountAddedSuccess"),
      variant: "success",
    })
  }

  const deleteItem = async (type: "cas" | "callback" | "account", id: string) => {
    let updated: AppSettings
    
    if (type === "cas") {
      updated = { ...settings, casConfigs: settings.casConfigs.filter((c) => c.id !== id) }
      await setAppSettings(updated)
      setSettings(updated)
      toast({
        title: t("success"),
        description: t("casDeletedSuccess"),
        variant: "success",
      })
    } else if (type === "callback") {
      updated = { ...settings, callbackConfigs: settings.callbackConfigs.filter((c) => c.id !== id) }
      await setAppSettings(updated)
      setSettings(updated)
      toast({
        title: t("success"),
        description: t("callbackDeletedSuccess"),
        variant: "success",
      })
    } else {
      updated = { ...settings, accounts: settings.accounts.filter((a) => a.id !== id) }
      await setAppSettings(updated)
      setSettings(updated)
      toast({
        title: t("success"),
        description: t("accountDeletedSuccess"),
        variant: "success",
      })
    }
  }

  const exportCasConfig = () => {
    const config = {
      casConfigs: settings.casConfigs,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `peaks-login-cas-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importCasConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const config = JSON.parse(text)
      
      if (!config.casConfigs || !Array.isArray(config.casConfigs)) {
        throw new Error("Invalid CAS configuration file")
      }

      const importedCasConfigs = config.casConfigs.map((cas: CasConfig) => ({
        ...cas,
        id: cas.id || generateId(),
        createdAt: cas.createdAt || createTimestamp(),
        updatedAt: createTimestamp(),
      }))

      const mergedCasConfigs = [...settings.casConfigs]
      
      importedCasConfigs.forEach((importedCas: CasConfig) => {
        const existingIndex = mergedCasConfigs.findIndex(cas => cas.id === importedCas.id)
        if (existingIndex >= 0) {
          mergedCasConfigs[existingIndex] = importedCas
        } else {
          mergedCasConfigs.push(importedCas)
        }
      })

      const updated = {
        ...settings,
        casConfigs: mergedCasConfigs,
      }

      await setAppSettings(updated)
      setSettings(updated)
      toast({
        title: t("success"),
        description: t("importSuccess"),
        variant: "success",
      })
    } catch (error) {
      console.error("Import CAS error:", error)
      toast({
        title: t("error"),
        description: t("importError"),
        variant: "destructive",
      })
    }

    event.target.value = ""
  }

  const exportCallbackConfig = () => {
    const config = {
      callbackConfigs: settings.callbackConfigs,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `peaks-login-callback-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importCallbackConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const config = JSON.parse(text)
      
      if (!config.callbackConfigs || !Array.isArray(config.callbackConfigs)) {
        throw new Error("Invalid callback configuration file")
      }

      const importedCallbackConfigs = config.callbackConfigs.map((callback: CallbackConfig) => ({
        ...callback,
        id: callback.id || generateId(),
        createdAt: callback.createdAt || createTimestamp(),
        updatedAt: createTimestamp(),
      }))

      const mergedCallbackConfigs = [...settings.callbackConfigs]
      
      importedCallbackConfigs.forEach((importedCallback: CallbackConfig) => {
        const existingIndex = mergedCallbackConfigs.findIndex(callback => callback.id === importedCallback.id)
        if (existingIndex >= 0) {
          mergedCallbackConfigs[existingIndex] = importedCallback
        } else {
          mergedCallbackConfigs.push(importedCallback)
        }
      })

      const updated = {
        ...settings,
        callbackConfigs: mergedCallbackConfigs,
      }

      await setAppSettings(updated)
      setSettings(updated)
      toast({
        title: t("success"),
        description: t("importSuccess"),
        variant: "success",
      })
    } catch (error) {
      console.error("Import callback error:", error)
      toast({
        title: t("error"),
        description: t("importError"),
        variant: "destructive",
      })
    }

    event.target.value = ""
  }

  const openEditCas = (cas: CasConfig) => {
    setEditingCas(cas)
    setEditCasData({ 
      name: cas.name, 
      url: cas.url, 
      usernameField: cas.usernameField || "email", 
      passwordField: cas.passwordField || "password",
      tokenResponseKey: cas.tokenResponseKey || "token"
    })
  }

  const saveEditCas = async () => {
    if (!editingCas || !editCasData.name || !editCasData.url) return
    const updated = {
      ...settings,
      casConfigs: settings.casConfigs.map((c) =>
        c.id === editingCas.id
          ? { 
              ...c, 
              name: editCasData.name, 
              url: editCasData.url, 
              usernameField: editCasData.usernameField || "email", 
              passwordField: editCasData.passwordField || "password",
              tokenResponseKey: editCasData.tokenResponseKey || "token",
              updatedAt: createTimestamp() 
            }
          : c
      ),
    }
    await setAppSettings(updated)
    setSettings(updated)
    setEditingCas(null)
    setEditCasData({ name: "", url: "", usernameField: "email", passwordField: "password", tokenResponseKey: "token" })
    toast({
      title: t("success"),
      description: t("casUpdatedSuccess"),
      variant: "success",
    })
  }

  const openEditCallback = (callback: CallbackConfig) => {
    setEditingCallback(callback)
    setEditCallbackData({ name: callback.name, url: callback.url, tokenKeys: callback.tokenKeys || ["accessToken"], enableCors: callback.enableCors || false })
  }

  const saveEditCallback = async () => {
    if (!editingCallback || !editCallbackData.name || !editCallbackData.url) return
    const updated = {
      ...settings,
      callbackConfigs: settings.callbackConfigs.map((c) =>
        c.id === editingCallback.id
          ? { ...c, name: editCallbackData.name, url: editCallbackData.url, tokenKeys: editCallbackData.tokenKeys.filter(k => k.trim() !== ""), enableCors: editCallbackData.enableCors, updatedAt: createTimestamp() }
          : c
      ),
    }
    await setAppSettings(updated)
    setSettings(updated)
    setEditingCallback(null)
    setEditCallbackData({ name: "", url: "", tokenKeys: ["accessToken"], enableCors: false })
    toast({
      title: t("success"),
      description: t("callbackUpdatedSuccess"),
      variant: "success",
    })
  }

  const openEditAccount = (account: AccountConfig) => {
    setEditingAccount(account)
    setEditAccountData({ name: account.name, username: account.username })
  }

  const saveEditAccount = async () => {
    if (!editingAccount || !editAccountData.name || !editAccountData.username) return
    const updated = {
      ...settings,
      accounts: settings.accounts.map((a) =>
        a.id === editingAccount.id
          ? { ...a, name: editAccountData.name, username: editAccountData.username, updatedAt: createTimestamp() }
          : a
      ),
    }
    await setAppSettings(updated)
    setSettings(updated)
    setEditingAccount(null)
    setEditAccountData({ name: "", username: "" })
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({
      title: t("success"),
      description: t("configCopiedSuccess"),
      variant: "success",
    })
  }

  const copyCasConfig = async (cas: CasConfig) => {
    const newConfig: CasConfig = {
      id: generateId(),
      name: `${cas.name} (${t("copy")})`,
      url: cas.url,
      usernameField: cas.usernameField || "email",
      passwordField: cas.passwordField || "password",
      tokenResponseKey: cas.tokenResponseKey || "token",
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    }
    const updated = { ...settings, casConfigs: [...settings.casConfigs, newConfig] }
    await setAppSettings(updated)
    setSettings(updated)
    await copyToClipboard(cas.url, newConfig.id)
  }

  const copyCallbackConfig = async (callback: CallbackConfig) => {
    const newConfig: CallbackConfig = {
      id: generateId(),
      name: `${callback.name} (${t("copy")})`,
      url: callback.url,
      tokenKeys: callback.tokenKeys || ["accessToken"],
      enableCors: callback.enableCors || false,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    }
    const updated = { ...settings, callbackConfigs: [...settings.callbackConfigs, newConfig] }
    await setAppSettings(updated)
    setSettings(updated)
    await copyToClipboard(callback.url, newConfig.id)
  }

  const copyAccountConfig = async (account: AccountConfig) => {
    const newConfig: AccountConfig = {
      id: generateId(),
      name: `${account.name} (${t("copy")})`,
      username: account.username,
      encryptedPassword: account.encryptedPassword,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    }
    const updated = { ...settings, accounts: [...settings.accounts, newConfig] }
    await setAppSettings(updated)
    setSettings(updated)
    await copyToClipboard(account.username, newConfig.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex items-center justify-between pb-4 border-b mb-8">
            <div className="flex items-center gap-3">
              <img src={currentIcon} alt="Peaks Token" className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("settingsTitle")}</h1>
                <p className="text-sm text-muted-foreground">{t("settingsDescription")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={language} onValueChange={(value: "en" | "zh") => setLanguage(value)}>
                <SelectTrigger className="w-32">
                  <Globe className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
              <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}>
                <SelectTrigger className="w-auto min-w-28 gap-1">
                  {resolvedTheme === "dark" ? (
                    <Moon className="h-4 w-4 shrink-0" />
                  ) : (
                    <Sun className="h-4 w-4 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">
                    {theme === "light" ? t("lightTheme") : theme === "dark" ? t("darkTheme") : t("systemTheme")}
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
              <nav className="hidden xl:block fixed top-24 right-[max(0px,calc((100vw-896px)/2-200px))] w-48 shrink-0">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{t("quickNavigation")}</p>
                  <div className="space-y-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => document.getElementById("section-cas")?.scrollIntoView({ behavior: "smooth" })}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-background transition-colors cursor-pointer text-left"
                        >
                          <Server className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{t("casLoginAddresses")}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{t("jumpToSection")}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => document.getElementById("section-callback")?.scrollIntoView({ behavior: "smooth" })}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-background transition-colors cursor-pointer text-left"
                        >
                          <Link className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{t("callbackAddresses")}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{t("jumpToSection")}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => document.getElementById("section-account")?.scrollIntoView({ behavior: "smooth" })}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-background transition-colors cursor-pointer text-left"
                        >
                          <User className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{t("accounts")}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{t("jumpToSection")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </nav>

        {!masterKeyString && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">{t("initEncryptionKey")}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t("initEncryptionKeyDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={initMasterKey}>
                {t("initializeKey")}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card id="section-cas">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                <CardTitle>{t("casLoginAddresses")}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setIsAddingCas(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addCasAddress")}
                </Button>
                <Button onClick={exportCasConfig} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t("exportConfig")}
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importCasConfig}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="import-cas-file"
                  />
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {t("importConfig")}
                  </Button>
                </div>
              </div>
            </div>
            <CardDescription>{t("casLoginDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {settings.casConfigs.length > 0 && (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                  <TableRow>
                    <TableHead className="max-w-[150px] whitespace-nowrap">{t("casName")}</TableHead>
                    <TableHead className="max-w-[170px] whitespace-nowrap">{t("casUrl")}</TableHead>
                    <TableHead className="max-w-[120px] whitespace-nowrap">{t("usernameField")}</TableHead>
                    <TableHead className="max-w-[120px] whitespace-nowrap">{t("passwordField")}</TableHead>
                    <TableHead className="max-w-[150px] whitespace-nowrap">{t("tokenResponseKey")}</TableHead>
                    <TableHead className="w-[150px] text-right whitespace-nowrap">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                  <TableBody>
                    {settings.casConfigs.map((cas) => (
                      <TableRow key={cas.id}>
                        <TableCell className="max-w-[150px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate font-medium cursor-default">{cas.name}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{cas.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="max-w-[170px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate text-muted-foreground cursor-default">{cas.url}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{cas.url}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="max-w-[120px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate cursor-default">{cas.usernameField || "email"}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{cas.usernameField || "email"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="max-w-[120px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate cursor-default">{cas.passwordField || "password"}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{cas.passwordField || "password"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate cursor-default">{cas.tokenResponseKey || "token"}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{cas.tokenResponseKey || "token"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditCas(cas)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyCasConfig(cas)}>
                                {copiedId === cas.id ? (
                                  <Check className="mr-2 h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="mr-2 h-4 w-4" />
                                )}
                                {t("copy")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("deleteCasTitle")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("deleteCasDescription")} "{cas.name}"
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteItem("cas", cas.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {t("delete")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="section-callback">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link className="h-5 w-5 text-primary" />
                <CardTitle>{t("callbackAddresses")}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setIsAddingCallback(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addCallbackAddress")}
                </Button>
                <Button onClick={exportCallbackConfig} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t("exportConfig")}
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importCallbackConfig}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="import-callback-file"
                  />
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {t("importConfig")}
                  </Button>
                </div>
              </div>
            </div>
            <CardDescription>{t("callbackDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {settings.callbackConfigs.length > 0 && (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="max-w-[150px] whitespace-nowrap">{t("callbackName")}</TableHead>
                      <TableHead className="max-w-[200px] whitespace-nowrap">{t("callbackUrl")}</TableHead>
                      <TableHead className="max-w-[200px] whitespace-nowrap">{t("tokenKeys")}</TableHead>
                      <TableHead className="max-w-[100px] whitespace-nowrap">{t("enableCors")}</TableHead>
                      <TableHead className="w-[150px] text-right whitespace-nowrap">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.callbackConfigs.map((callback) => (
                      <TableRow key={callback.id}>
                        <TableCell className="max-w-[150px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate font-medium cursor-default">{callback.name}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{callback.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate text-muted-foreground cursor-default">{callback.url}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{callback.url}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate text-muted-foreground cursor-default">{callback.tokenKeys?.join(", ") || "accessToken"}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{callback.tokenKeys?.join(", ") || "accessToken"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="max-w-[100px]">{(callback.enableCors ?? false) ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditCallback(callback)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyCallbackConfig(callback)}>
                                {copiedId === callback.id ? (
                                  <Check className="mr-2 h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="mr-2 h-4 w-4" />
                                )}
                                {t("copy")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("deleteCallbackTitle")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("deleteCallbackDescription")} "{callback.name}"
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteItem("callback", callback.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {t("delete")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="section-account">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>{t("accounts")}</CardTitle>
              </div>
              <Button onClick={() => setIsAddingAccount(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("addAccount")}
              </Button>
            </div>
            <CardDescription>{t("accountsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {settings.accounts.length > 0 && (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                  <TableRow>
                    <TableHead className="max-w-[150px] whitespace-nowrap">{t("accountName")}</TableHead>
                    <TableHead className="max-w-[150px] whitespace-nowrap">{t("accountUsername")}</TableHead>
                    <TableHead className="max-w-[150px] whitespace-nowrap">{t("accountPassword")}</TableHead>
                    <TableHead className="w-[150px] text-right whitespace-nowrap">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                  <TableBody>
                    {settings.accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="max-w-[150px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate font-medium cursor-default">{account.name}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{account.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate cursor-default">{account.username}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{account.username}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[150px]">{t("passwordEncrypted")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditAccount(account)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {t("edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyAccountConfig(account)}>
                                {copiedId === account.id ? (
                                  <Check className="mr-2 h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="mr-2 h-4 w-4" />
                                )}
                                {t("copy")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("deleteAccountTitle")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("deleteAccountDescription")} "{account.name}"
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteItem("account", account.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {t("delete")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
            </main>
          </div>
        </div>

      {/* Add CAS Dialog */}
      <Dialog open={isAddingCas} onOpenChange={(open) => !open && setIsAddingCas(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addCasAddress")}</DialogTitle>
            <DialogDescription>{t("casLoginDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-cas-name">{t("casName")}</Label>
                <Input
                  id="new-cas-name"
                  placeholder={t("casNamePlaceholder")}
                  value={newCas.name}
                  onChange={(e) => setNewCas({ ...newCas, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-cas-url">{t("casUrl")}</Label>
                <Input
                  id="new-cas-url"
                  placeholder={t("casUrlPlaceholder")}
                  value={newCas.url}
                  onChange={(e) => setNewCas({ ...newCas, url: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-cas-username-field">{t("usernameField")}</Label>
                <Input
                  id="new-cas-username-field"
                  placeholder="email"
                  value={newCas.usernameField}
                  onChange={(e) => setNewCas({ ...newCas, usernameField: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-cas-password-field">{t("passwordField")}</Label>
                <Input
                  id="new-cas-password-field"
                  placeholder="password"
                  value={newCas.passwordField}
                  onChange={(e) => setNewCas({ ...newCas, passwordField: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-cas-token-response-key">{t("tokenResponseKey")}</Label>
                <Input
                  id="new-cas-token-response-key"
                  placeholder={t("tokenResponseKeyPlaceholder")}
                  value={newCas.tokenResponseKey}
                  onChange={(e) => setNewCas({ ...newCas, tokenResponseKey: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCas(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={addCasConfig} disabled={!newCas.name || !newCas.url}>
              {t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Callback Dialog */}
      <Dialog open={isAddingCallback} onOpenChange={(open) => !open && setIsAddingCallback(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("addCallbackAddress")}</DialogTitle>
            <DialogDescription>{t("callbackDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-callback-name">{t("callbackName")}</Label>
                <Input
                  id="new-callback-name"
                  placeholder={t("callbackNamePlaceholder")}
                  value={newCallback.name}
                  onChange={(e) => setNewCallback({ ...newCallback, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-callback-url">{t("callbackUrl")}</Label>
                <Input
                  id="new-callback-url"
                  placeholder={t("callbackUrlPlaceholder")}
                  value={newCallback.url}
                  onChange={(e) => setNewCallback({ ...newCallback, url: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("tokenKeys")}</Label>
              <div className="space-y-2">
                {newCallback.tokenKeys.map((tokenKey, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={t("tokenKeyPlaceholder")}
                      value={tokenKey}
                      onChange={(e) => {
                        const newTokenKeys = [...newCallback.tokenKeys]
                        newTokenKeys[index] = e.target.value
                        setNewCallback({ ...newCallback, tokenKeys: newTokenKeys })
                      }}
                    />
                    {newCallback.tokenKeys.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newTokenKeys = newCallback.tokenKeys.filter((_, i) => i !== index)
                          setNewCallback({ ...newCallback, tokenKeys: newTokenKeys })
                        }}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewCallback({ ...newCallback, tokenKeys: [...newCallback.tokenKeys, ""] })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("addTokenKey")}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">{t("enableCors")}</Label>
                </div>
                <p className="text-xs text-muted-foreground">{t("enableCorsDescription")}</p>
              </div>
              <Switch
                checked={newCallback.enableCors ?? false}
                onCheckedChange={(checked) => setNewCallback({ ...newCallback, enableCors: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCallback(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={addCallbackConfig} disabled={!newCallback.name || !newCallback.url}>
              {t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Account Dialog */}
      <Dialog open={isAddingAccount} onOpenChange={(open) => !open && setIsAddingAccount(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addAccount")}</DialogTitle>
            <DialogDescription>{t("accountsDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-account-name">{t("accountName")}</Label>
              <Input
                id="new-account-name"
                placeholder={t("accountNamePlaceholder")}
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-account-username">{t("accountUsername")}</Label>
              <Input
                id="new-account-username"
                placeholder={t("accountUsernamePlaceholder")}
                value={newAccount.username}
                onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-account-password">{t("accountPassword")}</Label>
              <Input
                id="new-account-password"
                type="password"
                placeholder={t("accountPasswordPlaceholder")}
                value={newAccount.password}
                onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingAccount(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={addAccount} disabled={!newAccount.name || !newAccount.username || !newAccount.password}>
              {t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit CAS Dialog */}
      <Dialog open={!!editingCas} onOpenChange={(open) => !open && setEditingCas(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editCasTitle")}</DialogTitle>
            <DialogDescription>{t("editCasDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-cas-name">{t("casName")}</Label>
              <Input
                id="edit-cas-name"
                value={editCasData.name}
                onChange={(e) => setEditCasData({ ...editCasData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cas-url">{t("casUrl")}</Label>
              <Input
                id="edit-cas-url"
                value={editCasData.url}
                onChange={(e) => setEditCasData({ ...editCasData, url: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cas-username-field">{t("usernameField")}</Label>
              <Input
                id="edit-cas-username-field"
                value={editCasData.usernameField}
                onChange={(e) => setEditCasData({ ...editCasData, usernameField: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cas-password-field">{t("passwordField")}</Label>
              <Input
                id="edit-cas-password-field"
                value={editCasData.passwordField}
                onChange={(e) => setEditCasData({ ...editCasData, passwordField: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cas-token-response-key">{t("tokenResponseKey")}</Label>
              <Input
                id="edit-cas-token-response-key"
                value={editCasData.tokenResponseKey}
                onChange={(e) => setEditCasData({ ...editCasData, tokenResponseKey: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCas(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={saveEditCas} disabled={!editCasData.name || !editCasData.url}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Callback Dialog */}
      <Dialog open={!!editingCallback} onOpenChange={(open) => !open && setEditingCallback(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editCallbackTitle")}</DialogTitle>
            <DialogDescription>{t("editCallbackDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-callback-name">{t("callbackName")}</Label>
              <Input
                id="edit-callback-name"
                value={editCallbackData.name}
                onChange={(e) => setEditCallbackData({ ...editCallbackData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-callback-url">{t("callbackUrl")}</Label>
              <Input
                id="edit-callback-url"
                value={editCallbackData.url}
                onChange={(e) => setEditCallbackData({ ...editCallbackData, url: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("tokenKeys")}</Label>
              <div className="space-y-2">
                {editCallbackData.tokenKeys.map((tokenKey, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={t("tokenKeyPlaceholder")}
                      value={tokenKey}
                      onChange={(e) => {
                        const newTokenKeys = [...editCallbackData.tokenKeys]
                        newTokenKeys[index] = e.target.value
                        setEditCallbackData({ ...editCallbackData, tokenKeys: newTokenKeys })
                      }}
                    />
                    {editCallbackData.tokenKeys.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newTokenKeys = editCallbackData.tokenKeys.filter((_, i) => i !== index)
                          setEditCallbackData({ ...editCallbackData, tokenKeys: newTokenKeys })
                        }}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditCallbackData({ ...editCallbackData, tokenKeys: [...editCallbackData.tokenKeys, ""] })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("addTokenKey")}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">{t("enableCors")}</Label>
                </div>
                <p className="text-xs text-muted-foreground">{t("enableCorsDescription")}</p>
              </div>
              <Switch
                checked={editCallbackData.enableCors ?? false}
                onCheckedChange={(checked) => setEditCallbackData({ ...editCallbackData, enableCors: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCallback(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={saveEditCallback} disabled={!editCallbackData.name || !editCallbackData.url}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editAccountTitle")}</DialogTitle>
            <DialogDescription>{t("editAccountDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-account-name">{t("accountName")}</Label>
              <Input
                id="edit-account-name"
                value={editAccountData.name}
                onChange={(e) => setEditAccountData({ ...editAccountData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-account-username">{t("accountUsername")}</Label>
              <Input
                id="edit-account-username"
                value={editAccountData.username}
                onChange={(e) => setEditAccountData({ ...editAccountData, username: e.target.value })}
              />
            </div>
            <div className="rounded-md bg-muted border border-border p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t("passwordCannotEdit")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("passwordCannotEditDescription")}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAccount(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={saveEditAccount} disabled={!editAccountData.name || !editAccountData.username}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
    </TooltipProvider>
  )
}

export default OptionsIndex
