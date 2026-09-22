import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Check, Clock, HardDrive, Tag } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { parseSnippet } from '../utils/parseSnippet';
const SnippetLink = () => {
    const { documentId } = useParams();
    const [snippet, setSnippet] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [autoCopyAttempted, setAutoCopyAttempted] = useState(false);

    useEffect(() => {
        const fetchSnippet = async () => {
            try {
                // Not using api.request directly because we don't want to fail if unauthenticated 
                // in case it's a public snippet, though api.request handles token inclusion gracefully.
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
                const response = await fetch(`${API_BASE_URL}/api/v1/sn/${documentId}`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || 'Failed to fetch snippet');
                }
                const data = await response.json();
                setSnippet(data.snippet);
                
                try {
                    await navigator.clipboard.writeText(data.snippet);
                    setCopied(true);
                } catch(err) {
                    console.error("Failed to copy", err);
                    setCopied(false);
                } finally {
                    setAutoCopyAttempted(true);
                }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchSnippet();
    }, [documentId]);

    const handleManualCopy = async () => {
        if (snippet) {
            try {
                await navigator.clipboard.writeText(snippet);
                setCopied(true);
            } catch(err) {
                console.error("Failed to copy manually", err);
            }
        }
    };

    if (error) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    if (!snippet) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    const { metadata, code } = parseSnippet(snippet);

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {copied ? (
                    <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Snippet copied to clipboard!</h2>
                ) : autoCopyAttempted ? (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ color: 'var(--color-text)', marginBottom: '1rem' }}>Here is your snippet</h2>
                        <button onClick={handleManualCopy} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                            <Copy size={18} /> Copy to Clipboard
                        </button>
                    </div>
                ) : null}
            </div>

            {metadata && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px'
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>AI Documentation</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>{metadata.description}</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        {metadata.time_complexity && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 204, 0, 0.1)', color: '#FFcc00', padding: '4px 10px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                                <Clock size={14} /> Time: {metadata.time_complexity}
                            </div>
                        )}
                        {metadata.space_complexity && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 204, 255, 0.1)', color: '#00ccff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                                <HardDrive size={14} /> Space: {metadata.space_complexity}
                            </div>
                        )}
                    </div>
                    
                    {metadata.tags && metadata.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {metadata.tags.map((tag, i) => (
                                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-muted)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                    <Tag size={12} /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <SyntaxHighlighter
                    language="javascript"
                    style={atomDark}
                    showLineNumbers={true}
                    customStyle={{ margin: 0, padding: '1rem', background: 'rgba(0, 0, 0, 0.5)' }}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default SnippetLink;
