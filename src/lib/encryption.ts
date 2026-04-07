/**
 * Client-side encryption utilities for secure document storage
 * Uses Web Crypto API with AES-256-GCM
 */

// IV size: 12 bytes (96 bits) for GCM
const IV_SIZE = 12;
// Salt size: 16 bytes (128 bits)
const SALT_SIZE = 16;
// Algorithm
const ALGORITHM = 'AES-GCM';
const HASH_ALGORITHM = 'SHA-256';
const KEY_LENGTH = 256; // bits

/**
 * Generate a random encryption key
 * Returns a base64-encoded key suitable for storage
 */
export async function generateEncryptionKey(): Promise<string> {
  const key = await window.crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  const exported = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Derive a cryptographic key from a password
 * Uses PBKDF2 for key derivation
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password);

  // Import password as key
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key material
  const keyMaterial = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: HASH_ALGORITHM,
    },
    passwordKey,
    KEY_LENGTH
  );

  // Import derived key for AES-GCM
  return window.crypto.subtle.importKey('raw', keyMaterial, ALGORITHM, false, [
    'encrypt',
    'decrypt',
  ]);
}

/**
 * Encrypt a file using AES-256-GCM
 * Returns: salt + iv + ciphertext + tag (all concatenated as ArrayBuffer)
 */
export async function encryptFile(
  file: File,
  keyString: string
): Promise<ArrayBuffer> {
  // Read file as ArrayBuffer
  const fileData = await file.arrayBuffer();

  // Generate random IV and salt
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));

  // Import key
  const keyBuffer = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    ALGORITHM,
    false,
    ['encrypt']
  );

  // Encrypt
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    fileData
  );

  // Combine: salt + iv + ciphertext
  const result = new Uint8Array(
    salt.length + iv.length + ciphertext.byteLength
  );
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return result.buffer;
}

/**
 * Decrypt a file encrypted with encryptFile()
 * Input format: salt + iv + ciphertext
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  keyString: string
): Promise<ArrayBuffer> {
  const data = new Uint8Array(encryptedData);

  // Extract components
  const salt = data.slice(0, SALT_SIZE);
  const iv = data.slice(SALT_SIZE, SALT_SIZE + IV_SIZE);
  const ciphertext = data.slice(SALT_SIZE + IV_SIZE);

  // Import key
  const keyBuffer = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    ALGORITHM,
    false,
    ['decrypt']
  );

  // Decrypt
  const plaintext = await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    ciphertext
  );

  return plaintext;
}

/**
 * Hash a string using SHA-256
 * Useful for generating document IDs or checksums
 */
export async function hashString(input: string): Promise<string> {
  const buffer = new TextEncoder().encode(input);
  const hashBuffer = await window.crypto.subtle.digest(HASH_ALGORITHM, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
