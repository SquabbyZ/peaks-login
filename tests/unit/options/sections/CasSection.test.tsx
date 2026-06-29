import { cleanup, render, screen } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "~/components/ui/tooltip"
import { CasSection } from "~/options/sections/CasSection"
import type { CasConfig } from "~/types"

vi.mock("~/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }))

beforeEach(() => {
  vi.clearAllMocks()
})
afterEach(() => {
  cleanup()
})

const casConfigs: CasConfig[] = [
  {
    id: "c1",
    name: "Dev CAS",
    url: "https://cas.example.com/login",
    usernameField: "email",
    passwordField: "password",
    tokenResponseKey: "token",
    createdAt: 1,
    updatedAt: 1
  }
]

const noop = () => {}
const baseProps = {
  configs: casConfigs,
  t: (k: string) => k,
  onAdd: noop,
  onEdit: noop,
  onDelete: noop,
  onCopy: noop,
  onExport: noop,
  onImport: noop,
  copiedId: null,
  tags: []
}

describe("CasSection table scroll wrapper", () => {
  it("wraps the table in a scroll container with max-h-[60vh] and overflow-y-auto", () => {
    render(
      <TooltipProvider>
        <CasSection {...baseProps} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("cas-table-scroll")
    expect(scroll).toBeTruthy()
    expect(scroll.className).toContain("max-h-[60vh]")
    expect(scroll.className).toContain("overflow-y-auto")
    expect(scroll.className).toContain("mb-4")
  })

  it("renders sticky top-0 z-10 bg-card on every TableHead cell inside the scroll container", () => {
    render(
      <TooltipProvider>
        <CasSection {...baseProps} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("cas-table-scroll")
    const ths = scroll.querySelectorAll("thead th")
    expect(ths.length).toBeGreaterThan(0)
    ths.forEach((th) => {
      // sticky on <th> is required because collapsed-border tables disable
      // position:sticky on <thead>. We use border-collapse: separate on the
      // table so the per-cell sticky takes effect.
      expect(th.className).toContain("sticky")
      expect(th.className).toContain("top-0")
      // z-index 必须属于 sticky 层: z-10 普通 / z-20 左/右角
      expect(/\bz-(?:10|20)\b/.test(th.className)).toBe(true)
      expect(th.className).toContain("bg-card")
    })
    // The table itself must use border-separate so sticky <th> works.
    const table = scroll.querySelector("table")
    expect(table!.className).toContain("border-separate")
    expect(table!.className).toContain("border-spacing-0")
  })
})
