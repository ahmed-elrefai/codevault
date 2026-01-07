import React from 'react';
import { Clock, HardDrive, Tag, FileCode, CheckCircle } from 'lucide-react';

const AnalysisResult = ({ result }) => {
    if (!result) return null;

    const { description, tags, language, time_complexity, space_complexity } = result;

    return (
        <div style={{
            marginTop: 'var(--spacing-2xl)',
            padding: 'var(--spacing-xl)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            animation: 'fadeIn 0.5s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ background: 'rgba(51, 255, 0, 0.1)', padding: '8px', borderRadius: '50%' }}>
                    <CheckCircle size={24} color="#33ff00" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Analysis Complete</h3>
            </div>

            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--spacing-sm)' }}>
                    Description
                </h4>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={16} /> Time Complexity
                    </h4>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FFcc00' }}>
                        {time_complexity || 'N/A'}
                    </div>
                </div>
                <div>
                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <HardDrive size={16} /> Space Complexity
                    </h4>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#00ccff' }}>
                        {space_complexity || 'N/A'}
                    </div>
                </div>
                <div>
                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileCode size={16} /> Language
                    </h4>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                        {language || 'Detected'}
                    </div>
                </div>
            </div>

            <div>
                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={16} /> Tags
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                    {tags && tags.map((tag, i) => (
                        <span key={i} style={{
                            padding: '4px 12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            color: 'var(--color-text-muted)'
                        }}>
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalysisResult;
