# ValutX System Architecture

## 1. High-Level Architecture
The system follows a strict **Zero-Knowledge** architecture using a "Thick Client, Thin Server" model regarding cryptography.

```mermaid
graph TD
    subgraph Client [Browser / Client Side]
        UI[User Interface]
        Store[State Store (Zustand)]
        Crypto[Crypto Engine (Web Crypto API)]
        
        UI -->|Input Master Password| Crypto
        Crypto -->|Derive Auth Key| AuthKey[Auth Key (for Login)]
        Crypto -->|Derive Encryption Key| KEK[Key Encryption Key (KEK)]
        
        AuthKey -->|Login Request| Server
        KEK -->|Decrypt Vault Key| DEK[Data Encryption Key (DEK)]
        
        UI -->|Create Item| Store
        Store -->|Plaintext Data| Crypto
        Crypto -->|Encrypt with DEK| Blob[Encrypted Blob + IV]
        Blob -->|Sync| Server
    end

    subgraph Server [Backend / Cloud]
        API[FastAPI Gateway]
        DB[(PostgreSQL / SQLite)]
        
        API -->|Verify Hash| AuthDB[User Auth Table]
        API -->|Store Blob| VaultDB[Vault Items Table]
    end

    Client -- HTTPS (TLS 1.3) --> Server
```

## 2. Security Concept & Threat Model

### Key Concepts
*   **Master Password:** Known ONLY to the user. Never saved, never sent.
*   **Salt:** Unique per user, stored publically on the backend, used for KDF.
*   **Auth Key:** Derived from Master Password (PBKDF2/Argon2). Used to authenticate. Server hashes this again to store.
*   **KEK (Key Encryption Key):** Derived from Master Password (different salt/parameters). Used ONLY to decrypt the DEK.
*   **DEK (Data Encryption Key):** Randomly generated AES-256 key. Encrypts all vault items. Stored encrypted (Wrapped) by the KEK on the server.

### Threat Model
| Threat | Mitigation | Status |
| :--- | :--- | :--- |
| **Server Compromise** | Attackers get DB full of encrypted blobs. Without the Master Password, data is useless (AES-256). | ✅ Protected |
| **Network Sniffing** | TLS 1.3 + Data is already encrypted at the application layer. | ✅ Protected |
| **Malicious Insider** | Admins see only random bytes. They cannot decrypt user data. | ✅ Protected |
| **Client-Side Malware** | If the user's device has a keylogger/memory scraper, security is compromised. We use aggressive memory clearing (panic mode), but OS-level compromise is out of scope. | ⚠️ Out of Scope |
| **Weak Master Password** | Use robust KDF (PBKDF2/Argon2) with high iterations to resist brute-force. | ✅ Mitigated |

## 3. Directory Structure

### Frontend (`/frontend/src`)
```
frontend/src/
├── assets/          # Static assets (images, fonts)
├── components/      # React components
│   ├── auth/        # Login, Signup, Master Password input
│   ├── vault/       # Vault Item list, Item details, Secure inputs
│   ├── ui/          # Reusable UI (Buttons, Inputs, Modals)
│   └── layout/      # AppShell, Sidebar, PanicButton
├── hooks/           # Custom React hooks (useCrypto, useAuth)
├── lib/             # Utility libraries
├── pages/           # Route pages (Dashboard, Landing, Settings)
├── services/        # API clients (axios/fetch wrappers)
├── store/           # Global state (Zustand) - Stores Decrypted data in RAM ONLY
├── types/           # TS Interfaces
└── utils/           # Core Cryptography Logic (crypto.ts) - CRITICAL
```

### Backend (`/backend`)
```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py      # Login/Signup
│   │   │   │   └── vault.py     # CRUD for encrypted blobs
│   │   │   └── api.py           # Router entry
│   ├── core/
│   │   ├── config.py            # Env vars
│   │   └── security.py          # JWT, Pass hashing (for Auth Key only)
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/                  # SQLAlchemy ORM Models
│   │   ├── user.py
│   │   └── item.py
│   └── schemas/                 # Pydantic Schemas (Validation)
│       ├── user.py
│       └── item.py
├── main.py                      # App Entrypoint
└── requirements.txt
```

## 4. Database Schema

### Table: `users`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique User ID |
| `email` | VARCHAR | User Email (Unique) |
| `auth_hash` | VARCHAR | Argon2/Bcrypt hash of the *Auth Key* (NOT the password) |
| `kdf_salt` | VARCHAR | Salt used for client-side KDF |
| `encrypted_dek` | TEXT | The Data Encryption Key, encrypted by the KEK (Wrapped) |
| `created_at` | TIMESTAMP | |

### Table: `vault_items`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique Item ID |
| `user_id` | UUID (FK) | Owner |
| `type` | VARCHAR | 'login', 'card', 'id', 'note' |
| `enc_data` | TEXT | The actual data (JSON) encrypted with DEK (Base64) |
| `iv` | VARCHAR | Initialization Vector for this item (Base64) |
| `auth_tag` | VARCHAR | GCM Auth Tag (can be appended to enc_data) |
| `last_modified`| TIMESTAMP | |
| `version` | INT | For conflict resolution |

**Note on Metadata:** To prevent leaking behavior patterns, we minimize unencrypted metadata. The `type` is visible to allow filtering without decryption, but `title` and `username` must be encrypted inside `enc_data`.
