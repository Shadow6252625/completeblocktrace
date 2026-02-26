import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/Logo';
import { ArrowRight } from 'lucide-react';

const LaunchGateway: React.FC = () => {
    const navigate = useNavigate();

    const handleBackToLanding = () => {
        // This is the most reliable way to tell the parent to close the dashboard
        if (window.parent && typeof (window.parent as any).showMainPage === 'function') {
            (window.parent as any).showMainPage();
        } else {
            // Standalone fallback
            window.location.href = '/';
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

            {/* Robust Back Button - Replaced the X from parent */}
            <button
                onClick={handleBackToLanding}
                style={{
                    position: 'absolute',
                    top: '32px',
                    left: '32px',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '1px',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.5)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
            >
                <span style={{ fontSize: '18px' }}>←</span> RETURN TO HOME
            </button>

            {/* Background glowing orbs */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: '400px',
                height: '400px',
                background: 'var(--primary-glow)',
                filter: 'blur(150px)',
                opacity: 0.15,
                borderRadius: '50%'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '20%',
                width: '400px',
                height: '400px',
                background: 'var(--accent-glow)',
                filter: 'blur(150px)',
                opacity: 0.15,
                borderRadius: '50%'
            }} />

            {/* Rotating Holographic Ring Animation */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    border: '1px solid rgba(0, 255, 255, 0.1)',
                    borderRadius: '50%',
                    borderTop: '1px solid var(--primary-glow)',
                    borderBottom: '1px solid var(--accent-glow)',
                    boxShadow: '0 0 40px rgba(0, 255, 255, 0.1), inset 0 0 40px rgba(255, 182, 72, 0.1)',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}
            >
                <div style={{ transform: 'scale(2)', marginBottom: '40px' }}>
                    <Logo />
                </div>

                <h1 style={{ fontFamily: 'Satoshi', fontSize: '32px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '60px', letterSpacing: '2px', textAlign: 'center' }}>
                    Visibility Across the <span className="glow-text-primary">Solana Chain</span>.
                </h1>

                <motion.button
                    onClick={() => navigate('/configure')}
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ padding: '16px 32px', fontSize: '16px' }}
                >
                    Begin Trace Setup <ArrowRight size={20} />
                </motion.button>
            </motion.div>
        </div>
    );
};

export default LaunchGateway;
