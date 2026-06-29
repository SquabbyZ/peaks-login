import { cleanup, render, screen } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "~/components/ui/tooltip"
import { CallbackSection } from "~/options/sections/CallbackSection"
import type { CallbackConfig } from "~/types"

vi.mock("~/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }))

beforeEach(() => {
  vi.clearAllMocks()
})
afterEach(() => {
  cleanup()
})

const callbackConfigs: CallbackConfig[] = [
  {
    id: "b1",
    name: "Dev Callback",
    url: "https://cb.example.com/auth",
    tokenKeys: ["accessToken", "refreshToken"],
    enableCors: true,
    createdAt: 1,
    updatedAt: 1
  }
]

const noop = () => {}
const baseProps = {
  configs: callbackConfigs,
  t: (k: string) => k,
  onAdd: noop,
  onEdit: noop,
  onDelete: noop,
  onCopy: noop,
  onExport: noop,
  onImport: noop,
  copiedId: null
}

describe("CallbackSection table scroll wrapper", () => {
  it("wraps the table in a scroll container with max-h-[60vh] and overflow-y-auto", () => {
    render(
      <TooltipProvider>
        <CallbackSection {...baseProps} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("callback-table-scroll")
    expect(scroll).toBeTruthy()
    expect(scroll.className).toContain("max-h-[60vh]")
    expect(scroll.className).toContain("overflow-y-auto")
    expect(scroll.className).toContain("mb-4")
  })

  it("renders sticky top-0 z-10 bg-card on every TableHead cell inside the scroll container", () => {
    render(
      <TooltipProvider>
        <CallbackSection {...baseProps} />
      </TooltipProvider>
    )
    const scroll = screen.getByTestId("callback-table-scroll")
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
