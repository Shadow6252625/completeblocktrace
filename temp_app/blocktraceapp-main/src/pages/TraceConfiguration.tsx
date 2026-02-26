import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Shield, Activity, Zap, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { init_trace_session } from '../lib/antigravity';

const TraceConfiguration: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        network: 'Mainnet' as 'Mainnet' | 'Devnet' | 'Testnet',
        blockStart: '',
        blockEnd: '',
        scopeTransactions: true,
        scopePrograms: false,
        scopeAccounts: true,
        alertThreshold: 50,
        emailAuth: '',
        deepTrace: false,
        apiKey: '',
        nodeEndpoint: 'https://api.mainnet-beta.solana.com',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            const scope = [];
            if (config.scopeTransactions) scope.push('Transactions');
            if (config.scopePrograms) scope.push('Programs');
            if (config.scopeAccounts) scope.push('Accounts');

            const session = init_trace_session({
                userId: 'anonymous', // Will link wallet later in dashboard
                network: config.network,
                blockRange: { start: config.blockStart || 'latest-1000', end: config.blockEnd || 'latest' },
                agentScope: scope,
                deepTrace: config.deepTrace,
                apiKey: config.apiKey,
                nodeEndpoint: config.nodeEndpoint
            });
            navigate(`/dashboard/${session.id}`);
        }, 1000);
    };

    const handleToggle = (key: keyof typeof config) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] as never }));
    };

    const fieldStyle = {
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-main)',
        padding: '12px',
        borderRadius: '8px',
        width: '100%',
        outline: 'none',
        transition: 'border 0.3s'
    };

    return (
        <div style={{ minHeight: '100vh', padding: '40px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <button
                    onClick={() => {
                        if (window.parent && typeof (window.parent as any).showMainPage === 'function') {
                            (window.parent as any).showMainPage();
                        }
                    }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>←</span> HOME
                </button>
                <Logo />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{
                    maxWidth: '800px',
                    margin: '80px auto 0',
                    padding: '40px',
                    borderTop: '2px solid var(--primary-glow)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0,255,255,0.05)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Settings className="glow-text-primary" size={28} />
                    <h2 style={{ fontSize: '28px', fontFamily: 'Satoshi' }}>Trace Configuration</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Network Filters */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                                <Activity size={18} className="glow-text-primary" /> Network
                            </label>
                            <select
                                style={fieldStyle}
                                value={config.network}
                                onChange={e => setConfig({ ...config, network: e.target.value as 'Mainnet' | 'Devnet' | 'Testnet' })}
                            >
                                <option value="Mainnet" style={{ background: '#0A0C0F' }}>Mainnet Beta</option>
                                <option value="Devnet" style={{ background: '#0A0C0F' }}>Devnet</option>
                                <option value="Testnet" style={{ background: '#0A0C0F' }}>Testnet</option>
                            </select>
                        </div>

                        {/* Block Range */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                                <Activity size={18} className="glow-text-accent" /> Block Range
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input
                                    type="text"
                                    placeholder="Start (e.g. 23400)"
                                    style={fieldStyle}
                                    value={config.blockStart}
                                    onChange={e => setConfig({ ...config, blockStart: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="End (e.g. latest)"
                                    style={fieldStyle}
                                    value={config.blockEnd}
                                    onChange={e => setConfig({ ...config, blockEnd: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Agent Scope */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                                <Shield size={18} className="glow-text-primary" /> Agent Scope
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['Transactions', 'Programs', 'Accounts'].map((scope) => {
                                    const key = `scope${scope}` as keyof typeof config;
                                    return (
                                        <div key={scope} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                            <span className="mono">{scope}</span>
                                            <div style={{ cursor: 'pointer' }} onClick={() => handleToggle(key)}>
                                                {config[key] ? <ToggleRight className="glow-text-primary" size={28} /> : <ToggleLeft color="var(--text-muted)" size={28} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Alert Rules & Advanced */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
                                    <Zap size={18} className="glow-text-accent" /> Alert Rules
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                                    <span style={{ flex: 1, fontSize: '14px' }}>Anomaly Threshold (%)</span>
                                    <input type="range" min="10" max="90" value={config.alertThreshold} onChange={e => setConfig({ ...config, alertThreshold: parseInt(e.target.value) })} style={{ flex: 1 }} />
                                    <span className="mono" style={{ color: 'var(--accent-glow)' }}>{config.alertThreshold}%</span>
                                </div>
                            </div>

                            <div
                                className={config.deepTrace ? "neon-border" : ""}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: config.deepTrace ? 'rgba(0, 255, 255, 0.05)' : 'rgba(0,0,0,0.2)', borderRadius: '8px', transition: 'all 0.3s' }}
                            >
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', color: config.deepTrace ? 'var(--primary-glow)' : 'var(--text-main)' }}>Deep Trace Mode</h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Enable intensive AI correlation across accounts.</p>
                                </div>
                                <div style={{ cursor: 'pointer' }} onClick={() => handleToggle('deepTrace')}>
                                    {config.deepTrace ? <ToggleRight className="glow-text-primary" size={32} /> : <ToggleLeft color="var(--text-muted)" size={32} />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API Access Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-muted)' }}>
                            <Zap size={18} className="glow-text-primary" /> API Access
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div title="Required for authenticated access to premium Solana RPC or analytics providers.">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>API Key</label>
                                <input
                                    type="password"
                                    placeholder="Enter your Solana RPC API Key"
                                    style={fieldStyle}
                                    value={config.apiKey}
                                    onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 12px var(--primary-glow)'}
                                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                                />
                            </div>
                            <div title="Override the default Solana node or analytics endpoint.">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Node Endpoint</label>
                                <input
                                    type="text"
                                    placeholder="https://api.mainnet-beta.solana.com"
                                    style={fieldStyle}
                                    value={config.nodeEndpoint}
                                    onChange={e => setConfig({ ...config, nodeEndpoint: e.target.value })}
                                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 12px var(--primary-glow)'}
                                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '16px 40px', fontSize: '16px' }}>
                            {loading ? 'Initializing Agent...' : 'Launch Dashboard'} <ArrowRight size={20} />
                        </button>
                    </div>
                </form>
            </motion.div>
        </div >
    );
};

export default TraceConfiguration;
