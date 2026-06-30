import { beforeEach, describe, expect, it } from "vitest"

import {
  getAppSettings,
  getCombos,
  getPopupState,
  migrateLegacyPopupState,
  setAppSettings,
  setCombos,
  setPopupState
} from "~/lib/storage"

import { resetChromeStorage } from "../../setup"

beforeEach(() => {
  resetChromeStorage()
})

describe("migrateLegacyPopupState", () => {
  it("does nothing when migratedAt already set", async () => {
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: [],
      migratedAt: 1
    })
    const result = await migrateLegacyPopupState()
    expect(result.migrated).toBe(false)
    expect(result.comboId).toBeUndefined()
  })

  it("does nothing when popupState has missing IDs", async () => {
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: []
    })
    await setPopupState({
      selectedCasId: null,
      selectedAccountId: null,
      selectedCallbackId: null
    })
    const result = await migrateLegacyPopupState()
    expect(result.migrated).toBe(false)
  })

  it("does nothing when popupState IDs do not reference existing configs", async () => {
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: []
    })
    await setPopupState({
      selectedCasId: "ghost-cas",
      selectedAccountId: "ghost-acc",
      selectedCallbackId: "ghost-cb"
    })
    const result = await migrateLegacyPopupState()
    expect(result.migrated).toBe(false)
  })

  it("creates combo named 我的常用 when all three IDs match", async () => {
    const now = Date.now()
    await setAppSettings({
      casConfigs: [
        {
          id: "cas-1",
          name: "prod",
          url: "https://x",
          createdAt: now,
          updatedAt: now
        }
      ],
      callbackConfigs: [
        {
          id: "cb-1",
          name: "app",
          url: "https://app",
          createdAt: now,
          updatedAt: now
        }
      ],
      accounts: [
        {
          id: "acc-1",
          name: "admin",
          username: "u",
          encryptedPassword: "{}",
          createdAt: now,
          updatedAt: now
        }
      ],
      combos: []
    })
    await setPopupState({
      selectedCasId: "cas-1",
      selectedAccountId: "acc-1",
      selectedCallbackId: "cb-1",
      tokenKeyMappings: { "cb-1:accessToken": "cas-1" }
    })
    const result = await migrateLegacyPopupState()
    expect(result.migrated).toBe(true)
    expect(result.comboId).toBeDefined()
    const settings = await getAppSettings()
    expect(settings.combos).toHaveLength(1)
    expect(settings.combos[0].name).toBe("我的常用")
    expect(settings.combos[0].casId).toBe("cas-1")
    expect(settings.combos[0].tokenKeyMappings).toEqual({
      "cb-1:accessToken": "cas-1"
    })
    expect(settings.migratedAt).toBeTypeOf("number")
  })

  it("is idempotent: second call does not duplicate the combo", async () => {
    const now = Date.now()
    await setAppSettings({
      casConfigs: [
        {
          id: "cas-1",
          name: "prod",
          url: "https://x",
          createdAt: now,
          updatedAt: now
        }
      ],
      callbackConfigs: [
        {
          id: "cb-1",
          name: "app",
          url: "https://app",
          createdAt: now,
          updatedAt: now
        }
      ],
      accounts: [
        {
          id: "acc-1",
          name: "admin",
          username: "u",
          encryptedPassword: "{}",
          createdAt: now,
          updatedAt: now
        }
      ],
      combos: []
    })
    await setPopupState({
      selectedCasId: "cas-1",
      selectedAccountId: "acc-1",
      selectedCallbackId: "cb-1"
    })
    await migrateLegacyPopupState()
    const second = await migrateLegacyPopupState()
    expect(second.migrated).toBe(false)
    const settings = await getAppSettings()
    expect(settings.combos).toHaveLength(1)
  })

  it("stamps migratedAt even on failure path (no spam on every startup)", async () => {
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: []
    })
    await setPopupState({
      selectedCasId: "ghost",
      selectedAccountId: null,
      selectedCallbackId: null
    })
    await migrateLegacyPopupState()
    const settings = await getAppSettings()
    expect(settings.migratedAt).toBeTypeOf("number")
  })
})

describe("getCombos / setCombos", () => {
  it("returns empty array by default", async () => {
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: []
    })
    const combos = await getCombos()
    expect(combos).toEqual([])
  })

  it("setCombos persists and getCombos reads back", async () => {
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: []
    })
    const combo = {
      id: "c1",
      name: "Dev",
      casId: "cas-1",
      accountId: "acc-1",
      callbackId: "cb-1",
      createdAt: 1,
      updatedAt: 1
    }
    await setCombos([combo])
    const combos = await getCombos()
    expect(combos).toEqual([combo])
  })

  it("setAppSettings without combos field still persists empty combos (defensive)", async () => {
    // 模拟 caller 漏传 combos — storage 层必须兜底
    await chrome.storage.local.set({
      appSettings: {
        casConfigs: [],
        callbackConfigs: [],
        accounts: []
      }
    })
    await setAppSettings({
      casConfigs: [
        {
          id: "cas-1",
          name: "prod",
          url: "https://x",
          createdAt: 1,
          updatedAt: 1
        }
      ],
      callbackConfigs: [],
      accounts: []
      // 注意: combos 字段故意省略
    })
    const settings = await getAppSettings()
    expect(settings.combos).toEqual([])
    // 旧的 0 个 CAS 也没有被覆盖成 undefined
    expect(settings.casConfigs).toHaveLength(1)
  })

  it("regression: combos survive an unrelated field write when caller uses fresh-read-then-patch", async () => {
    // 场景:选项页里有两条独立的存储路径 —— useCombos 写 combos,options handler
    // 改 CAS/账号/回调/标签。之前的 bug 是 handler 用 stale React state (`...settings`)
    // 写 storage,把 combos 覆盖掉了。
    // 修复后:handler 在 updateSettings() 内调 `getAppSettings()` 拿真值再 patch。
    // 这条测试断言这条 fresh-read-then-patch 路径确实能保住 combos。
    const now = Date.now()
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: [
        {
          id: "c-A",
          name: "A",
          casId: "cas-1",
          accountId: "acc-1",
          callbackId: "cb-1",
          createdAt: now,
          updatedAt: now
        },
        {
          id: "c-B",
          name: "B",
          casId: "cas-1",
          accountId: "acc-1",
          callbackId: "cb-1",
          createdAt: now,
          updatedAt: now
        },
        {
          id: "c-C",
          name: "C",
          casId: "cas-1",
          accountId: "acc-1",
          callbackId: "cb-1",
          createdAt: now,
          updatedAt: now
        }
      ]
    })

    // 模拟修复后的 handler:每次写之前 fresh read
    const current = await getAppSettings()
    await setAppSettings({
      ...current,
      casConfigs: [
        {
          id: "cas-new",
          name: "prod",
          url: "https://x",
          createdAt: now,
          updatedAt: now
        }
      ]
    })

    const after = await getAppSettings()
    expect(after.combos).toHaveLength(3)
    expect(after.combos?.map((c) => c.id)).toEqual(["c-A", "c-B", "c-C"])
    expect(after.casConfigs).toHaveLength(1)
  })

  it("existing combos survive a migration run (regression: lost on upgrade)", async () => {
    // 用户场景: 已有 combos + migratedAt 已 stamp
    const now = Date.now()
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: [
        {
          id: "existing-combo",
          name: "我的常用",
          casId: "cas-1",
          accountId: "acc-1",
          callbackId: "cb-1",
          createdAt: now,
          updatedAt: now
        }
      ],
      migratedAt: now
    })
    // 模拟二次启动调一次 migration
    const result = await migrateLegacyPopupState()
    expect(result.migrated).toBe(false)
    const settings = await getAppSettings()
    expect(settings.combos).toHaveLength(1)
    expect(settings.combos?.[0].id).toBe("existing-combo")
  })

  it("getAppSettings fills missing combos from stored object instead of returning partial state", async () => {
    await chrome.storage.local.set({
      appSettings: {
        casConfigs: [],
        callbackConfigs: [],
        accounts: []
        // combos 故意漏掉
      }
    })
    const settings = await getAppSettings()
    expect(settings.combos).toEqual([])
  })
})
