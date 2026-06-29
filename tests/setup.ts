// Minimal chrome.* API mock for vitest.
// 仅覆盖 storage.local get/set/onChanged — 本 slice 只需该面。

const data: Record<string, unknown> = {}
const listeners: Array<
  (changes: Record<string, chrome.storage.StorageChange>, area: string) => void
> = []

const chromeMock = {
  storage: {
    local: {
      get: async (keys: string | string[] | Record<string, unknown> | null) => {
        if (keys === null || keys === undefined) return { ...data }
        if (typeof keys === "string") return { [keys]: data[keys] }
        if (Array.isArray(keys)) {
          const out: Record<string, unknown> = {}
          for (const k of keys) out[k] = data[k]
          return out
        }
        const out: Record<string, unknown> = { ...keys }
        for (const k of Object.keys(keys)) {
          if (data[k] !== undefined) out[k] = data[k]
        }
        return out
      },
      set: async (items: Record<string, unknown>) => {
        const changes: Record<string, chrome.storage.StorageChange> = {}
        for (const [k, v] of Object.entries(items)) {
          changes[k] = { oldValue: data[k], newValue: v }
          data[k] = v
        }
        for (const fn of listeners) fn(changes, "local")
      }
    },
    onChanged: {
      addListener: (
        fn: (
          changes: Record<string, chrome.storage.StorageChange>,
          area: string
        ) => void
      ) => {
        listeners.push(fn)
      },
      removeListener: (
        fn: (
          changes: Record<string, chrome.storage.StorageChange>,
          area: string
        ) => void
      ) => {
        const idx = listeners.indexOf(fn)
        if (idx >= 0) listeners.splice(idx, 1)
      }
    }
  },
  runtime: {
    id: "test-runtime",
    sendMessage: async (_msg: unknown) => ({ success: true }),
    openOptionsPage: () => {}
  }
}

;(globalThis as unknown as { chrome: typeof chromeMock }).chrome = chromeMock

export function resetChromeStorage() {
  for (const k of Object.keys(data)) delete data[k]
  listeners.length = 0
}
