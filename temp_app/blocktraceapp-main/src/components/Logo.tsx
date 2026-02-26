import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
    const handleLogoClick = () => {
        if (window.parent && typeof (window.parent as any).showMainPage === 'function') {
            (window.parent as any).showMainPage();
        }
    };

    return (
        <div
            className={`flex items-center gap-3 ${className}`}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={handleLogoClick}
        >
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--primary-glow)',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <img
                    src="logo.png"
                    alt="BlockTrace Logo"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '18px', letterSpacing: '1px' }} className="glow-text-primary">
                    BlockTrace
                </span>
            </div>
        </div>
    );
};
