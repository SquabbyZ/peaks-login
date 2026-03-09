import type { PlasmoCSConfig } from "plasmo"
import type { TokenData } from "~/types"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start",
  world: "MAIN" // 直接在 MAIN world 执行，可以访问页面的 localStorage
}

interface PendingInjection {
  tokens: Record<string, string>
  targetUrl: string
  timestamp: number
}

console.log("[Peaks Login] Content script loaded at document_start in MAIN world, URL:", window.location.href)

// 在 document_start 时立即检查是否有待注入的 token
async function checkAndInjectTokens() {
  try {
    // 从 storage 读取待注入的 token（需要通过 messaging 因为 MAIN world 无法直接访问 chrome.storage）
    // 但是我们可以使用 window.postMessage 和 ISOLATED world 的 content script 配合
    // 或者直接在这里注入，让 background 通过其他方式传递数据
    
    // 检查 URL 参数中是否有待注入的 token 标记
    const url = new URL(window.location.href)
    const peaksLoginData = url.searchParams.get('__peaks_login_inject__')
    
    if (peaksLoginData) {
      console.log("[Peaks Login] Found injection marker in URL")
      try {
        const data = JSON.parse(decodeURIComponent(peaksLoginData))
        if (data.tokens && typeof data.tokens === 'object') {
          console.log("[Peaks Login] Injecting tokens from URL marker...")
          for (const [key, value] of Object.entries(data.tokens)) {
            localStorage.setItem(key, value as string)
            console.log(`[Peaks Login] Set localStorage["${key}"]`)
          }
          
          // 移除 URL 参数并替换历史记录
          url.searchParams.delete('__peaks_login_inject__')
          window.history.replaceState({}, '', url.toString())
          console.log("[Peaks Login] Cleaned up URL marker")
        }
      } catch (e) {
        console.error("[Peaks Login] Failed to parse injection data:", e)
      }
    }
  } catch (error) {
    console.error("[Peaks Login] checkAndInjectTokens error:", error)
  }
}

// 立即执行
checkAndInjectTokens()

export {}
