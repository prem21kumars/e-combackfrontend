import React from 'react';
import { useCart } from '../../context/CartContext';
import { CheckCircle2, Info } from 'lucide-react';

export const Toast = () => {
  const { notification } = useCart();

  if (!notification) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: '#1e293b',
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: '16px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.92rem',
        fontWeight: '600',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '380px',
      }}
    >
      <CheckCircle2 size={20} className="text-warning flex-shrink-0" />
      <span>{notification.message}</span>
    </div>
  );
};

export default Toast;
