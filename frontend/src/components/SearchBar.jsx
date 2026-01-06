import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: '600px', margin: '0 0 var(--spacing-xl) 0' }}>
            <input
                type="text"
                placeholder="Search your snippets semantically (e.g. 'How to sort an array')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    width: '100%',
                    padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-2xl)', // Left padding for icon
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            />
            <button
                type="submit"
                style={{
                    position: 'absolute',
                    left: 'var(--spacing-sm)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: 'var(--spacing-xs)'
                }}
            >
                <Search size={20} />
            </button>
            {query && (
                <span style={{ position: 'absolute', right: 'var(--spacing-md)', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--color-primary)', pointerEvents: 'none' }}>
                    Semantic Search
                </span>
            )}
        </form>
    );
};

export default SearchBar;
