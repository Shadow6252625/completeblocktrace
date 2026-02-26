// Antigravity Mock Database & Services
import { v4 as uuidv4 } from 'uuid';

export type User = {
    id: string;
    wallet?: string;
    email?: string;
    createdAt: string;
};

export type TraceSession = {
    id: string;
    userId: string;
    network: 'Mainnet' | 'Devnet' | 'Testnet';
    blockRange: { start: string; end: string };
    agentScope: string[];
    deepTrace: boolean;
    apiKey?: string;
    nodeEndpoint?: string;
    createdAt: string;
};

export type Transaction = {
    id: string;
    sessionId: string;
    hash: string;
    status: string;
    amount: number;
    timestamp: string;
    block?: number;
    program?: string;
};

export type Alert = {
    id: string;
    sessionId: string;
    message: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    createdAt: string;
};

// --- Mock Database (localStorage) ---
const DB_KEY = 'blocktrace_db';

const getDB = () => {
    const db = localStorage.getItem(DB_KEY);
    if (db) return JSON.parse(db);
    return { users: [], trace_sessions: [], transactions: [], alerts: [] };
};

const saveDB = (db: { users: User[], trace_sessions: TraceSession[], transactions: Transaction[], alerts: Alert[] }) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- API Functions ---
export const init_trace_session = (data: Omit<TraceSession, 'id' | 'createdAt'>): TraceSession => {
    const db = getDB();
    const session: TraceSession = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString()
    };
    db.trace_sessions.push(session);
    saveDB(db);
    return session;
};

export const fetch_trace_data = (sessionId: string): Transaction[] => {
    const db = getDB();
    // Generate some dummy transactions for the session if empty
    const txs = db.transactions.filter((tx: Transaction) => tx.sessionId === sessionId);
    if (txs.length === 0) {
        for (let i = 0; i < 5; i++) {
            txs.push(generate_mock_tx(sessionId));
        }
        db.transactions = [...db.transactions, ...txs];
        saveDB(db);
    }
    return txs;
};

export const detect_anomalies = (sessionId: string): Alert[] => {
    const db = getDB();
    const alerts = db.alerts.filter((a: Alert) => a.sessionId === sessionId);
    if (alerts.length === 0) {
        alerts.push({
            id: uuidv4(),
            sessionId,
            message: 'Unusual spike in compute units detected.',
            severity: 'Medium',
            createdAt: new Date().toISOString()
        });
        db.alerts = [...db.alerts, ...alerts];
        saveDB(db);
    }
    return alerts;
};

export const log_audit_event = (sessionId: string, event: string) => {
    const db = getDB();
    db.alerts.push({
        id: uuidv4(),
        sessionId,
        message: event,
        severity: 'Low',
        createdAt: new Date().toISOString()
    });
    saveDB(db);
};

export const get_dashboard_state = (sessionId: string) => {
    const session = getDB().trace_sessions.find((s: TraceSession) => s.id === sessionId);
    return {
        session,
        transactions: fetch_trace_data(sessionId),
        alerts: detect_anomalies(sessionId),
    };
};

export const generate_mock_tx = (sessionId: string): Transaction => {
    const statuses = ['confirmed', 'confirmed', 'confirmed', 'failed', 'Pending'];
    return {
        id: uuidv4(),
        sessionId,
        hash: 'tx_' + Math.random().toString(36).substring(2, 10),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        amount: parseFloat((Math.random() * 100).toFixed(2)),
        timestamp: new Date(Date.now() - Math.random() * 10000).toISOString(),
        block: Math.floor(Math.random() * 10000000),
        program: ["DEX", "NFT", "Lending", "DeFi"][Math.floor(Math.random() * 4)]
    };
};

// --- Real-Time Stream Engine ---
export type StreamSpeed = 'Slow' | 'Medium' | 'Fast';
export type StreamConfig = {
    enabled: boolean;
    speed: StreamSpeed;
    realMode: boolean;
};

const listeners: Record<string, ((data: unknown) => void)[]> = {
    trace_updates: [],
    anomaly_alerts: []
};

export const subscribe = (channel: string, callback: ((data: unknown) => void)) => {
    if (!listeners[channel]) listeners[channel] = [];
    listeners[channel].push(callback);
    return () => {
        listeners[channel] = listeners[channel].filter(cb => cb !== callback);
    };
};

export const emit_live_update = (channel: string, data: unknown) => {
    if (listeners[channel]) {
        listeners[channel].forEach(cb => cb(data));
    }
};

let simInterval: ReturnType<typeof setInterval> | null = null;

export const get_stream_config = (): StreamConfig => {
    const stored = localStorage.getItem('blocktrace_stream_config');
    if (stored) return JSON.parse(stored);
    return { enabled: true, speed: 'Medium', realMode: false };
};

export const set_stream_config = (config: StreamConfig) => {
    localStorage.setItem('blocktrace_stream_config', JSON.stringify(config));
    start_simulator();
};

const rotate_mock_data = (db: { users: User[], trace_sessions: TraceSession[], transactions: Transaction[], alerts: Alert[] }) => {
    if (db.transactions.length > 1000) {
        db.transactions = db.transactions.slice(-1000);
    }
    if (db.alerts.length > 100) {
        db.alerts = db.alerts.slice(-100);
    }
};

export const simulate_solana_activity = () => {
    const config = get_stream_config();
    if (!config.enabled) return;

    const block = Math.floor(Math.random() * 10000000);
    const txHash = uuidv4();
    const amount = parseFloat((Math.random() * 5).toFixed(3));
    const status = config.realMode ? (Math.random() > 0.05 ? "confirmed" : "failed") : (Math.random() > 0.9 ? "failed" : "confirmed");
    const program = ["DEX", "NFT", "Lending", "DeFi", "Serum", "Raydium", "Magic Eden"][Math.floor(Math.random() * (config.realMode ? 7 : 4))];
    const timestamp = new Date().toISOString();

    const db = getDB();
    const activeSession = db.trace_sessions[db.trace_sessions.length - 1];
    const sessionId = activeSession ? activeSession.id : 'global';

    const tx: Transaction = {
        id: uuidv4(),
        sessionId,
        hash: txHash,
        status,
        amount,
        timestamp,
        block,
        program
    };

    db.transactions.push(tx);

    let alert: Alert | null = null;
    // 1 in 25 blocks inject anomaly
    if (Math.floor(Math.random() * 25) === 0) {
        alert = {
            id: uuidv4(),
            sessionId,
            message: ["High Latency", "Unusual Volume", "Failed Confirmation Spike"][Math.floor(Math.random() * 3)],
            severity: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)] as 'Low' | 'Medium' | 'High' | 'Critical',
            createdAt: new Date().toISOString()
        };
        db.alerts.push(alert);
    }

    rotate_mock_data(db);
    saveDB(db);

    // Emit live updates
    emit_live_update('trace_updates', { type: 'transaction', data: tx });
    if (alert) {
        emit_live_update('anomaly_alerts', alert);
    }
};

export const start_simulator = () => {
    if (simInterval) clearInterval(simInterval);
    const config = get_stream_config();
    if (!config.enabled) return;

    const intervals = { 'Slow': 1000, 'Medium': 333, 'Fast': 166 };
    simInterval = setInterval(simulate_solana_activity, intervals[config.speed]);
};

export const stop_simulator = () => {
    if (simInterval) clearInterval(simInterval);
    simInterval = null;
};
