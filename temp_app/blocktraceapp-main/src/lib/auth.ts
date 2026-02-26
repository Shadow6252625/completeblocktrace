// Antigravity Mock Auth using localStorage
import { v4 as uuidv4 } from 'uuid';

const AUTH_KEY = 'blocktrace_auth_user';

export type AuthUser = {
    id: string;
    wallet: string;
    createdAt: string;
};

export const getCurrentUser = (): AuthUser | null => {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
};

export const saveUserWallet = async (publicKey: string): Promise<AuthUser> => {
    const existing = getCurrentUser();

    const user: AuthUser = existing ? { ...existing, wallet: publicKey } : {
        id: uuidv4(),
        wallet: publicKey,
        createdAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(user));

    // Update mock DB users collection
    const dbStr = localStorage.getItem('blocktrace_db');
    if (dbStr) {
        const db = JSON.parse(dbStr);
        const userIndex = db.users.findIndex((u: AuthUser) => u.id === user.id);
        if (userIndex > -1) {
            db.users[userIndex] = user;
        } else {
            db.users.push(user);
        }
        localStorage.setItem('blocktrace_db', JSON.stringify(db));
    }

    return user;
};

export const connectWallet = async (): Promise<AuthUser> => {
    // This is now more of a mock generic connection
    // The specific logic is handled by the UI popup
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockAddress = 'So1aNA' + Math.random().toString(36).substring(2, 6).toUpperCase() + '...' + Math.random().toString(36).substring(2, 4).toUpperCase();
            resolve(saveUserWallet(mockAddress));
        }, 800);
    });
};

export const disconnectWallet = () => {
    localStorage.removeItem(AUTH_KEY);
};
