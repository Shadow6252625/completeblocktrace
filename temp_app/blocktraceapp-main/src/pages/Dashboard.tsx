import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ConnectWallet } from '../components/ConnectWallet';
import { get_dashboard_state, subscribe, get_stream_config, set_stream_config, start_simulator, stop_simulator, type StreamConfig, type StreamSpeed } from '../lib/antigravity';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, FileText, Database, Server, Clock, Settings, ToggleRight, ToggleLeft } from 'lucide-react';

const StatCard = ({ title, value, icon, accent = false }: { title: string; value: string | number; icon: React.ReactNode; accent?: boolean }) => (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '12px', background: accent ? 'rgba(255, 182, 72, 0.1)' : 'rgba(0, 255, 255, 0.1)', borderRadius: '12px' }}>
            {icon}
        </div>
        <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h4>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'JetBrains Mono' }} className={accent ? "glow-text-accent" : "glow-text-primary"}>
                {value}
            </div>
        </div>
    </div>
);

const NodeVisualizer = ({ pulseTrigger }: { pulseTrigger: number }) => {
    const [nodes] = useState(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        xOffset: Math.random() * 20 - 10,
        yOffset: Math.random() * 20 - 10,
        duration: 2 + Math.random() * 2,
        size: 8 + Math.random() * 10,
        color: i % 3 === 0 ? 'var(--accent-glow)' : 'var(--primary-glow)'
    })));

    return (
        <div className="glass-panel relative" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={16} className="glow-text-primary" />
                <span style={{ fontSize: '14px', fontFamily: 'Satoshi' }}>Trace Topography</span>
            </div>

            {nodes.map((node) => (
                <motion.div
                    key={`${node.id}-${pulseTrigger}`}
                    animate={{
                        x: Math.sin(node.id) * 100 + node.xOffset,
                        y: Math.cos(node.id) * 100 + node.yOffset,
                        scale: [1, 1.4, 1],
                        opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                        duration: node.duration,
                        repeat: Infinity,
                        repeatType: 'reverse'
                    }}
                    style={{
                        position: 'absolute',
                        width: node.size,
                        height: node.size,
                        background: node.color,
                        boxShadow: `0 0 10px ${node.color}`,
                        borderRadius: '50%'
                    }}
                />
            ))}

            {/* Connection Lines (Pseudo-3D) */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.2 }}>
                <motion.circle cx="50%" cy="50%" r="80" stroke="var(--primary-glow)" strokeWidth="1" fill="none" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }} strokeDasharray="10 20" />
                <motion.circle cx="50%" cy="50%" r="120" stroke="var(--accent-glow)" strokeWidth="1" fill="none" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 30, ease: 'linear' }} strokeDasharray="5 15" />
            </svg>
        </div>
    );
};

export type DashboardData = {
    session: unknown;
    transactions: { id: string, hash: string, status: string, amount: number, block?: number, program?: string }[];
    alerts: { id: string, message: string, createdAt: string, severity?: string }[];
};

const Dashboard: React.FC = () => {
    const { sessionId } = useParams();
    const [data, setData] = useState<DashboardData | null>(null);
    const [networkStats, setNetworkStats] = useState({ tps: 3421, height: 235123400, confirmation: 99.8 });
    const [streamConfig, setStreamConfig] = useState<StreamConfig>({ enabled: true, speed: 'Medium', realMode: false });
    const [lastBlock, setLastBlock] = useState<number>(0);

    const toggleStream = () => {
        const newConf = { ...streamConfig, enabled: !streamConfig.enabled };
        setStreamConfig(newConf);
        set_stream_config(newConf);
    };

    const changeSpeed = (speed: StreamSpeed) => {
        const newConf = { ...streamConfig, speed };
        setStreamConfig(newConf);
        set_stream_config(newConf);
    };

    useEffect(() => {
        if (sessionId) {
            setTimeout(() => {
                setData(get_dashboard_state(sessionId) as unknown as DashboardData);
            }, 0);
        }
    }, [sessionId]);

    useEffect(() => {
        setTimeout(() => setStreamConfig(get_stream_config()), 0);
        start_simulator();

        const unsubTrace = subscribe('trace_updates', (v: unknown) => {
            const e = v as { type: string, data: { block: number, [key: string]: unknown } };
            if (e.type === 'transaction') {
                setLastBlock(e.data.block);
                setData(prev => {
                    if (!prev) return prev;
                    const newTx = e.data as unknown as DashboardData['transactions'][0];
                    const txs = [newTx, ...prev.transactions].slice(0, 20); // keep last 20
                    return { ...prev, transactions: txs };
                });
                setNetworkStats(prev => ({
                    tps: prev.tps + Math.floor(Math.random() * 50 - 20),
                    height: e.data.block || prev.height + 1,
                    confirmation: Math.min(100, prev.confirmation + (Math.random() * 0.1 - 0.05))
                }));
            }
        });

        const unsubAlerts = subscribe('anomaly_alerts', (v: unknown) => {
            const alert = v as { id: string, message: string, createdAt: string, severity?: string };
            setData(prev => {
                if (!prev) return prev;
                return { ...prev, alerts: [alert, ...prev.alerts].slice(0, 50) };
            });
        });

        const handleWalletConnect = () => {
            const current = get_stream_config();
            const upgraded = { ...current, realMode: true };
            set_stream_config(upgraded);
            setStreamConfig(upgraded);
        };

        window.addEventListener('wallet_connected', handleWalletConnect);

        return () => {
            unsubTrace();
            unsubAlerts();
            stop_simulator();
            window.removeEventListener('wallet_connected', handleWalletConnect);
        };
    }, []);

    if (!data) return <div className="p-8">Loading Agent Feed...</div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Navbar */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 40px',
                borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
                <ConnectWallet />
            </header>

            <main style={{ padding: '32px 40px', display: 'grid', gridTemplateColumns: '300px 1fr 350px', gap: '24px', flex: 1 }}>

                {/* Left Sidebar: Network & Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <StatCard title="Live TPS" value={networkStats.tps.toLocaleString()} icon={<Activity size={24} className="glow-text-primary" />} />
                    <StatCard title="Block Height" value={networkStats.height.toLocaleString()} icon={<Server size={24} className="glow-text-accent" />} accent={true} />

                    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                            <Settings size={18} className="glow-text-primary" />
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Mock Stream Settings</h3>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Enable Mock Stream</span>
                            <div style={{ cursor: 'pointer' }} onClick={toggleStream}>
                                {streamConfig.enabled ? <ToggleRight className="glow-text-primary" size={24} /> : <ToggleLeft color="var(--text-muted)" size={24} />}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Simulation Speed</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {(['Slow', 'Medium', 'Fast'] as StreamSpeed[]).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => changeSpeed(s)}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            background: streamConfig.speed === s ? 'var(--primary-glow)' : 'rgba(0,0,0,0.3)',
                                            color: streamConfig.speed === s ? '#000' : 'var(--text-muted)',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: streamConfig.speed === s ? 700 : 400
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-glow)' }}>
                            <ShieldAlert size={18} />
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Anomaly Detector</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                            {data.alerts.map((alert) => (
                                <div key={alert.id} style={{ background: 'rgba(255, 182, 72, 0.1)', padding: '12px', borderRadius: '8px', borderLeft: '2px solid var(--accent-glow)' }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--text-main)' }}>{alert.message}</p>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                                </div>
                            ))}
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', marginTop: '10px' }}>AI continuously monitoring...</p>
                        </div>
                    </div>
                </div>

                {/* Center: Visualizer & Trace Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <NodeVisualizer pulseTrigger={lastBlock} />

                    <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={18} className="glow-text-primary" /> Live Trace Feed
                        </h3>
                        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '12px' }}>
                            <AnimatePresence>
                                {data.transactions.map((tx) => (
                                    <motion.div
                                        key={tx.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'minmax(120px, 1fr) 100px 80px',
                                            alignItems: 'center',
                                            background: 'rgba(255,255,255,0.03)',
                                            padding: '12px 16px',
                                            borderRadius: '6px',
                                            border: '1px solid transparent',
                                            transition: 'border 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        whileHover={{ border: '1px solid var(--glass-border-glow)' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div className="mono" style={{ fontSize: '13px', color: 'var(--primary-glow)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.hash}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Block {tx.block} • {tx.program}</div>
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: tx.status === 'confirmed' || tx.status === 'Success' ? '#4CAF50' : '#F44336' }}>
                                            {tx.status}
                                        </div>
                                        <div style={{ fontSize: '14px', textAlign: 'right', fontFamily: 'JetBrains Mono' }}>{tx.amount} ◎</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Audit Trail */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-main)' }}>
                        <FileText size={18} />
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Audit Trail</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: 0, width: '1px', background: 'var(--glass-border)' }} />

                        {data.alerts.slice(0, 5).map((alert: { id: string, message: string, createdAt: string, severity?: string }) => (
                            <div key={'trail-' + alert.id} style={{ position: 'relative', paddingLeft: '32px' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '4px', width: '7px', height: '7px', borderRadius: '50%', background: alert.severity === 'Critical' || alert.severity === 'High' ? 'var(--accent-glow)' : 'var(--primary-glow)', boxShadow: `0 0 10px ${alert.severity === 'Critical' || alert.severity === 'High' ? 'var(--accent-glow)' : 'var(--primary-glow)'}` }} />
                                <p style={{ margin: '0 0 4px', fontSize: '13px' }}>{alert.message}</p>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> {new Date(alert.createdAt).toLocaleTimeString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;
