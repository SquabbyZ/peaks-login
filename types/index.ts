export interface CasConfig {
  id: string
  name: string
  url: string
  usernameField?: string
  passwordField?: string
  tokenResponseKey?: string // 从 CAS 响应中获取 token 的 key
  createdAt: number
  updatedAt: number
}

export interface CallbackConfig {
  id: string
  name: string
  url: string
  tokenKeys?: string[] // 存储 token 到 localStorage 的多个 key
  enableCors?: boolean // 是否启用跨域支持
  createdAt: number
  updatedAt: number
}

export interface AccountConfig {
  id: string
  name: string
  username: string
  encryptedPassword: string
  createdAt: number
  updatedAt: number
}

export interface AppSettings {
  casConfigs: CasConfig[]
  callbackConfigs: CallbackConfig[]
  accounts: AccountConfig[]
  masterKey?: string
}

export interface PopupState {
  selectedCasId: string | null
  selectedAccountId: string | null
  selectedCallbackId: string | null
  // 存储回调 tokenKey 与 CAS tokenResponseKey 的映射关系
  // key: `${callbackId}:${tokenKey}`, value: casId (表示该回调的某个 tokenKey 对应哪个 CAS 的 tokenResponseKey)
  tokenKeyMappings?: Record<string, string>
}

export interface LoginRequest {
  casUrl: string
  username: string
  password: string
  callbackUrl: string
}

export interface LoginResponse {
  success: boolean
  consoleToken?: string
  refreshToken?: string
  error?: string
}

export interface TokenData {
  // 动态 token 映射: key 是 localStorage 的存储 key，value 是从 CAS 响应中提取的值
  tokens: Record<string, string>
  callbackUrl: string
}

export type StorageKey = "appSettings" | "popupState"

export interface MessagePayload {
  type: "LOGIN_REQUEST" | "INJECT_TOKENS" | "LOGIN_SUCCESS" | "LOGIN_ERROR"
  data: LoginRequest | TokenData | { error: string }
}

export interface ChromeMessage {
  payload: MessagePayload
}

export interface EncryptResult {
  encrypted: string
  iv: string
}

export interface DecryptParams {
  encrypted: string
  iv: string
}
