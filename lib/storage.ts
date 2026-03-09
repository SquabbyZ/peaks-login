import type { AppSettings, PopupState } from "~/types"
import type { Language } from "~/lib/i18n/translations"

const DEFAULT_SETTINGS: AppSettings = {
  casConfigs: [],
  callbackConfigs: [],
  accounts: [],
}

const DEFAULT_POPUP_STATE: PopupState = {
  selectedCasId: null,
  selectedAccountId: null,
  selectedCallbackId: null,
}

const DEFAULT_LANGUAGE: Language = "en"

export async function getAppSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get("appSettings")
  return result.appSettings ?? DEFAULT_SETTINGS
}

export async function setAppSettings(settings: AppSettings): Promise<void> {
  await chrome.storage.local.set({ appSettings: settings })
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

export function generateId(): string {
  return crypto.randomUUID()
}

export function createTimestamp(): number {
  return Date.now()
}
