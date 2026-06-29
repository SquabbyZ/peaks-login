import type { Language } from "~/lib/i18n/translations"
import type { AppSettings, LoginCombo, PopupState } from "~/types"

const DEFAULT_SETTINGS: AppSettings = {
  casConfigs: [],
  callbackConfigs: [],
  accounts: [],
  combos: []
}

const DEFAULT_POPUP_STATE: PopupState = {
  selectedCasId: null,
  selectedAccountId: null,
  selectedCallbackId: null
}

const DEFAULT_LANGUAGE: Language = "zh"

export interface MigrateResult {
  /** 本次启动是否实际写入了新 combo (升级成功) */
  migrated: boolean
  /** 新生成的 combo id (仅当 migrated=true) */
  comboId?: string
}

export async function getAppSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get("appSettings")
  // 防呆: storage 中若存在 appSettings 但缺少 combos,补默认空数组 — 防止下游误覆盖丢失
  if (result.appSettings && result.appSettings.combos === undefined) {
    return { ...DEFAULT_SETTINGS, ...result.appSettings, combos: [] }
  }
  return result.appSettings ?? DEFAULT_SETTINGS
}

export async function setAppSettings(settings: AppSettings): Promise<void> {
  // 安全网: 即使 caller 漏传 combos,我们也保证 storage 里有这个字段,
  // 防止任何后续 getAppSettings().combos ?? [] 之外的访问意外丢失。
  await chrome.storage.local.set({
    appSettings: { ...settings, combos: settings.combos ?? [] }
  })
}

export async function getCombos(): Promise<LoginCombo[]> {
  const settings = await getAppSettings()
  return settings.combos ?? []
}

export async function setCombos(combos: LoginCombo[]): Promise<void> {
  const settings = await getAppSettings()
  await setAppSettings({ ...settings, combos })
}

export async function getPopupState(): Promise<PopupState> {
  const result = await chrome.storage.local.get("popupState")
  return result.popupState ?? DEFAULT_POPUP_STATE
}

export async function setPopupState(state: PopupState): Promise<void> {
  await chrome.storage.local.set({ popupState: state })
}

export async function getMasterKey(): Promise<string | undefined> {
  const result = await chrome.storage.local.get("masterKey")
  return result.masterKey
}

export async function setMasterKey(key: string): Promise<void> {
  await chrome.storage.local.set({ masterKey: key })
}

export async function getLanguage(): Promise<Language> {
  const result = await chrome.storage.local.get("language")
  return result.language ?? DEFAULT_LANGUAGE
}

export async function setLanguage(language: Language): Promise<void> {
  await chrome.storage.local.set({ language })
}

/**
 * v1.0 → v1.1+ 升级迁移: 把老用户的 popupState (selectedCasId/Account/CallbackId +
 * tokenKeyMappings) 包成一个名为"我的常用"的 LoginCombo, 写入 appSettings.combos。
 *
 * 安全特性:
 * - idempotent: 设置 migratedAt 后第二次调用直接返回 migrated=false
 * - 防御: 若 casId/accountId/callbackId 任意一个不存在于当前 configs 中,放弃迁移
 *   (失败路径也写 migratedAt,避免每次启动都重跑)
 */
export async function migrateLegacyPopupState(): Promise<MigrateResult> {
  const settings = await getAppSettings()

  // 已经迁移过 (或用户从未使用过老 workflow) → 直接返回
  if (typeof settings.migratedAt === "number") {
    return { migrated: false }
  }

  const popup = await getPopupState()
  const { selectedCasId, selectedAccountId, selectedCallbackId } = popup

  if (!selectedCasId || !selectedAccountId || !selectedCallbackId) {
    // 老用户但没凑齐三个 ID — 标记跳过, 后续不再尝试
    await setAppSettings({ ...settings, migratedAt: Date.now() })
    return { migrated: false }
  }

  const casExists = settings.casConfigs.some((c) => c.id === selectedCasId)
  const accountExists = settings.accounts.some(
    (a) => a.id === selectedAccountId
  )
  const callbackExists = settings.callbackConfigs.some(
    (c) => c.id === selectedCallbackId
  )
  if (!casExists || !accountExists || !callbackExists) {
    await setAppSettings({ ...settings, migratedAt: Date.now() })
    return { migrated: false }
  }

  const now = Date.now()
  const combo: LoginCombo = {
    id: generateId(),
    name: "我的常用",
    casId: selectedCasId,
    accountId: selectedAccountId,
    callbackId: selectedCallbackId,
    tokenKeyMappings: popup.tokenKeyMappings,
    createdAt: now,
    updatedAt: now
  }
  const existingCombos = settings.combos ?? []
  await setAppSettings({
    ...settings,
    combos: [...existingCombos, combo],
    migratedAt: now
  })
  return { migrated: true, comboId: combo.id }
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function createTimestamp(): number {
  return Date.now()
}
