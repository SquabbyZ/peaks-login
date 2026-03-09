import { useState, useEffect, useCallback } from "react"
import type { AppSettings, PopupState } from "~/types"
import "~/style.css"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { getAppSettings, setPopupState, getPopupState } from "~/lib/storage"
import { useTranslation } from "~/lib/useTranslation"
import { useTheme } from "~/lib/useTheme"
import { Server, User, Link2, Loader2, Settings, CheckCircle2, AlertCircle, ChevronRight, Key, Moon, Sun } from "lucide-react"
import icon from "~/assets/icon.png"
import iconDark from "~/assets/icon-dark.png"

type LoginStatus = "idle" | "loading" | "success" | "error"

function PopupIndex() {
  const { t } = useTranslation()
  const { resolvedTheme, toggleTheme } = useTheme()
  const currentIcon = resolvedTheme === "dark" ? iconDark : icon
  const [settings, setSettings] = useState<AppSettings>({
    casConfigs: [],
    callbackConfigs: [],
    accounts: [],
  })
  const [popupState, setLocalPopupState] = useState<PopupState>({
    selectedCasId: null,
    selectedAccountId: null,
    selectedCallbackId: null,
    tokenKeyMappings: {},
  })
  const [loading, setLoading] = useState(true)
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [validationErrors, setValidationErrors] = useState<{
    cas?: boolean
    account?: boolean
    callback?: boolean
  }>({})

  const loadData = useCallback(async () => {
    try {
      const [loadedSettings, loadedPopupState] = await Promise.all([
        getAppSettings(),
        getPopupState(),
      ])
      setSettings(loadedSettings)
      setLocalPopupState(loadedPopupState)
      setLoading(false)
    } catch (err) {
      console.error("Failed to load data:", err)
      const message = err instanceof Error ? err.message : "Unknown error"
      setErrorMessage(message)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCasChange = async (value: string) => {
    const newState = { ...popupState, selectedCasId: value }
    setLocalPopupState(newState)
    setValidationErrors(prev => ({ ...prev, cas: false }))
    await setPopupState(newState)
  }

  const handleAccountChange = async (value: string) => {
    const newState = { ...popupState, selectedAccountId: value }
    setLocalPopupState(newState)
    setValidationErrors(prev => ({ ...prev, account: false }))
    await setPopupState(newState)
  }

  const handleCallbackChange = async (value: string) => {
    const newState = { ...popupState, selectedCallbackId: value }
    setLocalPopupState(newState)
    setValidationErrors(prev => ({ ...prev, callback: false }))
    await setPopupState(newState)
  }

  const handleTokenKeyMappingChange = async (callbackId: string, tokenKey: string, casId: string) => {
    const mappingKey = `${callbackId}:${tokenKey}`
    const newMappings = { ...popupState.tokenKeyMappings, [mappingKey]: casId }
    const newState = { ...popupState, tokenKeyMappings: newMappings }
    setLocalPopupState(newState)
    await setPopupState(newState)
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  const handleLogin = async () => {
    // 校验所有必填项
    const errors = {
      cas: !popupState.selectedCasId,
      account: !popupState.selectedAccountId,
      callback: !popupState.selectedCallbackId,
    }
    setValidationErrors(errors)
    
    if (errors.cas || errors.account || errors.callback) {
      return
    }

    const casConfig = settings.casConfigs.find((c) => c.id === popupState.selectedCasId)
    const accountConfig = settings.accounts.find((a) => a.id === popupState.selectedAccountId)
    const callbackConfig = settings.callbackConfigs.find((c) => c.id === popupState.selectedCallbackId)

    if (!casConfig || !accountConfig || !callbackConfig) {
      setErrorMessage(t("invalidConfiguration"))
      setLoginStatus("error")
      return
    }

    setLoginStatus("loading")
    setErrorMessage("")

    try {
      // 构建当前回调地址相关的 token 映射关系
      const currentTokenMappings: Record<string, string> = {}
      if (callbackConfig.tokenKeys && callbackConfig.tokenKeys.length > 0) {
        for (const tokenKey of callbackConfig.tokenKeys) {
          const mappingKey = `${callbackConfig.id}:${tokenKey}`
          // 如果没有映射，默认使用当前选中的 CAS
          const casId = popupState.tokenKeyMappings?.[mappingKey] || casConfig.id
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
          tokenKeyMappings: currentTokenMappings, // tokenKey -> casId 的映射
        },
      })

      if (response.success) {
        setLoginStatus("success")
      } else {
        setErrorMessage(response.error || t("error"))
        setLoginStatus("error")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error")
      setErrorMessage(message)
      setLoginStatus("error")
    }
  }

  const selectedCas = settings.casConfigs.find((c) => c.id === popupState.selectedCasId)
  const selectedAccount = settings.accounts.find((a) => a.id === popupState.selectedAccountId)
  const selectedCallback = settings.callbackConfigs.find((c) => c.id === popupState.selectedCallbackId)

  const canLogin = selectedCas && selectedAccount && selectedCallback && loginStatus !== "loading"

  if (loading) {
    return (
      <div className="w-[340px] h-[420px] bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{t("loading")}</span>
        </div>
      </div>
    )
  }

  if (settings.casConfigs.length === 0 || settings.accounts.length === 0 || settings.callbackConfigs.length === 0) {
    return (
      <div className="w-[340px] bg-background">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <img src={currentIcon} alt="Peaks Login" className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{t("appName")}</h1>
              <p className="text-xs text-muted-foreground">{t("appDescription")}</p>
            </div>
          </div>

          <Card className="border-border bg-muted/50 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-muted rounded-md mt-0.5">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">{t("configurationRequired")}</p>
                  <p className="text-xs text-muted-foreground mb-3">{t("configurationRequiredDescription")}</p>
                  <Button size="sm" onClick={openOptions}>
                    {t("openSettings")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[340px] bg-background">
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <img src={currentIcon} alt="Peaks Login" className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{t("appName")}</h1>
              <p className="text-xs text-muted-foreground">{t("appDescription")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={openOptions} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Server className="h-4 w-4 text-primary" />
              <span>{t("casLoginAddresses")}</span>
            </div>
            <Select value={popupState.selectedCasId || ""} onValueChange={handleCasChange}>
              <SelectTrigger className={`bg-background border-border hover:border-primary/50 transition-colors ${validationErrors.cas ? 'border-destructive' : ''}`}>
                <SelectValue placeholder={t("selectCasAddress")} />
              </SelectTrigger>
              <SelectContent disablePortal>
                {settings.casConfigs.map((cas) => (
                  <SelectItem key={cas.id} value={cas.id}>
                    {cas.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.cas && (
              <p className="text-xs text-destructive pl-1">{t("pleaseSelectCas")}</p>
            )}
            {selectedCas && (
              <p className="text-xs text-muted-foreground pl-1 truncate">{selectedCas.url}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="h-4 w-4 text-primary" />
              <span>{t("accounts")}</span>
            </div>
            <Select value={popupState.selectedAccountId || ""} onValueChange={handleAccountChange}>
              <SelectTrigger className={`bg-background border-border hover:border-primary/50 transition-colors ${validationErrors.account ? 'border-destructive' : ''}`}>
                <SelectValue placeholder={t("selectAccount")} />
              </SelectTrigger>
              <SelectContent disablePortal>
                {settings.accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.account && (
              <p className="text-xs text-destructive pl-1">{t("pleaseSelectAccount")}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Link2 className="h-4 w-4 text-primary" />
              <span>{t("callbackAddresses")}</span>
            </div>
            <Select value={popupState.selectedCallbackId || ""} onValueChange={handleCallbackChange}>
              <SelectTrigger className={`bg-background border-border hover:border-primary/50 transition-colors ${validationErrors.callback ? 'border-destructive' : ''}`}>
                <SelectValue placeholder={t("selectCallbackAddress")} />
              </SelectTrigger>
              <SelectContent disablePortal>
                {settings.callbackConfigs.map((callback) => (
                  <SelectItem key={callback.id} value={callback.id}>
                    {callback.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.callback && (
              <p className="text-xs text-destructive pl-1">{t("pleaseSelectCallback")}</p>
            )}
            {selectedCallback && (
              <p className="text-xs text-muted-foreground pl-1 truncate">{selectedCallback.url}</p>
            )}
          </div>

          {selectedCallback && selectedCallback.tokenKeys && selectedCallback.tokenKeys.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Key className="h-4 w-4 text-primary" />
                <span>{t("tokenKeyMapping")}</span>
              </div>
              <div className="space-y-3">
                {selectedCallback.tokenKeys.map((tokenKey) => (
                  <div key={tokenKey} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{tokenKey}</p>
                    <Select 
                      value={popupState.tokenKeyMappings?.[`${selectedCallback.id}:${tokenKey}`] || ""} 
                      onValueChange={(value) => handleTokenKeyMappingChange(selectedCallback.id, tokenKey, value)}
                    >
                      <SelectTrigger className="bg-background border-border hover:border-primary/50 transition-colors h-9">
                        <SelectValue placeholder={t("selectTokenSource")} />
                      </SelectTrigger>
                      <SelectContent disablePortal>
                        {settings.casConfigs.map((cas) => (
                          <SelectItem key={cas.id} value={cas.id}>
                            {cas.name} ({cas.tokenResponseKey || "token"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loginStatus === "error" && (
            <Card className="border-destructive/50 bg-destructive/10 shadow-none">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </CardContent>
            </Card>
          )}

          {loginStatus === "success" && (
            <Card className="border-primary/50 bg-primary/10 shadow-none">
              <CardContent className="p-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-primary">{t("loginSuccessful")}</p>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={handleLogin}
            disabled={!canLogin}
          >
            {loginStatus === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("loggingIn")}
              </>
            ) : (
              <>
                <img src={currentIcon} alt="" className="h-4 w-4 mr-2" />
                {t("login")}
              </>
            )}
          </Button>
        </div>

        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {settings.casConfigs.length} CAS · {settings.accounts.length} {t("accounts")} · {settings.callbackConfigs.length} callbacks
          </p>
          <Button variant="link" size="sm" onClick={openOptions} className="h-auto p-0 text-xs text-primary">
            {t("settings")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PopupIndex
