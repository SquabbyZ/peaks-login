import { cleanup, render, screen } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "~/components/ui/tooltip"
import { CombosSection } from "~/options/sections/CombosSection"
import type { AppSettings, LoginCombo } from "~/types"

vi.mock("~/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }))

const mockUpsert = vi.fn(async () => {})
const mockRemove = vi.fn(async () => {})

vi.mock("~/lib/useCombos", () => ({
  useCombos: () => ({
    combos: [
      {
        id: "combo-1",
        name: "Dev combo",
        casId: "c1",
        accountId: "a1",
        callbackId: "cb1",
        pinned: false,
        createdAt: 1,
        updatedAt: 1
      },
      {
        id: "combo-2",
        name: "Prod combo",
        casId: "c1",
        accountId: "a1",
        callbackId: "cb1",
        pinned: true,
        createdAt: 2,
        updatedAt: 2
      }
    ] as LoginCombo[],
    loading: false,
    error: null,
    upsert: mockUpsert,
    remove: mockRemove,
    touch: vi.fn(async () => {}),
    refresh: vi.fn(async () => {})
  })
}))

beforeEach(() => {
  vi.clearAllMocks()
})
afterEach(() => {
  cleanup()
})

const settings: AppSettings = {
  casConfigs: [
    {
      id: "c1",
      name: "Dev CAS",
      url: "https://cas.example.com",
      createdAt: 1,
      updatedAt: 1
    }
  ],
  callbackConfigs: [
    {
      id: "cb1",
      name: "Callback",
      url: "https://app.example.com",
      createdAt: 1,
      updatedAt: 1
    }
  ],
  accounts: [
    {
      id: "a1",
      name: "Dev",
      username: "dev",
      encryptedPassword: "{}",
      createdAt: 1,
      updatedAt: 1
    }
  ]
}

describe("CombosSection table scroll wrapper", () => {
  it("wraps the table in a scroll container with max-h-[60vh] and overflow-y-auto", () => {
    render(
      <TooltipProvider>
        <CombosSection settings={settings} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("combos-table-scroll")
    expect(scroll).toBeTruthy()
    expect(scroll.className).toContain("max-h-[60vh]")
    expect(scroll.className).toContain("overflow-y-auto")
    expect(scroll.className).toContain("mb-4")
  })

  it("renders sticky top-0 z-10 bg-card on every TableHead cell inside the scroll container", () => {
    render(
      <TooltipProvider>
        <CombosSection settings={settings} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("combos-table-scroll")
    const ths = scroll.querySelectorAll("thead th")
    expect(ths.length).toBeGreaterThan(0)
    ths.forEach((th) => {
      expect(th.className).toContain("sticky")
      expect(th.className).toContain("top-0")
      expect(th.className).toContain("z-10")
      expect(th.className).toContain("bg-card")
    })
    const table = scroll.querySelector("table")
    expect(table!.className).toContain("border-separate")
    expect(table!.className).toContain("border-spacing-0")
  })
})
