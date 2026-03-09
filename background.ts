import type { AccountConfig, TokenData, DecryptParams, CasConfig, CallbackConfig } from "~/types"
import { getAppSettings, getMasterKey } from "~/lib/storage"
import { decrypt, importKey } from "~/lib/crypto"

interface LoginRequestData {
  casId: string
  username: string
  accountId: string
  callbackId: string
  callbackUrl: string
  tokenKeyMappings: Record<string, string>
}

type CasLoginResponse = Record<string, unknown>

async function getDecryptedPassword(accountId: string): Promise<string> {
  const settings = await getAppSettings()
  const account = settings.accounts.find((a: AccountConfig) => a.id === accountId)
  
  if (!account) {
    throw new Error("Account not found")
  }

  const masterKeyString = await getMasterKey()
  if (!masterKeyString) {
    throw new Error("Master key not found")
  }

  const key = await importKey(masterKeyString)
  const encryptedData: DecryptParams = JSON.parse(account.encryptedPassword)
  
  return decrypt(encryptedData, key)
}

async function performCasLogin(
  casUrl: string,
  username: string,
  password: string,
  usernameField: string,
  passwordField: string
): Promise<CasLoginResponse> {
  const requestBody = {
    [usernameField]: username,
    [passwordField]: password
  }
  
  console.log("Login request URL:", casUrl)
  console.log("Login request body:", JSON.stringify(requestBody, null, 2))
  
  const response = await fetch(casUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(requestBody),
    credentials: "include",
  })

  console.log("Response status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Error response:", errorText)
    throw new Error(`Login failed: ${response.status}`)
  }

  const data = await response.json()
  
  console.log("API Response:", JSON.stringify(data, null, 2))
  
  const tokenData = data.data || data
  
  return tokenData as CasLoginResponse
}

function extractTokenFromResponse(
  response: CasLoginResponse,
  tokenResponseKey: string
): string | null {
  const possibleKeys = [
    tokenResponseKey,
    tokenResponseKey.replace(/_/g, ""),
    tokenResponseKey.replace(/([A-Z])/g, "_$1").toLowerCase(),
    tokenResponseKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
  ]
  
  for (const key of possibleKeys) {
    if (response[key] !== undefined && response[key] !== null) {
      return String(response[key])
    }
  }
  
  console.warn(`Token key "${tokenResponseKey}" not found in response. Available keys:`, Object.keys(response))
  return null
}

async function injectTokensToPage(tabId: number, tokens: Record<string, string>, shouldRedirect: boolean = false, redirectUrl?: string): Promise<void> {
  console.log("[Peaks Login] injectTokensToPage called, tabId:", tabId, "tokens:", tokens, "shouldRedirect:", shouldRedirect)
  
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      func: (tokensToInject: Record<string, string>, doRedirect: boolean, url: string) => {
        console.log("[Peaks Login] Injecting tokens in MAIN world")
        console.log("[Peaks Login] Current URL:", window.location.href)
        console.log("[Peaks Login] Tokens to inject:", tokensToInject)
        
        for (const [key, value] of Object.entries(tokensToInject)) {
          try {
            localStorage.setItem(key, value)
            console.log(`[Peaks Login] Set localStorage["${key}"] = ${value.substring(0, 50)}...`)
          } catch (e) {
            console.error(`[Peaks Login] Failed to set localStorage["${key}"]:`, e)
          }
        }
        
        // 验证是否设置成功
        for (const [key] of Object.entries(tokensToInject)) {
          const storedValue = localStorage.getItem(key)
          console.log(`[Peaks Login] Verify localStorage["${key}"] exists:`, !!storedValue)
        }
        
        console.log("[Peaks Login] All tokens injected successfully")
        
        if (doRedirect && url) {
          console.log("[Peaks Login] Redirecting to:", url)
          window.location.href = url
        }
        
        return { success: true, injectedKeys: Object.keys(tokensToInject) }
      },
      args: [tokens, shouldRedirect, redirectUrl || ""],
    })
    console.log("[Peaks Login] Script execution results:", results)
  } catch (error) {
    console.error("[Peaks Login] Failed to inject tokens:", error)
    throw error
  }
}

async function navigateAndInjectTokens(
  tabId: number,
  tokenData: TokenData
): Promise<void> {
  const { tokens, callbackUrl } = tokenData
  const trimmedUrl = callbackUrl.trim()
  
  console.log("[Peaks Login] navigateAndInjectTokens called")
  console.log("[Peaks Login] tabId:", tabId)
  console.log("[Peaks Login] tokens:", tokens)
  console.log("[Peaks Login] callbackUrl:", trimmedUrl)
  
  // 先获取当前 tab 的 URL，判断是否需要导航
  const tab = await chrome.tabs.get(tabId)
  const currentUrl = tab.url || ""
  
  // 检查是否是受限页面（chrome://, edge://, about: 等）
  const isRestrictedUrl = (url: string) => {
    return url.startsWith('chrome://') || 
           url.startsWith('chrome-extension://') ||
           url.startsWith('edge://') || 
           url.startsWith('about:') ||
           url.startsWith('devtools://') ||
           url === ''
  }
  
  // 提取 URL 的基础部分（不含 query string 和 hash）用于比较
  const getBaseUrl = (url: string) => url.split('?')[0].split('#')[0]
  const currentBaseUrl = getBaseUrl(currentUrl)
  const targetBaseUrl = getBaseUrl(trimmedUrl)
  
  // 检查是否已经在目标页面（受限页面不算在目标页面）
  const isOnTargetPage = !isRestrictedUrl(currentUrl) && 
    (currentBaseUrl === targetBaseUrl || currentUrl.startsWith(targetBaseUrl))
  
  if (isRestrictedUrl(currentUrl)) {
    console.log("[Peaks Login] Current tab is restricted URL, will navigate to target:", currentUrl)
  }
  
  // 使用 webNavigation.onCommitted 来尽早注入 token（在页面 JS 执行之前）
  const injectOnCommitted = (): Promise<void> => {
    return new Promise((resolve) => {
      let injected = false
      
      const onCommittedListener = async (details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) => {
        // 只处理目标 tab 的主框架导航
        if (details.tabId === tabId && details.frameId === 0 && !injected) {
          injected = true
          chrome.webNavigation.onCommitted.removeListener(onCommittedListener)
          console.log("[Peaks Login] onCommitted fired, injecting tokens immediately...")
          
          // 立即注入 token（此时页面 JS 还未执行）
          try {
            await injectTokensToPage(tabId, tokens, false)
            console.log("[Peaks Login] Early injection successful")
          } catch (error) {
            console.error("[Peaks Login] Early injection failed:", error)
          }
          resolve()
        }
      }
      
      chrome.webNavigation.onCommitted.addListener(onCommittedListener)
      
      // 超时保护
      setTimeout(() => {
        if (!injected) {
          chrome.webNavigation.onCommitted.removeListener(onCommittedListener)
          console.log("[Peaks Login] Timeout waiting for onCommitted")
          resolve()
        }
      }, 10000)
    })
  }

  if (isOnTargetPage) {
    // 已经在目标页面，需要刷新并在页面加载时注入
    console.log("[Peaks Login] Already on target page, will refresh and inject early...")
    console.log("[Peaks Login] Current URL:", currentUrl)
    
    // 先设置监听器
    const injectPromise = injectOnCommitted()
    
    // 然后刷新页面
    console.log("[Peaks Login] Reloading page...")
    await chrome.tabs.reload(tabId)
    
    // 等待注入完成
    await injectPromise
    
    console.log("[Peaks Login] Token injection after reload completed")
  } else {
    // 需要导航到目标页面
    console.log("[Peaks Login] Current URL:", currentUrl)
    console.log("[Peaks Login] Navigating to:", trimmedUrl)
    
    // 先设置监听器
    const injectPromise = injectOnCommitted()
    
    // 然后导航
    await chrome.tabs.update(tabId, { url: trimmedUrl })
    
    // 等待注入完成
    await injectPromise
  }
  
  console.log("[Peaks Login] Token injection completed successfully")
}

// 安全地发送响应，避免消息通道关闭时报错
function safeSendResponse(sendResponse: (response: unknown) => void, response: unknown): void {
  try {
    sendResponse(response)
  } catch (error) {
    // 消息通道可能已关闭（页面导航、bfcache等），忽略错误
    console.log("[Peaks Login] sendResponse failed (channel closed):", error)
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Peaks Login] Background received message:", message.type, "from sender:", sender.tab?.id)
  
  if (message.type === "LOGIN_REQUEST") {
    handleLoginRequest(message.data as LoginRequestData, sender)
      .then((result) => safeSendResponse(sendResponse, result))
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        safeSendResponse(sendResponse, { success: false, error: errorMessage })
      })
    return true
  }
  
  if (message.type === "EXECUTE_INJECTION") {
    console.log("[Peaks Login] EXECUTE_INJECTION received, sender.tab:", sender.tab)
    const tabId = sender.tab?.id
    if (tabId && message.data) {
      console.log("[Peaks Login] Will inject to tab:", tabId)
      const tokenData = message.data as TokenData
      injectTokensToPage(tabId, tokenData.tokens, false)
        .then(() => {
          console.log("[Peaks Login] Injection successful")
          safeSendResponse(sendResponse, { success: true })
        })
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          console.error("[Peaks Login] Injection failed:", errorMessage)
          safeSendResponse(sendResponse, { success: false, error: errorMessage })
        })
      return true
    } else {
      console.error("[Peaks Login] EXECUTE_INJECTION missing tabId or data. tabId:", tabId, "data:", message.data)
      safeSendResponse(sendResponse, { success: false, error: "Missing tabId or data" })
    }
  }
})

async function handleLoginRequest(
  data: LoginRequestData,
  sender: chrome.runtime.MessageSender
): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAppSettings()
    const casConfig = settings.casConfigs.find((cas) => cas.id === data.casId)
    
    if (!casConfig) {
      throw new Error("CAS configuration not found")
    }
    
    const password = await getDecryptedPassword(data.accountId)
    
    const usernameField = casConfig.usernameField || "email"
    const passwordField = casConfig.passwordField || "password"
    
    const loginResponse = await performCasLogin(
      casConfig.url,
      data.username,
      password,
      usernameField,
      passwordField
    )

    const casResponses: Map<string, CasLoginResponse> = new Map()
    casResponses.set(data.casId, loginResponse)

    const uniqueCasIds = new Set(Object.values(data.tokenKeyMappings))
    for (const casId of uniqueCasIds) {
      if (!casResponses.has(casId)) {
        const otherCasConfig = settings.casConfigs.find((cas: CasConfig) => cas.id === casId)
        if (otherCasConfig) {
          const otherResponse = await performCasLogin(
            otherCasConfig.url,
            data.username,
            password,
            otherCasConfig.usernameField || "email",
            otherCasConfig.passwordField || "password"
          )
          casResponses.set(casId, otherResponse)
        }
      }
    }

    const tokens: Record<string, string> = {}
    
    for (const [tokenKey, casId] of Object.entries(data.tokenKeyMappings)) {
      const targetCasConfig = settings.casConfigs.find((cas: CasConfig) => cas.id === casId)
      const response = casResponses.get(casId)
      
      if (targetCasConfig && response) {
        const tokenResponseKey = targetCasConfig.tokenResponseKey || "token"
        const tokenValue = extractTokenFromResponse(response, tokenResponseKey)
        
        if (tokenValue) {
          tokens[tokenKey] = tokenValue
          console.log(`Mapped token: ${tokenKey} <- ${tokenResponseKey} = ${tokenValue.substring(0, 20)}...`)
        }
      }
    }

    if (Object.keys(tokens).length === 0) {
      const tokenResponseKey = casConfig.tokenResponseKey || "token"
      const tokenValue = extractTokenFromResponse(loginResponse, tokenResponseKey)
      if (tokenValue) {
        tokens["token"] = tokenValue
      }
    }

    const tokenData: TokenData = {
      tokens,
      callbackUrl: data.callbackUrl,
    }

    // 优先从 sender 获取 tab，否则查询当前活动 tab
    let tabId: number | undefined = sender.tab?.id
    
    if (!tabId) {
      // 从 popup 发送消息时 sender.tab 为 undefined
      // 使用 lastFocusedWindow 而不是 currentWindow 来确保获取正确的 tab
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      tabId = tabs[0]?.id
      console.log("[Peaks Login] No sender.tab, queried active tab:", tabId, "URL:", tabs[0]?.url)
    }
    
    if (tabId) {
      await navigateAndInjectTokens(tabId, tokenData)
    } else {
      throw new Error("Cannot find active tab to inject tokens")
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}

// ==================== CORS 规则管理 ====================

const CORS_RULE_ID_BASE = 1000 // CORS 规则 ID 起始值

/**
 * 从 URL 中提取域名，用于生成规则的 urlFilter
 */
function extractDomainPattern(url: string): string | null {
  try {
    const urlObj = new URL(url)
    // 返回完整的 origin + pathname 的基础部分
    return `${urlObj.origin}/*`
  } catch {
    console.error("[Peaks Login] Invalid URL for CORS rule:", url)
    return null
  }
}

/**
 * 根据配置更新 CORS 规则
 */
async function updateCorsRules(): Promise<void> {
  console.log("[Peaks Login] Updating CORS rules...")
  
  try {
    const settings = await getAppSettings()
    const corsEnabledCallbacks = settings.callbackConfigs.filter(
      (callback: CallbackConfig) => callback.enableCors
    )
    
    // 获取现有的动态规则
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
    const existingCorsRuleIds = existingRules
      .filter(rule => rule.id >= CORS_RULE_ID_BASE && rule.id < CORS_RULE_ID_BASE + 1000)
      .map(rule => rule.id)
    
    // 构建新的规则
    const newRules: chrome.declarativeNetRequest.Rule[] = []
    
    corsEnabledCallbacks.forEach((callback: CallbackConfig, index: number) => {
      const urlPattern = extractDomainPattern(callback.url)
      if (!urlPattern) return
      
      const ruleId = CORS_RULE_ID_BASE + index
      
      // 添加响应头修改规则
      newRules.push({
        id: ruleId,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          responseHeaders: [
            {
              header: "Access-Control-Allow-Origin",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "*"
            },
            {
              header: "Access-Control-Allow-Methods",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "GET, POST, PUT, DELETE, PATCH, OPTIONS"
            },
            {
              header: "Access-Control-Allow-Headers",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "Content-Type, Authorization, X-Requested-With"
            },
            {
              header: "Access-Control-Allow-Credentials",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "true"
            }
          ]
        },
        condition: {
          urlFilter: urlPattern,
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST
          ]
        }
      })
      
      console.log(`[Peaks Login] Added CORS rule for: ${callback.name} (${urlPattern})`)
    })
    
    // 更新规则：先移除旧规则，再添加新规则
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingCorsRuleIds,
      addRules: newRules
    })
    
    console.log(`[Peaks Login] CORS rules updated: removed ${existingCorsRuleIds.length}, added ${newRules.length}`)
  } catch (error) {
    console.error("[Peaks Login] Failed to update CORS rules:", error)
  }
}

// 监听来自 options 页面的 CORS 规则更新请求
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UPDATE_CORS_RULES") {
    console.log("[Peaks Login] Received UPDATE_CORS_RULES request")
    updateCorsRules()
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        sendResponse({ success: false, error: errorMessage })
      })
    return true
  }
})

// 监听存储变化，自动更新 CORS 规则
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.appSettings) {
    console.log("[Peaks Login] Settings changed, updating CORS rules...")
    updateCorsRules().catch((error) => {
      console.error("[Peaks Login] Failed to update CORS rules on storage change:", error)
    })
  }
})

// 扩展启动时初始化 CORS 规则
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Peaks Login] Extension installed/updated, initializing CORS rules...")
  updateCorsRules().catch((error) => {
    console.error("[Peaks Login] Failed to initialize CORS rules:", error)
  })
})

// 扩展启动时也检查 CORS 规则
updateCorsRules().catch((error) => {
  console.error("[Peaks Login] Failed to update CORS rules on startup:", error)
})
