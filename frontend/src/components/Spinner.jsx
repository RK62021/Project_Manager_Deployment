import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 'medium', fullPage = false }) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  const spinnerContent = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <Loader2 className="animate-spin" style={{ color: 'var(--primary)', width: size === 'small' ? '24px' : size === 'medium' ? '40px' : '64px', height: size === 'small' ? '24px' : size === 'medium' ? '40px' : '64px' }} />
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default Spinner;
