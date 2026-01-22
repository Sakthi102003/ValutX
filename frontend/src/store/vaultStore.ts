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
    generateSalt
} from '../utils/crypto';

// Constants
const API_URL = 'http://localhost:8000/api/v1';

// Check for array buffer conversion helper availability or use simpler approach
// In crypto.ts we used base64 strings for everything.

export type VaultItemType = 'login' | 'card' | 'id' | 'note';

export interface DecryptedVaultItem {
    id: string;
    type: VaultItemType;
    data: any; // The decrypted JSON
    createdAt: string;
    fav: boolean;
}

interface VaultState {
    isLocked: boolean;
    isAuthenticated: boolean;
    userEmail: string | null;
    dek: CryptoKey | null; // Data Encryption Key (Held in RAM only)
    decryptedItems: DecryptedVaultItem[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setError: (msg: string | null) => void;
    signup: (email: string, password: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    panicLock: () => void;

    // Vault Operations
    addItem: (type: VaultItemType, data: any) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    fetchItems: () => Promise<void>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
    isLocked: true,
    isAuthenticated: false,
    userEmail: null,
    dek: null,
    decryptedItems: [],
    isLoading: false,
    error: null,

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
                dek: dek
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
                        fav: false // Not in DB yet
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
            fav: false
        };

        set({ decryptedItems: [...decryptedItems, newDecrypted] });
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
            isAuthenticated: false,
            isLocked: true,
            dek: null,
            decryptedItems: [],
            userEmail: null
        });
        window.location.reload();
    }
}));
