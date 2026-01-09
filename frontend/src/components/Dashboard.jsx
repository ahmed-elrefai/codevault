import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import DashboardGrid from './DashboardGrid';
import SearchBar from './SearchBar';
import ConfirmationModal from './ConfirmationModal';
import SnippetEditor from './SnippetEditor';
import { X } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [snippets, setSnippets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSnippet, setSelectedSnippet] = useState(null);
    const [snippetToDelete, setSnippetToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchSnippets = async () => {
        try {
            setLoading(true);
            const data = await api.documents.list();
            setSnippets(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load snippets', err);
            setLoading(false);
        }
    };

    const onRequestDelete = (id) => {
        setSnippetToDelete(id);
    }

    const confirmDelete = async () => {
        if (!snippetToDelete) return;
        try {
            await api.documents.delete(snippetToDelete);
            setSnippets(prev => prev.filter(s => s.id !== snippetToDelete));
            setSnippetToDelete(null);
        } catch (err) {
            alert('Failed to delete snippet');
            console.error(err);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filteredSnippets = React.useMemo(() => {
        if (!searchQuery) return snippets;
        const lowerQuery = searchQuery.toLowerCase();
        return snippets.filter(s =>
            s.title.toLowerCase().includes(lowerQuery) ||
            s.content.toLowerCase().includes(lowerQuery)
        );
    }, [snippets, searchQuery]);

    useEffect(() => {
        if (user) {
            fetchSnippets();
        }
    }, [user]);

    return (
        <div className="container" style={{ paddingBottom: 'var(--spacing-2xl)' }}>
            <header style={{ marginBottom: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)', background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Welcome back, {user?.name || 'Developer'}
                </h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Here are your saved code fragments.</p>
            </header>

            <SearchBar onSearch={handleSearch} />

            {loading ? (
                <div>Loading snippets...</div>
            ) : (
                <DashboardGrid snippets={filteredSnippets} onDelete={onRequestDelete} onView={setSelectedSnippet} />
            )}

            <ConfirmationModal
                isOpen={!!snippetToDelete}
                title="Delete Snippet?"
                message="Are you sure you want to delete this code snippet? This action cannot be undone."
                confirmText="Yes, Delete it"
                isDanger={true}
                onConfirm={confirmDelete}
                onCancel={() => setSnippetToDelete(null)}
            />

            {selectedSnippet && (
                <div className="modal-overlay" style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60,
                    backdropFilter: 'blur(5px)', padding: '2rem'
                }}>
                    <div style={{ width: '100%', maxWidth: '1000px', position: 'relative' }}>
                        <button
                            onClick={() => setSelectedSnippet(null)}
                            style={{
                                position: 'absolute', top: '-40px', right: 0,
                                background: 'none', border: 'none', color: '#fff', cursor: 'pointer'
                            }}
                        >
                            <X size={32} />
                        </button>
                        <SnippetEditor
                            code={selectedSnippet.content}
                            initialSnippet={selectedSnippet}
                            onSave={() => {
                                setSelectedSnippet(null);
                                fetchSnippets(); // Refresh after edit/save
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
