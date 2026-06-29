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
        tagId: "tag-test",
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
  ],
  tags: [
    {
      id: "tag-test",
      name: "测试",
      color: "purple",
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
      // z-index must be sticky-tier: z-10 (regular) or z-20 (left/right corner)
      expect(/\bz-(?:10|20)\b/.test(th.className)).toBe(true)
      expect(th.className).toContain("bg-card")
    })
    const table = scroll.querySelector("table")
    expect(table!.className).toContain("border-separate")
    expect(table!.className).toContain("border-spacing-0")
  })

  it("pins first column (left) and last column (right) on TableHead with sticky", () => {
    render(
      <TooltipProvider>
        <CombosSection settings={settings} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("combos-table-scroll")
    const ths = scroll.querySelectorAll("thead th")
    expect(ths.length).toBeGreaterThan(1)
    const firstTh = ths[0]
    const lastTh = ths[ths.length - 1]
    expect(firstTh.className).toContain("left-0")
    expect(lastTh.className).toContain("right-0")
  })

  it("pins first column (left) and last column (right) on TableCell with sticky + bg-card", () => {
    render(
      <TooltipProvider>
        <CombosSection settings={settings} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("combos-table-scroll")
    const rows = scroll.querySelectorAll("tbody tr")
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach((row) => {
      const tds = row.querySelectorAll("td")
      const firstTd = tds[0]
      const lastTd = tds[tds.length - 1]
      expect(firstTd.className).toContain("sticky")
      expect(firstTd.className).toContain("left-0")
      expect(firstTd.className).toContain("bg-card")
      expect(lastTd.className).toContain("sticky")
      expect(lastTd.className).toContain("right-0")
      expect(lastTd.className).toContain("bg-card")
    })
  })

  it("uses min-width on the inner table so horizontal scroll is always triggerable", () => {
    render(
      <TooltipProvider>
        <CombosSection settings={settings} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("combos-table-scroll")
    const table = scroll.querySelector("table")!
    const hasMinWidthClass = /\bmin-w-\[?\d+(?:px|rem)?\]?/.test(
      table.className
    )
    expect(hasMinWidthClass).toBe(true)
  })

  it("renders the tag inside the name cell as a horizontal inline element (no per-character wrap)", () => {
    const settingsWithTags: AppSettings = {
      ...settings,
      tags: [
        {
          id: "tag-test",
          name: "测试",
          color: "purple",
          createdAt: 1,
          updatedAt: 1
        }
      ]
    }
    render(
      <TooltipProvider>
        <CombosSection settings={settingsWithTags} />
      </TooltipProvider>
    )
    const row = screen.getByTestId("combos-row-combo-1")
    const firstTd = row.querySelector("td")!
    expect(firstTd.textContent).toContain("测试")
    const titleSpan = firstTd.querySelector("span[title='测试']")
    expect(titleSpan).toBeTruthy()
    const wrapper = titleSpan?.parentElement
    expect(wrapper).toBeTruthy()
    expect(wrapper!.className.includes("flex-wrap")).toBe(false)
  })
})
