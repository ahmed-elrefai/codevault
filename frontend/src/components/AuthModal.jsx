import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = () => {
    const { modalOpen, setModalOpen, login, signup, resetPassword } = useAuth();
    const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    if (!modalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            if (mode === 'login') {
                await login(formData.email, formData.password);
            } else if (mode === 'signup') {
                await signup(formData.name, formData.email, formData.password);
            } else if (mode === 'forgot') {
                if (resetPassword) {
                    await resetPassword(formData.email);
                }
                setSuccess('If an account exists, a reset link has been sent to your email.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred.');
        }
    };

    const handleGoogleAuth = () => {
        // Redirect to backend Google OAuth endpoint
        window.location.href = 'http://localhost:8000/api/v1/auth/google/login';
    };

    return (
        <AnimatePresence>
            <div className="modal-overlay" style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
                backdropFilter: 'blur(5px)'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="modal-content" style={{
                        backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                        padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px',
                        position: 'relative'
                    }}
                >
                    <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>

                    <h2 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-primary)' }}>
                        {mode === 'login' && 'Welcome Back'}
                        {mode === 'signup' && 'Create Account'}
                        {mode === 'forgot' && 'Reset Password'}
                    </h2>

                    {error && <div style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-md)', fontSize: '0.9rem' }}>{error}</div>}
                    {success && <div style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-md)', fontSize: '0.9rem' }}>{success}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {mode === 'signup' && (
                            <input
                                type="text" placeholder="Full Name" required
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        )}
                        <input
                            type="email" placeholder="Email Address" required
                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        {mode !== 'forgot' && (
                            <input
                                type="password" placeholder="Password" required
                                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        )}
                        
                        {mode === 'login' && (
                            <div style={{ textAlign: 'right' }}>
                                <button type="button" onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }} className="btn-ghost" style={{ padding: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                    Forgot your password?
                                </button>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-sm)' }}>
                            {mode === 'login' && 'Login'}
                            {mode === 'signup' && 'Sign Up'}
                            {mode === 'forgot' && 'Send Reset Link'}
                        </button>
                    </form>

                    {mode !== 'forgot' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                                <span style={{ padding: '0 1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>OR</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                            </div>
                            
                            <button onClick={handleGoogleAuth} style={{
                                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                cursor: 'pointer', transition: 'background-color 0.2s', fontWeight: 600
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                            >
                                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                    <path fill="none" d="M0 0h48v48H0z"/>
                                </svg>
                                {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                            </button>
                        </>
                    )}

                    <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        {mode === 'login' ? (
                            <>Don't have an account? <button onClick={() => { setMode('signup'); setError(null); setSuccess(null); }} className="btn-ghost" style={{ padding: 0, color: 'var(--color-primary)', textDecoration: 'underline' }}>Sign Up</button></>
                        ) : mode === 'signup' ? (
                            <>Already have an account? <button onClick={() => { setMode('login'); setError(null); setSuccess(null); }} className="btn-ghost" style={{ padding: 0, color: 'var(--color-primary)', textDecoration: 'underline' }}>Login</button></>
                        ) : (
                            <button onClick={() => { setMode('login'); setError(null); setSuccess(null); }} className="btn-ghost" style={{ padding: 0, color: 'var(--color-primary)', textDecoration: 'underline' }}>Back to Login</button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
