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

import { resetChromeStorage } from "../setup"

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
})
