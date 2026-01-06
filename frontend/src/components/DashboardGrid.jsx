import React from 'react';
import { motion } from 'framer-motion';
import { Code, Calendar, Trash2 } from 'lucide-react';

const DashboardGrid = ({ snippets, onDelete, onView }) => {
    if (!snippets || snippets.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                <p>No snippets found. Start by dropping some code!</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)'
        }}>
            {snippets.map((snippet, index) => (
                <motion.div
                    key={snippet.id || index}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onView && onView(snippet)}
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        cursor: 'pointer',
                        transition: 'border-color var(--transition-fast)',
                        position: 'relative' // For absolute positioning of delete buttom
                    }}
                    whileHover={{ borderColor: 'var(--color-primary)', y: -4 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--color-primary)' }}>
                                <Code size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                {snippet.title || 'Untitled Snippet'}
                            </h3>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                onDelete(snippet.id);
                            }}
                            className="btn-ghost"
                            style={{ color: 'var(--color-error)', padding: '4px' }}
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div style={{
                        backgroundColor: 'var(--color-bg)',
                        padding: 'var(--spacing-sm)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-md)',
                        height: '80px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {snippet.content.slice(0, 150)}...
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to bottom, transparent, var(--color-bg))' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        <Calendar size={14} />
                        <span>{new Date(snippet.updated_at || snippet.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default DashboardGrid;
