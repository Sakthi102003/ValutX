import { create } from 'zustand';
import axios from 'axios';
import {
    deriveKEK,
    deriveAuthKey,
    generateDEK,
    wrapDEK,
    unwrapDEK,
    encryptVaultItem,
    decryptVaultItem,
    generateSalt,
    type EncryptedBlob
} from '../utils/crypto';

// Constants
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Check for array buffer conversion helper availability or use simpler approach
// In crypto.ts we used base64 strings for everything.

export type VaultItemType = 'login' | 'card' | 'id' | 'note';

export interface DecryptedVaultItem {
    id: string;
    type: VaultItemType;
    data: any; // The decrypted JSON
    createdAt: string;
    fav: boolean;
    rawEnc: string; // The base64 ciphertext
    rawIv: string;  // The base64 IV
    version: number;
}

interface VaultState {
    isLocked: boolean;
    isAuthenticated: boolean;
    userEmail: string | null;
    kdfSalt: string | null;
    encryptedDek: EncryptedBlob | null; // Stored to verify old password during rotation
    dek: CryptoKey | null; // Data Encryption Key (Held in RAM only)
    decryptedItems: DecryptedVaultItem[];
    isLoading: boolean;
    isPanicking: boolean;
    error: string | null;

    // Feature 2: UX & Security
    lastActivity: number;
    autoLockTimer: number | null;
    clipboardStatus: { text: string; timeLeft: number } | null;
    settings: {
        autoLockMinutes: number;
        keyboardShortcuts: boolean;
    };

    // Actions
    setError: (msg: string | null) => void;
    signup: (email: string, password: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    changeMasterPassword: (oldPw: string, newPw: string) => Promise<boolean>;
    verifyMasterPassword: (password: string) => Promise<boolean>;
    unlockVault: (password: string) => Promise<boolean>;
    lock: () => void;
    logout: () => void;
    panicLock: () => void;

    // Vault Operations
    addItem: (type: VaultItemType, data: any) => Promise<void>;
    updateItem: (id: string, type: VaultItemType, data: any) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    fetchItems: () => Promise<void>;

    // Feature 2 & 3 Actions
    updateActivity: () => void;
    setAutoLockMinutes: (mins: number) => void;
    setClipboardStatus: (text: string | null, duration?: number) => void;
    exportVault: () => void;
    exportEncryptedVault: () => void;
    importVault: (data: string) => Promise<boolean>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
    isLocked: true,
    isAuthenticated: false,
    userEmail: null,
    kdfSalt: null,
    encryptedDek: null,
    dek: null,
    decryptedItems: [],
    isLoading: false,
    isPanicking: false,
    error: null,

    lastActivity: Date.now(),
    autoLockTimer: null,
    clipboardStatus: null,
    settings: {
        autoLockMinutes: 5,
        keyboardShortcuts: true,
    },

    setError: (msg) => set({ error: msg }),

    signup: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            // 1. Generate new Salt
            const salt = generateSalt();

            const toBase64 = (buffer: ArrayBuffer) => {
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
                return window.btoa(binary);
            };

            const saltStr = toBase64(salt.buffer as ArrayBuffer);

            // 2. Client-Side Crypto
            const authKey = await deriveAuthKey(password, saltStr);
            const kek = await deriveKEK(password, saltStr);
            const dek = await generateDEK();
            const wrappedDek = await wrapDEK(dek, kek); // { cipherText, iv }

            // 3. Send to Server
            // Formatting wrappedDek for server storage (e.g. JSON string or formatted string)
            // Server expects 'encrypted_dek' string. Let's serialize it.
            const encryptedDekStr = JSON.stringify(wrappedDek);

            await axios.post(`${API_URL}/auth/signup`, {
                email,
                auth_hash_derived: authKey, // This is the HASH of the AuthKey? No, deriveAuthKey returns the key/hash itself.
                kdf_salt: saltStr,
                encrypted_dek: encryptedDekStr
            });

            // 4. Auto-login success (set state)
            set({
                isAuthenticated: true,
                isLocked: false,
                userEmail: email,
                dek: dek,
                kdfSalt: saltStr,
                encryptedDek: wrappedDek, // New user has this
                decryptedItems: []
            });

            return true;
        } catch (e: any) {
            console.error(e);
            set({ error: e.response?.data?.detail || "Signup failed" });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            // 1. Get Salt
            const saltRes = await axios.get(`${API_URL}/auth/salt/${email}`);
            const saltStr = saltRes.data.kdf_salt;

            // 2. Derive Auth Key
            const authKey = await deriveAuthKey(password, saltStr);

            // 3. Login
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email,
                auth_hash_derived: authKey
            });

            const { access_token, user } = loginRes.data;

            // Set Auth Header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            // 4. Unlock Vault (Derive KEK -> Unwrap DEK)
            const kek = await deriveKEK(password, saltStr);
            const encryptedDekObj = JSON.parse(user.encrypted_dek);

            const dek = await unwrapDEK(
                encryptedDekObj.cipherText,
                encryptedDekObj.iv,
                kek
            );

            set({
                isAuthenticated: true,
                isLocked: false,
                userEmail: email,
                dek: dek,
                kdfSalt: saltStr,
                encryptedDek: encryptedDekObj,
            });

            // 5. Fetch Items
            await get().fetchItems();

            return true;
        } catch (e: any) {
            console.error(e);
            set({ error: e.response?.data?.detail || "Login failed. Check internet or credentials." });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchItems: async () => {
        const { dek } = get();
        if (!dek) return;

        try {
            const res = await axios.get(`${API_URL}/vault/`);
            const encryptedItems = res.data;
            const decryptedList: DecryptedVaultItem[] = [];

            for (const item of encryptedItems) {
                try {
                    const data = await decryptVaultItem(item.enc_data, item.iv, dek);
                    decryptedList.push({
                        id: item.id,
                        type: item.type,
                        data: data,
                        createdAt: item.created_at,
                        fav: false,
                        rawEnc: item.enc_data,
                        rawIv: item.iv,
                        version: item.version
                    });
                } catch (err) {
                    console.error(`Failed to decrypt item ${item.id}`, err);
                    // Add a placeholder "Encrypted / Corrupted" item?
                }
            }

            set({ decryptedItems: decryptedList });
        } catch (e) {
            console.error("Failed to fetch items", e);
        }
    },

    addItem: async (type, data) => {
        const { dek, decryptedItems } = get();
        if (!dek) throw new Error("Vault is locked");

        const { cipherText, iv } = await encryptVaultItem(data, dek);

        const res = await axios.post(`${API_URL}/vault/`, {
            type,
            enc_data: cipherText,
            iv: iv,
            auth_tag: "" // WebCrypto GCM usually includes tag in cipherText, or we handle it. My crypto.ts impl puts it in cipherText (default WebCrypto behavior).
        });

        const newItem = res.data;
        const newDecrypted: DecryptedVaultItem = {
            id: newItem.id,
            type: newItem.type,
            data: data,
            createdAt: newItem.created_at,
            fav: false,
            rawEnc: cipherText,
            rawIv: iv,
            version: newItem.version
        };

        set({ decryptedItems: [...decryptedItems, newDecrypted] });
    },

    updateItem: async (id, type, data) => {
        const { dek, decryptedItems } = get();
        if (!dek) throw new Error("Vault is locked");

        const { cipherText, iv } = await encryptVaultItem(data, dek);

        // Update local state (Optimistic or wait for response)
        const updatedItem = (await axios.put(`${API_URL}/vault/${id}`, {
            enc_data: cipherText,
            iv: iv,
            auth_tag: "",
            version: decryptedItems.find(i => i.id === id)?.version
        })).data;

        const updatedList = decryptedItems.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    data,
                    type,
                    rawEnc: cipherText,
                    rawIv: iv,
                    version: updatedItem.version
                };
            }
            return item;
        });

        set({ decryptedItems: updatedList });
    },

    changeMasterPassword: async (oldPw, newPw) => {
        set({ isLoading: true, error: null });
        const { kdfSalt, encryptedDek, dek } = get();

        if (!kdfSalt || !encryptedDek || !dek) {
            set({ isLoading: false, error: "Session invalid. Please relogin." });
            return false;
        }

        try {
            // 1. Verify Old Password
            // Try to unwrap DEK with Old Password
            const oldKek = await deriveKEK(oldPw, kdfSalt);
            try {
                await unwrapDEK(encryptedDek.cipherText, encryptedDek.iv, oldKek);
            } catch (e) {
                throw new Error("Old password is incorrect");
            }

            // 2. Generate New Keys
            const newSalt = generateSalt();
            const toBase64 = (buffer: ArrayBuffer) => {
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
                return window.btoa(binary);
            };
            const newSaltStr = toBase64(newSalt.buffer as ArrayBuffer);

            const newKek = await deriveKEK(newPw, newSaltStr);
            const newWrappedDek = await wrapDEK(dek, newKek); // Wrap EXISTING DEK with NEW KEK
            const newAuthHash = await deriveAuthKey(newPw, newSaltStr);

            const newEncryptedDekStr = JSON.stringify(newWrappedDek);

            // 3. Send to server
            await axios.put(`${API_URL}/auth/rotate-key`, {
                auth_hash_derived: newAuthHash,
                kdf_salt: newSaltStr,
                encrypted_dek: newEncryptedDekStr
            });

            // 4. Update Store
            set({
                kdfSalt: newSaltStr,
                encryptedDek: newWrappedDek
            });

            return true;
        } catch (e: any) {
            console.error(e);
            set({ error: e.message || "Failed to change password" });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    verifyMasterPassword: async (password) => {
        const { kdfSalt, encryptedDek } = get();
        if (!kdfSalt || !encryptedDek) return false;

        try {
            const kek = await deriveKEK(password, kdfSalt);
            await unwrapDEK(encryptedDek.cipherText, encryptedDek.iv, kek);
            return true;
        } catch (e) {
            return false;
        }
    },

    unlockVault: async (password) => {
        const { kdfSalt, encryptedDek } = get();
        if (!kdfSalt || !encryptedDek) return false;

        set({ isLoading: true, error: null });
        try {
            const kek = await deriveKEK(password, kdfSalt);
            const dek = await unwrapDEK(encryptedDek.cipherText, encryptedDek.iv, kek);
            set({ dek, isLocked: false });
            await get().fetchItems();
            return true;
        } catch (e) {
            set({ error: "Invalid master password" });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    lock: () => {
        set({ isLocked: true, dek: null, decryptedItems: [] });
    },

    deleteItem: async (id) => {
        const { decryptedItems } = get();
        await axios.delete(`${API_URL}/vault/${id}`);
        set({ decryptedItems: decryptedItems.filter(i => i.id !== id) });
    },

    logout: () => {
        set({
            isAuthenticated: false,
            isLocked: true,
            dek: null,
            decryptedItems: [],
            userEmail: null
        });
        delete axios.defaults.headers.common['Authorization'];
    },

    panicLock: () => {
        set({
            isPanicking: true,
            isAuthenticated: false,
            isLocked: true,
            dek: null,
            decryptedItems: [],
            userEmail: null
        });

        // Final Wipe after animation
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    },

    updateActivity: () => {
        const { isAuthenticated, settings } = get();
        if (!isAuthenticated) return;

        set({ lastActivity: Date.now() });

        // Clear existing timer
        const oldTimer = get().autoLockTimer;
        if (oldTimer) window.clearTimeout(oldTimer);

        // Set new timer
        const newTimer = window.setTimeout(() => {
            get().lock();
        }, settings.autoLockMinutes * 60000);

        set({ autoLockTimer: newTimer });
    },

    setAutoLockMinutes: (mins) => {
        set((state) => ({ settings: { ...state.settings, autoLockMinutes: mins } }));
        get().updateActivity();
    },

    setClipboardStatus: (text, duration = 30) => {
        if (!text) {
            set({ clipboardStatus: null });
            return;
        }

        set({ clipboardStatus: { text, timeLeft: duration } });

        // Start countdown
        const interval = setInterval(() => {
            const status = get().clipboardStatus;
            if (!status || status.timeLeft <= 1) {
                clearInterval(interval);
                set({ clipboardStatus: null });
                navigator.clipboard.writeText("");
            } else {
                set({ clipboardStatus: { ...status, timeLeft: status.timeLeft - 1 } });
            }
        }, 1000);
    },

    exportVault: () => {
        const { decryptedItems } = get();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(decryptedItems, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `valutx_decrypted_export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },

    exportEncryptedVault: () => {
        const { decryptedItems } = get();
        const encryptedData = decryptedItems.map(item => ({
            type: item.type,
            enc_data: item.rawEnc,
            iv: item.rawIv,
            created_at: item.createdAt
        }));

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(encryptedData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `valutx_encrypted_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },

    importVault: async (jsonStr) => {
        try {
            const data = JSON.parse(jsonStr);
            if (!Array.isArray(data)) throw new Error("Invalid format");

            for (const item of data) {
                await get().addItem(item.type, item.data);
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}));
