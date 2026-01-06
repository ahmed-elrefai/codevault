import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = () => {
    const { modalOpen, setModalOpen, login, signup } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);

    if (!modalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await signup(formData.name, formData.email, formData.password);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
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

                    <h2 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-primary)' }}>{isLogin ? 'Login' : 'Sign Up'}</h2>

                    {error && <div style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-md)', fontSize: '0.9rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {!isLogin && (
                            <input
                                type="text" placeholder="Full Name" required
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        )}
                        <input
                            type="email" placeholder="Email Address" required
                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            type="password" placeholder="Password" required
                            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />

                        <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-sm)' }}>
                            {isLogin ? 'Login' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={toggleMode} className="btn-ghost" style={{ padding: 0, color: 'var(--color-primary)', textDecoration: 'underline' }}>
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
