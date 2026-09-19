import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';

const SnippetLink = () => {
    const { documentId } = useParams();
    const [snippet, setSnippet] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSnippet = async () => {
            try {
                // Not using api.request directly because we don't want to fail if unauthenticated 
                // in case it's a public snippet, though api.request handles token inclusion gracefully.
                // However, our endpoint might be public.
                const response = await fetch(`http://localhost:8000/api/v1/sn/${documentId}`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || 'Failed to fetch snippet');
                }
                const data = await response.json();
                setSnippet(data.snippet);
                
                try {
                    await navigator.clipboard.writeText(data.snippet);
                } catch(err) {
                    console.error("Failed to copy", err);
                }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchSnippet();
    }, [documentId]);

    if (error) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    if (!snippet) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Snippet copied to clipboard!</h2>
            <pre style={{ textAlign: 'left', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', border: '1px solid var(--color-border)' }}>
                <code>{snippet}</code>
            </pre>
        </div>
    );
};

export default SnippetLink;
