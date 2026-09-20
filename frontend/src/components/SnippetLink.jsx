import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';

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

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
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
            <pre style={{ textAlign: 'left', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', border: '1px solid var(--color-border)' }}>
                <code>{snippet}</code>
            </pre>
        </div>
    );
};

export default SnippetLink;
