import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCurrentUser, type AuthUser, disconnectWallet, saveUserWallet } from '../lib/auth';
import { Wallet, LogOut, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Standard Solana Provider Interface
interface SolanaProvider {
    isPhantom?: boolean;
    isSolflare?: boolean;
    publicKey: { toString: () => string } | null;
    isConnected: boolean;
    connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: (args: any) => void) => void;
}

declare global {
    interface Window {
        solana?: SolanaProvider;
        solflare?: SolanaProvider;
        phantom?: {
            solana?: SolanaProvider;
        };
    }
}

const PhantomLogo = () => (
    <svg width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" rx="64" fill="rgb(152,134,229)" />
        <path d="M 422.00 128.00 L 399.00 109.00 L 381.00 101.00 L 357.00 96.00 L 325.00 96.00 L 289.00 103.00 L 261.00 113.00 L 226.00 131.00 L 190.00 156.00 L 140.00 203.00 L 121.00 226.00 L 99.00 258.00 L 80.00 294.00 L 70.00 321.00 L 64.00 350.00 L 64.00 376.00 L 72.00 399.00 L 81.00 408.00 L 95.00 414.00 L 116.00 415.00 L 141.00 409.00 L 174.00 389.00 L 211.00 348.00 L 214.00 351.00 L 213.00 369.00 L 217.00 380.00 L 224.00 388.00 L 238.00 394.00 L 260.00 393.00 L 280.00 385.00 L 301.00 370.00 L 322.00 346.00 L 328.00 364.00 L 340.00 372.00 L 361.00 371.00 L 382.00 360.00 L 403.00 339.00 L 419.00 315.00 L 433.00 285.00 L 445.00 241.00 L 447.00 225.00 L 445.00 178.00 L 437.00 152.00 Z" fill="rgb(255,255,255)" />
        <ellipse cx="315.51" cy="201.59" rx="19.75" ry="24.93" transform="rotate(0.04 315.51 201.59)" fill="rgb(152,134,229)" />
        <ellipse cx="379.09" cy="201.58" rx="19.68" ry="25.07" transform="rotate(179.98 379.09 201.58)" fill="rgb(152,134,229)" />
    </svg>
);

export const ConnectWallet: React.FC = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    const connect = async (type: 'phantom' | 'solflare') => {
        setError(null);
        setIsConnecting(type);
        let provider: SolanaProvider | undefined;

        // Standard detection for Phantom and Solflare
        if (type === 'phantom') {
            provider = window.phantom?.solana || window.solana;
            if (provider && !provider.isPhantom) provider = undefined;
        } else {
            provider = window.solflare;
            if (provider && !provider.isSolflare) provider = undefined;
        }

        if (!provider) {
            setError(`Please install ${type.charAt(0).toUpperCase() + type.slice(1)} wallet extension or mobile app.`);
            setIsConnecting(null);
            return;
        }

        try {
            // Initiate connection protocol
            const resp = await provider.connect();
            const publicKey = resp.publicKey.toString();

            // Save to Antigravity pseudo-backend
            const authUser = await saveUserWallet(publicKey);
            setUser(authUser);
            setShowModal(false);

            // Broadcast event for dashboard state transition
            window.dispatchEvent(new Event('wallet_connected'));
        } catch (err: any) {
            console.error(`${type} connection error:`, err);
            setError(err.message || 'Connection rejected by user.');
        } finally {
            setIsConnecting(null);
        }
    };

    const handleDisconnect = () => {
        disconnectWallet();
        setUser(null);
    };

    const shortenedWallet = user ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : '';

    return (
        <div style={{ position: 'relative' }}>
            {user ? (
                <div
                    className="glass-panel"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 16px',
                        border: '1px solid var(--primary-glow)',
                        boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
                        animation: 'fadeIn 0.5s ease-out'
                    }}
                >
                    <Wallet size={16} className="glow-text-primary" />
                    <span className="mono" style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>
                        {shortenedWallet}
                    </span>
                    <button
                        onClick={handleDisconnect}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '4px'
                        }}
                        title="Disconnect Wallet"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            ) : (
                <button
                    className="btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    <Wallet size={18} />
                    Connect Wallet
                </button>
            )}

            {createPortal(
                <AnimatePresence>
                    {showModal && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowModal(false)}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0, 0, 0, 0.8)',
                                    backdropFilter: 'blur(8px)'
                                }}
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    maxWidth: '400px',
                                    background: 'rgba(11, 12, 16, 0.85)',
                                    backdropFilter: 'blur(24px)',
                                    border: '1px solid rgba(0, 255, 255, 0.3)',
                                    borderRadius: '24px',
                                    padding: '32px',
                                    textAlign: 'center',
                                    boxShadow: '0 0 40px rgba(0, 255, 255, 0.2)'
                                }}
                            >
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <X size={20} />
                                </button>

                                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-glow)', marginBottom: '8px', textShadow: '0 0 10px rgba(0, 255, 255, 0.4)' }}>
                                    Connect Wallet
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                                    Choose your preferred Solana wallet
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <button
                                        onClick={() => connect('phantom')}
                                        disabled={!!isConnecting}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            background: 'linear-gradient(90deg, #8A2BE2 0%, #00FFFF 100%)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '16px',
                                            cursor: !!isConnecting ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 15px rgba(138, 43, 226, 0.3)',
                                            opacity: !!isConnecting && isConnecting !== 'phantom' ? 0.5 : 1
                                        }}
                                        onMouseEnter={(e) => !isConnecting && (e.currentTarget.style.transform = 'scale(1.02)')}
                                        onMouseLeave={(e) => !isConnecting && (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <PhantomLogo />
                                        {isConnecting === 'phantom' ? 'Initializing...' : 'Phantom'}
                                    </button>

                                    <button
                                        onClick={() => connect('solflare')}
                                        disabled={!!isConnecting}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            background: 'linear-gradient(90deg, #FFB648 0%, #00FFFF 100%)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '16px',
                                            cursor: !!isConnecting ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 15px rgba(255, 182, 72, 0.3)',
                                            opacity: !!isConnecting && isConnecting !== 'solflare' ? 0.5 : 1
                                        }}
                                        onMouseEnter={(e) => !isConnecting && (e.currentTarget.style.transform = 'scale(1.02)')}
                                        onMouseLeave={(e) => !isConnecting && (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <img src="https://solflare.com/favicon.ico" alt="Solflare" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                        {isConnecting === 'solflare' ? 'Initializing...' : 'Solflare'}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ marginTop: '20px', overflow: 'hidden' }}
                                        >
                                            <div style={{ color: '#FF4D4D', fontSize: '14px', marginBottom: '8px' }}>{error}</div>
                                            <a
                                                href={error.includes('Phantom') ? 'https://phantom.app/' : 'https://solflare.com/'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--primary-glow)', fontSize: '12px', textDecoration: 'none' }}
                                            >
                                                Install Wallet <ExternalLink size={12} />
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <p style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                                    Securely powered by Antigravity Protocol
                                </p>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

