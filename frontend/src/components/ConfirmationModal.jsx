import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            backdropFilter: 'blur(5px)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    {isDanger && <AlertTriangle size={48} color="var(--color-error)" style={{ marginBottom: 'var(--spacing-md)' }} />}
                    <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text)' }}>{title}</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>{message}</p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                    <button onClick={onCancel} className="btn btn-ghost" style={{ border: '1px solid var(--color-border)' }}>
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn"
                        style={{
                            backgroundColor: isDanger ? 'var(--color-error)' : 'var(--color-primary)',
                            color: isDanger ? '#fff' : 'var(--color-text-checked)'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ConfirmationModal;
