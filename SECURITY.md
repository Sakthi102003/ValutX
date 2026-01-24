# Security Architecture - ValutX

ValutX is a zero-knowledge, client-side encrypted vault. This document outlines the security principles and implementation details.

## Core Principles

1.  **Zero-Knowledge**: The server (if one existed) or local storage never sees your password or decrypted data.
2.  **Client-Side Encryption**: All encryption happens in the browser using the Web Crypto API.
3.  **Ephemeral State**: Decrypted data exists only in React state (RAM) and is wiped on lock/reload.

## Cryptography Specifications

-   **Algorithm**: AES-256-GCM (Authenticated Encryption).
-   **Key Derivation**: PBKDF2-SHA256 with 600,000 iterations.
-   **Salt**: Unique 16-byte random salt generated per vault.
-   **IV**: Unique 12-byte random IV generated per item encryption.

## Data Storage

### Backend Storage (Persistent)
-   `users` table: Stores `kdf_salt`, `encrypted_dek` (wrapped), and hashed `authKey`.
-   `vault_items` table: Array of **Encrypted** blobs belonging to users.
    -   Contains: `enc_data`, `iv`, `type`, `created_at`.
    -   Does NOT contain: Plaintext data or encryption keys.

### Memory (Ephemeral - RAM)
-   `masterKey`: The CryptoKey object derived from your password.
-   `decryptedItems`: The array of plaintext data for display.

**Events that wipe Memory:**
-   Closing the tab.
-   Refreshing the page.
-   Clicking "Lock Vault".
-   Clicking "Panic Lock".
-   Auto-lock trigger (optional).

## Key Derivation Flow

1.  User enters `Master Password`.
2.  App retrieves `Salt` from LocalStorage.
3.  `PBKDF2(Password, Salt, 600k iters)` -> `Master Key`.
4.  `Master Key` is used to decrypt the vault items.
5.  If decryption fails (auth tag mismatch), the password is considered incorrect.

## Panic Lock

The "Panic Lock" button performs a hard page reload (`window.location.reload()`). This forces the browser to garbage collect the entire JavaScript execution environment, effectively scrubbing the decrypted data and keys from memory immediately.
