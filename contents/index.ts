import type { PlasmoCSConfig } from "plasmo"
import type { TokenData } from "~/types"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start"
}

interface InjectMessage {
  type: "INJECT_TOKENS"
  data: TokenData
}

console.log("[Peaks Login] Content script loaded at document_start, URL:", window.location.href)

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message: InjectMessage, sender, sendResponse) => {
  console.log("[Peaks Login] Content script received message:", message.type)
  
  if (message.type === "INJECT_TOKENS" && message.data) {
    console.log("[Peaks Login] INJECT_TOKENS received, requesting background to execute injection...")
    
    // 请求 background 使用 chrome.scripting.executeScript 注入到 MAIN world
    chrome.runtime.sendMessage({
      type: "EXECUTE_INJECTION",
      data: message.data,
    })
      .then((response) => {
        console.log("[Peaks Login] EXECUTE_INJECTION response:", response)
        sendResponse(response)
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error("[Peaks Login] EXECUTE_INJECTION error:", errorMessage)
        sendResponse({ success: false, error: errorMessage })
      })
    
    return true // 保持消息通道开放
  }
  
  return false
})

export {}
