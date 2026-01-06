import React, { useState, useCallback } from 'react';
import { Upload, FileCode } from 'lucide-react';
import { motion } from 'framer-motion';

const CodeDropZone = ({ onCodeDropped }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                onCodeDropped(event.target.result);
            };
            reader.readAsText(file);
        } else {
            const text = e.dataTransfer.getData('text');
            if (text) onCodeDropped(text);
        }
    }, [onCodeDropped]);

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) onCodeDropped(text);
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    }, [onCodeDropped]);

    return (
        <motion.div
            layout
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handlePaste}
            animate={{
                borderColor: isDragging ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: isDragging ? 'rgba(255, 215, 0, 0.05)' : 'var(--color-surface)',
                scale: isDragging ? 1.02 : 1
            }}
            style={{
                borderWidth: '2px',
                borderStyle: 'dashed',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-2xl)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                minHeight: '300px',
                transition: 'all var(--transition-normal)',
                color: 'var(--color-text-muted)'
            }}
        >
            <motion.div
                animate={{ y: isDragging ? -10 : 0 }}
                style={{ marginBottom: 'var(--spacing-md)', color: isDragging ? 'var(--color-primary)' : 'inherit' }}
            >
                {isDragging ? <FileCode size={64} /> : <Upload size={64} />}
            </motion.div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text)' }}>
                {isDragging ? 'Drop it like it\'s hot!' : 'Drop code here'}
            </h3>
            <p style={{ textAlign: 'center' }}>
                Drag & drop a file, or click to paste from clipboard
            </p>
        </motion.div>
    );
};

export default CodeDropZone;
