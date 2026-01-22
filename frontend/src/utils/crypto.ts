/**
 * ValutX Cryptography Core
 * ------------------------
 * Implements Zero-Knowledge Architecture using Web Crypto API.
 * 
 * Hierarchy:
 * 1. User Inputs Master Password.
 * 2. Key Encryption Key (KEK) derived from (Password + Salt).
 * 3. Data Encryption Key (DEK) is a random AES key.
 * 4. DEK is encrypted (wrapped) by KEK and stored on server.
 * 5. All Vault Items are encrypted by DEK.
 */

// Constants
export const PBKDF2_ITERATIONS = 600000; // High iteration count for security
export const SALT_LENGTH = 16;
export const IV_LENGTH = 12; // Standard for AES-GCM
export const AES_LENGTH = 256;

// Types
export interface EncryptedBlob {
    cipherText: string; // Base64
    iv: string;         // Base64
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export function generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

// -----------------------------------------------------------------------------
// Key Management (KEK & DEK)
// -----------------------------------------------------------------------------

/**
 * Derives the Key Encryption Key (KEK) from the Master Password.
 * This key is used ONLY to wrap/unwrap the Data Encryption Key (DEK).
 */
export async function deriveKEK(password: string, saltBase64: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const salt = base64ToArrayBuffer(saltBase64);

    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: AES_LENGTH }, // using AES-GCM to wrap keys
        false, // non-extractable
        ["wrapKey", "unwrapKey"]
    );
}

/**
 * Derives the Auth Key to send to the server for login.
 * MUST use a different salt or logic than KEK to prevent server from deriving KEK.
 * Simple strategy: PBKDF2(password, salt) -> Hash(Key) -> Send Hash.
 * Alternatively, derive a separate key implementation.
 */
export async function deriveAuthKey(password: string, saltBase64: string): Promise<string> {
    const enc = new TextEncoder();
    const originalSalt = base64ToArrayBuffer(saltBase64);

    // Domain separation: Append "AUTH" bytes to salt
    const separator = enc.encode("AUTH_DOMAIN");
    const combinedSalt = new Uint8Array(originalSalt.byteLength + separator.byteLength);
    combinedSalt.set(new Uint8Array(originalSalt), 0);
    combinedSalt.set(separator, originalSalt.byteLength);

    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    const derivedBits = await window.crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: combinedSalt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        256 // 256 bits for the auth hash
    );

    return arrayBufferToBase64(derivedBits);
}

/**
 * Generates a completely random Data Encryption Key (DEK).
 * This key encrypts your actual data.
 */
export async function generateDEK(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: AES_LENGTH,
        },
        true, // Must be extractable to be wrapped
        ["encrypt", "decrypt"]
    );
}

/**
 * Wraps (Encrypts) the DEK using the KEK.
 * Returns the encrypted key blob to store on the server.
 */
export async function wrapDEK(dek: CryptoKey, kek: CryptoKey): Promise<EncryptedBlob> {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const wrappedBuffer = await window.crypto.subtle.wrapKey(
        "raw",
        dek,
        kek,
        {
            name: "AES-GCM",
            iv: iv
        }
    );

    return {
        cipherText: arrayBufferToBase64(wrappedBuffer),
        iv: arrayBufferToBase64(iv.buffer)
    };
}

/**
 * Unwraps (Decrypts) the DEK using the KEK.
 * Recovery step after login.
 */
export async function unwrapDEK(wrappedDekBase64: string, ivBase64: string, kek: CryptoKey): Promise<CryptoKey> {
    const wrappedBuffer = base64ToArrayBuffer(wrappedDekBase64);
    const iv = base64ToArrayBuffer(ivBase64);

    try {
        return await window.crypto.subtle.unwrapKey(
            "raw",
            wrappedBuffer,
            kek,
            {
                name: "AES-GCM",
                iv: iv
            },
            {
                name: "AES-GCM",
                length: AES_LENGTH
            },
            false,
            ["encrypt", "decrypt"]
        );
    } catch (e) {
        throw new Error("Failed to unlock vault. Incorrect Master Password or corrupted key.");
    }
}

// -----------------------------------------------------------------------------
// Data Encryption (AES-GCM)
// -----------------------------------------------------------------------------

export async function encryptVaultItem(data: object, dek: CryptoKey): Promise<EncryptedBlob> {
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(data));
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const cipherBuffer = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        dek,
        encodedData
    );

    return {
        cipherText: arrayBufferToBase64(cipherBuffer),
        iv: arrayBufferToBase64(iv.buffer)
    };
}

export async function decryptVaultItem(cipherText: string, iv: string, dek: CryptoKey): Promise<any> {
    const cipherBuffer = base64ToArrayBuffer(cipherText);
    const ivBuffer = base64ToArrayBuffer(iv);
    const dec = new TextDecoder();

    try {
        const plainBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: ivBuffer
            },
            dek,
            cipherBuffer
        );

        return JSON.parse(dec.decode(plainBuffer));
    } catch (e) {
        console.error(e);
        throw new Error("Decryption failed. Integrity check failed.");
    }
}
