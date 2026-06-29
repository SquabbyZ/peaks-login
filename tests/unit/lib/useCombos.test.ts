import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { setAppSettings } from "~/lib/storage"
import { useCombos } from "~/lib/useCombos"

import { resetChromeStorage } from "../../setup"

beforeEach(() => {
  resetChromeStorage()
})

describe("useCombos", () => {
  it("loads combos on mount", async () => {
    const now = Date.now()
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: [
        {
          id: "c1",
          name: "Dev",
          casId: "x",
          accountId: "y",
          callbackId: "z",
          createdAt: now,
          updatedAt: now
        }
      ]
    })
    const { result } = renderHook(() => useCombos())
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.combos).toHaveLength(1)
    expect(result.current.combos[0].name).toBe("Dev")
  })

  it("upsert adds a new combo", async () => {
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: []
    })
    const { result } = renderHook(() => useCombos())
    await act(async () => {
      await Promise.resolve()
    })
    await act(async () => {
      await result.current.upsert({
        id: "c1",
        name: "Test",
        casId: "x",
        accountId: "y",
        callbackId: "z",
        createdAt: 1,
        updatedAt: 1
      })
    })
    expect(result.current.combos).toHaveLength(1)
  })

  it("upsert updates existing combo by id", async () => {
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: []
    })
    const { result } = renderHook(() => useCombos())
    await act(async () => {
      await Promise.resolve()
    })
    await act(async () => {
      await result.current.upsert({
        id: "c1",
        name: "Old",
        casId: "x",
        accountId: "y",
        callbackId: "z",
        createdAt: 1,
        updatedAt: 1
      })
    })
    await act(async () => {
      await result.current.upsert({
        id: "c1",
        name: "New",
        casId: "x",
        accountId: "y",
        callbackId: "z",
        createdAt: 1,
        updatedAt: 2
      })
    })
    expect(result.current.combos).toHaveLength(1)
    expect(result.current.combos[0].name).toBe("New")
  })

  it("remove deletes by id", async () => {
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: []
    })
    const { result } = renderHook(() => useCombos())
    await act(async () => {
      await Promise.resolve()
    })
    await act(async () => {
      await result.current.upsert({
        id: "c1",
        name: "X",
        casId: "a",
        accountId: "b",
        callbackId: "c",
        createdAt: 1,
        updatedAt: 1
      })
      await result.current.upsert({
        id: "c2",
        name: "Y",
        casId: "a",
        accountId: "b",
        callbackId: "c",
        createdAt: 1,
        updatedAt: 1
      })
    })
    await act(async () => {
      await result.current.remove("c1")
    })
    expect(result.current.combos).toHaveLength(1)
    expect(result.current.combos[0].id).toBe("c2")
  })

  it("touch updates lastUsedAt", async () => {
    await setAppSettings({
      casConfigs: [],
      callbackConfigs: [],
      accounts: [],
      combos: []
    })
    const { result } = renderHook(() => useCombos())
    await act(async () => {
      await Promise.resolve()
    })
    await act(async () => {
      await result.current.upsert({
        id: "c1",
        name: "X",
        casId: "a",
        accountId: "b",
        callbackId: "c",
        createdAt: 1,
        updatedAt: 1
      })
    })
    const before = Date.now()
    await act(async () => {
      await result.current.touch("c1")
    })
    const after = Date.now()
    const touched = result.current.combos.find((c) => c.id === "c1")
    expect(touched?.lastUsedAt).toBeGreaterThanOrEqual(before)
    expect(touched?.lastUsedAt).toBeLessThanOrEqual(after)
  })
})
