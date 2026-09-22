import React, { useState } from 'react';
import { Save, Copy, Check } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { api } from '../api/client';
import { parseSnippet } from '../utils/parseSnippet';

import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

const SnippetEditor = ({ code, onSave, initialSnippet = null, hideMetadataDisplay = false }) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { openSignIn } = useClerk();
    const parsed = parseSnippet(initialSnippet?.content || code);
    const [title, setTitle] = useState(initialSnippet?.title || '');
    const [content, setContent] = useState(parsed.code);
    const [metadata, setMetadata] = useState(parsed.metadata);
    const [rawMetadata, setRawMetadata] = useState(parsed.rawMetadata);
    const [visibility, setVisibility] = useState(initialSnippet?.visibility || 'public');
    const [burnAfterRead, setBurnAfterRead] = useState(initialSnippet?.burn_after_read || false);
    const [expiration, setExpiration] = useState('never');
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);

    React.useEffect(() => {
        const saveShortcut = import.meta.env.VITE_SHORTCUT_SAVE_SNIPPET || 'Enter';
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === saveShortcut.toLowerCase()) {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [title, content, visibility, burnAfterRead, expiration, user]);

    const handleSave = async () => {
        if (!user) {
            openSignIn();
            return;
        }

        setSaving(true);
        try {
            if (!title.trim()) {
                toast.error('Please provide a title');
                setSaving(false);
                return;
            }

            const finalContent = rawMetadata ? `${rawMetadata}\n${content}` : content;
            
            let expires_at = null;
            if (expiration !== 'never') {
                const now = new Date();
                if (expiration === '1h') now.setHours(now.getHours() + 1);
                if (expiration === '24h') now.setHours(now.getHours() + 24);
                if (expiration === '7d') now.setDate(now.getDate() + 7);
                expires_at = now.toISOString();
            }

            if (initialSnippet && initialSnippet.id) {
                // Update existing
                await api.documents.update(initialSnippet.id, {
                    title,
                    content: finalContent,
                    visibility,
                    burn_after_read: burnAfterRead,
                    expires_at
                });
            } else {
                // Create new
                await api.documents.create({
                    title,
                    content: finalContent,
                    visibility,
                    burn_after_read: burnAfterRead,
                    expires_at
                });
            }

            toast.success('Snippet saved successfully!');
            if (onSave) onSave();

            // Redirect to dashboard only if creating new, or close modal if updating?
            if (!initialSnippet) {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Save failed', err);
            toast.error(`Failed to save: ${err.message}`);
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
                        width: '100%',
                        flexGrow: 1
                    }}
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', fontSize: '0.9rem', marginRight: '1rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={burnAfterRead} onChange={(e) => setBurnAfterRead(e.target.checked)} style={{ cursor: 'pointer' }} />
                        🔥 Burn
                    </label>
                    <select
                        value={expiration}
                        onChange={(e) => setExpiration(e.target.value)}
                        style={{
                            background: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            border: '1px solid var(--color-border)',
                            padding: '0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            outline: 'none',
                        }}
                    >
                        <option value="never">No Expiration</option>
                        <option value="1h">1 Hour</option>
                        <option value="24h">24 Hours</option>
                        <option value="7d">7 Days</option>
                    </select>
                    <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        style={{
                            background: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            border: '1px solid var(--color-border)',
                            padding: '0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            outline: 'none',
                            marginRight: '1rem'
                        }}
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                    <button onClick={copyToClipboard} className="btn btn-ghost" title="Copy code">
                        {copied ? <Check size={20} color="var(--color-success)" /> : <Copy size={20} />}
                    </button>
                    <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {!hideMetadataDisplay && metadata && (
                <div style={{
                    padding: '1rem var(--spacing-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid var(--color-border)',
                }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>AI Documentation (Read-Only)</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{metadata.description}</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {metadata.time_complexity && (
                            <span style={{ background: 'rgba(255, 204, 0, 0.1)', color: '#FFcc00', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                                Time: {metadata.time_complexity}
                            </span>
                        )}
                        {metadata.space_complexity && (
                            <span style={{ background: 'rgba(0, 204, 255, 0.1)', color: '#00ccff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                                Space: {metadata.space_complexity}
                            </span>
                        )}
                        {metadata.tags && metadata.tags.map((tag, i) => (
                            <span key={i} style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-muted)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ position: 'relative', height: '60vh', minHeight: '400px', maxHeight: '700px', overflowY: 'auto', backgroundColor: '#000' }}>
                <Editor
                    value={content}
                    onValueChange={code => setContent(code)}
                    highlight={code => {
                        const isPython = code.includes('def ') || code.includes('print(') || code.includes('import ') && !code.includes('const ') && !code.includes('let ');
                        const lang = isPython ? 'python' : 'javascript';
                        const grammar = isPython ? Prism.languages.python : Prism.languages.javascript;
                        return Prism.highlight(code, grammar, lang);
                    }}
                    padding={20}
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        backgroundColor: '#000', // Reverted to deep black
                        color: '#f8f8f2',
                        minHeight: '100%'
                    }}
                    textareaClassName="editor-textarea"
                />
            </div>
        </div>
    );
};

export default SnippetEditor;
