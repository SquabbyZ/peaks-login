import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import PopupIndex from "~/popup/index"
import type { LoginCombo } from "~/types"

const mockCombos: LoginCombo[] = [
  {
    id: "combo-pinned",
    name: "Pinned combo",
    casId: "cas-1",
    accountId: "acc-1",
    callbackId: "cb-1",
    pinned: true,
    lastUsedAt: 1000,
    createdAt: 1,
    updatedAt: 1
  },
  {
    id: "combo-recent",
    name: "Recent combo",
    casId: "cas-1",
    accountId: "acc-1",
    callbackId: "cb-1",
    lastUsedAt: 2000,
    createdAt: 2,
    updatedAt: 2
  },
  {
    id: "combo-old",
    name: "Old combo",
    casId: "cas-1",
    accountId: "acc-1",
    callbackId: "cb-1",
    lastUsedAt: 500,
    createdAt: 3,
    updatedAt: 3
  }
]

const mockTouch = vi.fn(async () => {})
const mockUpsert = vi.fn(async () => {})
const mockRemove = vi.fn(async () => {})

let returnCombos: LoginCombo[] = mockCombos
let returnLoading = false

vi.mock("~/lib/useCombos", () => ({
  useCombos: () => ({
    combos: returnCombos,
    loading: returnLoading,
    error: null,
    upsert: mockUpsert,
    remove: mockRemove,
    touch: mockTouch,
    refresh: vi.fn(async () => {})
  })
}))

vi.mock("~/lib/storage", async () => {
  const actual =
    await vi.importActual<typeof import("~/lib/storage")>("~/lib/storage")
  return {
    ...actual,
    getAppSettings: async () => ({
      casConfigs: [
        {
          id: "cas-1",
          name: "Dev CAS",
          url: "https://cas.example.com",
          createdAt: 1,
          updatedAt: 1
        }
      ],
      callbackConfigs: [
        {
          id: "cb-1",
          name: "App",
          url: "https://app.example.com",
          createdAt: 1,
          updatedAt: 1
        }
      ],
      accounts: [
        {
          id: "acc-1",
          name: "Dev",
          username: "dev",
          encryptedPassword: "{}",
          createdAt: 1,
          updatedAt: 1
        }
      ]
    })
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  returnCombos = mockCombos
  returnLoading = false
})
afterEach(() => {
  cleanup()
})

describe("PopupIndex — combo list + one-click login", () => {
  it("renders a button for every combo with the correct sort order (pinned first, then lastUsedAt desc)", async () => {
    render(<PopupIndex />)

    await waitFor(() => {
      expect(screen.getByTestId("combos-list")).toBeTruthy()
    })

    const buttons = screen.getAllByTestId(/^combo-button-/)
    expect(buttons).toHaveLength(3)
    expect(buttons[0].getAttribute("data-testid")).toBe(
      "combo-button-combo-pinned"
    )
    expect(buttons[1].getAttribute("data-testid")).toBe(
      "combo-button-combo-recent"
    )
    expect(buttons[2].getAttribute("data-testid")).toBe(
      "combo-button-combo-old"
    )
  })

  it("renders the Pin icon on pinned combo rows", async () => {
    render(<PopupIndex />)

    await waitFor(() => {
      expect(screen.getByTestId("combos-list")).toBeTruthy()
    })

    const pinnedRow = screen.getByTestId("combo-button-combo-pinned")
    expect(pinnedRow.querySelector('[aria-label="已置顶"]')).toBeTruthy()

    const recentRow = screen.getByTestId("combo-button-combo-recent")
    expect(recentRow.querySelector('[aria-label="已置顶"]')).toBeNull()
  })

  it("clicking a combo calls chrome.runtime.sendMessage with LOGIN_REQUEST and the right ids", async () => {
    const sendMessageSpy = vi
      .spyOn(chrome.runtime, "sendMessage")
      .mockResolvedValue({ success: true } as never)

    render(<PopupIndex />)

    const button = await waitFor(() =>
      screen.getByTestId("combo-button-combo-recent")
    )
    await userEvent.click(button)

    await waitFor(() => {
      expect(sendMessageSpy).toHaveBeenCalledTimes(1)
    })

    const arg = sendMessageSpy.mock.calls[0][0] as {
      type: string
      data: { casId: string; accountId: string; callbackId: string }
    }
    expect(arg.type).toBe("LOGIN_REQUEST")
    expect(arg.data.casId).toBe("cas-1")
    expect(arg.data.accountId).toBe("acc-1")
    expect(arg.data.callbackId).toBe("cb-1")
  })

  it("marks the clicked combo as touched after a successful login", async () => {
    vi.spyOn(chrome.runtime, "sendMessage").mockResolvedValue({
      success: true
    } as never)

    render(<PopupIndex />)

    const button = await waitFor(() =>
      screen.getByTestId("combo-button-combo-recent")
    )
    await userEvent.click(button)

    await waitFor(() => {
      expect(mockTouch).toHaveBeenCalledWith("combo-recent")
    })
  })

  it("shows the empty state with '还没有登录组合' and an '去选项页配置' button when there are no combos", async () => {
    const openOptionsSpy = vi
      .spyOn(chrome.runtime, "openOptionsPage")
      .mockImplementation(() => {})

    returnCombos = []

    render(<PopupIndex />)

    await waitFor(() => {
      expect(screen.getByText("还没有登录组合")).toBeTruthy()
    })

    const goButton = screen.getByRole("button", { name: /去选项页配置/ })
    await userEvent.click(goButton)

    expect(openOptionsSpy).toHaveBeenCalled()
  })

  it("calls chrome.runtime.openOptionsPage when the settings icon button is clicked", async () => {
    const openOptionsSpy = vi
      .spyOn(chrome.runtime, "openOptionsPage")
      .mockImplementation(() => {})

    render(<PopupIndex />)

    await waitFor(() => {
      expect(screen.getByTestId("combos-list")).toBeTruthy()
    })

    const settingsButtons = screen.getAllByRole("button", {
      name: /openSettings|Open Settings|open settings|打开设置/i
    })
    expect(settingsButtons.length).toBeGreaterThan(0)
    await userEvent.click(settingsButtons[0])
    expect(openOptionsSpy).toHaveBeenCalled()
  })
})
