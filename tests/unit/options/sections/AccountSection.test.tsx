import { cleanup, render, screen } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "~/components/ui/tooltip"
import { AccountSection } from "~/options/sections/AccountSection"
import type { AccountConfig } from "~/types"

vi.mock("~/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }))

beforeEach(() => {
  vi.clearAllMocks()
})
afterEach(() => {
  cleanup()
})

const accounts: AccountConfig[] = [
  {
    id: "a1",
    name: "Dev Account",
    username: "user@example.com",
    encryptedPassword: "{}",
    createdAt: 1,
    updatedAt: 1
  }
]

const noop = () => {}
const baseProps = {
  accounts,
  t: (k: string) => k,
  onAdd: noop,
  onEdit: noop,
  onDelete: noop,
  onCopy: noop,
  copiedId: null,
  masterKey: ""
}

describe("AccountSection table scroll wrapper", () => {
  it("wraps the table in a scroll container with max-h-[60vh] and overflow-y-auto", () => {
    render(
      <TooltipProvider>
        <AccountSection {...baseProps} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("account-table-scroll")
    expect(scroll).toBeTruthy()
    expect(scroll.className).toContain("max-h-[60vh]")
    expect(scroll.className).toContain("overflow-y-auto")
    expect(scroll.className).toContain("mb-4")
  })

  it("renders sticky top-0 z-10 bg-card on every TableHead cell inside the scroll container", () => {
    render(
      <TooltipProvider>
        <AccountSection {...baseProps} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("account-table-scroll")
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
