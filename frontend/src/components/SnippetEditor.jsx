import React, { useState } from 'react';
import { Save, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

import { useNavigate } from 'react-router-dom';

const SnippetEditor = ({ code, onSave }) => {
    const navigate = useNavigate();
    const { user, setModalOpen } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(code);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user) {
            setModalOpen(true);
            return;
        }

        setSaving(true);
        try {
            if (!title.trim()) {
                alert('Please provide a title');
                setSaving(false);
                return;
            }

            await api.documents.create({
                title,
                content,
                owner_id: user.id
            });

            alert('Snippet saved successfully!');
            if (onSave) onSave();

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('Save failed', err);
            alert(`Failed to save: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <div style={{
                padding: 'var(--spacing-md)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-surface-hover)'
            }}>
                <input
                    type="text"
                    placeholder="Snippet Title (e.g. 'Binary Search')"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        width: '100%'
                    }}
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button onClick={copyToClipboard} className="btn btn-ghost" title="Copy code">
                        {copied ? <Check size={20} color="var(--color-success)" /> : <Copy size={20} />}
                    </button>
                    <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    spellCheck="false"
                    style={{
                        width: '100%',
                        minHeight: '400px',
                        backgroundColor: '#000', // Deep black for code
                        color: '#f8f8f2',
                        padding: 'var(--spacing-md)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        border: 'none',
                        resize: 'vertical'
                    }}
                />
            </div>
        </div>
    );
};

export default SnippetEditor;
