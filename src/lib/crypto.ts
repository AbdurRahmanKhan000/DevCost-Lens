/**
 * DevCost Lens — Client & Edge Key Encryption Logic
 * Uses standard Web Crypto API AES-GCM with PBKDF2 key derivation.
 * Ensures developer API keys are never stored in plaintext in Supabase or local storage.
 */

import { EncryptedApiKeyPayload, AIProvider } from "../types";

// Convert ArrayBuffer to Base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM CryptoKey using PBKDF2 from a master password or user passphrase.
 */
async function deriveKey(masterSecret: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(masterSecret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as ArrayBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt an API key using Web Crypto API AES-GCM
 */
export async function encryptApiKey(
  plainApiKey: string,
  provider: AIProvider,
  keyLabel: string,
  userSecretOrPassphrase: string = "devcost_lens_master_salt"
): Promise<EncryptedApiKeyPayload> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for AES-GCM

  const key = await deriveKey(userSecretOrPassphrase, salt);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as ArrayBuffer,
    },
    key,
    enc.encode(plainApiKey)
  );

  const lastFour = plainApiKey.length > 4 ? plainApiKey.slice(-4) : plainApiKey;

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv.buffer),
    salt: bufferToBase64(salt.buffer),
    provider,
    keyLabel: keyLabel || `${provider.toUpperCase()} Key`,
    lastFourChars: lastFour,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Decrypt an API key using Web Crypto API AES-GCM
 */
export async function decryptApiKey(
  payload: EncryptedApiKeyPayload,
  userSecretOrPassphrase: string = "devcost_lens_master_salt"
): Promise<string> {
  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  const key = await deriveKey(userSecretOrPassphrase, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as ArrayBuffer,
    },
    key,
    ciphertext as unknown as ArrayBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}
