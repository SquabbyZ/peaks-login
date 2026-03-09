import type { EncryptResult, DecryptParams } from "~/types"

const ALGORITHM = "AES-GCM"
const KEY_LENGTH = 256
const IV_LENGTH = 12

export async function generateMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ["encrypt", "decrypt"]
  )
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  )
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key)
  return bufferToBase64(exported)
}

export async function importKey(keyData: string): Promise<CryptoKey> {
  const buffer = base64ToBuffer(keyData)
  return crypto.subtle.importKey(
    "raw",
    buffer,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  )
}

export async function encrypt(plaintext: string, key: CryptoKey): Promise<EncryptResult> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  )

  return {
    encrypted: bufferToBase64(encrypted),
    iv: bufferToBase64(iv),
  }
}

export async function decrypt(params: DecryptParams, key: CryptoKey): Promise<string> {
  const { encrypted, iv } = params
  const decoder = new TextDecoder()

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: base64ToBuffer(iv) },
    key,
    base64ToBuffer(encrypted)
  )

  return decoder.decode(decrypted)
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
