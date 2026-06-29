import { useCallback, useEffect, useState } from "react"

import { getCombos, setCombos as persist } from "~/lib/storage"
import type { LoginCombo } from "~/types"

export interface UseCombosResult {
  combos: LoginCombo[]
  loading: boolean
  error: string | null
  upsert: (combo: LoginCombo) => Promise<void>
  remove: (id: string) => Promise<void>
  touch: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

/**
 * 读 + 写 combos 的 hook。返回:
 * - combos: 实时数据
 * - upsert: 新增或更新(按 id 匹配)
 * - remove: 删除
 * - touch: 标记最近使用(lastUsedAt = now)
 * - refresh: 强制从 storage 重读
 * 同时订阅 chrome.storage.onChanged 实现跨页面同步。
 */
export function useCombos(): UseCombosResult {
  const [combos, setLocal] = useState<LoginCombo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await getCombos()
      setLocal(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const handler = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area === "local" && changes.appSettings) {
        const next = (
          changes.appSettings.newValue as { combos?: LoginCombo[] } | undefined
        )?.combos
        if (Array.isArray(next)) {
          setLocal(next)
        }
      }
    }
    chrome.storage.onChanged.addListener(handler)
    return () => chrome.storage.onChanged.removeListener(handler)
  }, [])

  const upsert = useCallback(
    async (combo: LoginCombo) => {
      const next = combos.some((c) => c.id === combo.id)
        ? combos.map((c) => (c.id === combo.id ? combo : c))
        : [...combos, combo]
      setLocal(next)
      await persist(next)
    },
    [combos]
  )

  const remove = useCallback(
    async (id: string) => {
      const next = combos.filter((c) => c.id !== id)
      setLocal(next)
      await persist(next)
    },
    [combos]
  )

  const touch = useCallback(
    async (id: string) => {
      const now = Date.now()
      const next = combos.map((c) =>
        c.id === id ? { ...c, lastUsedAt: now, updatedAt: now } : c
      )
      setLocal(next)
      await persist(next)
    },
    [combos]
  )

  return { combos, loading, error, upsert, remove, touch, refresh }
}
