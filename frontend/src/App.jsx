import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useClerk, useAuth } from '@clerk/clerk-react';
import { setTokenFetcher } from './api/client';
import CodeDropZone from './components/CodeDropZone';
import SnippetEditor from './components/SnippetEditor';
import Dashboard from './components/Dashboard';
import SnippetLink from './components/SnippetLink';
import { Code, LogOut, User as UserIcon, Search, Zap, Shield, Video, GraduationCap, Users, Wallet, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => (
  <footer style={{
    borderTop: '1px solid var(--color-border)',
    padding: 'var(--spacing-xl) 0',
    marginTop: 'auto',
    backgroundColor: 'var(--color-background)'
  }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
      <div>
        &copy; {new Date().getFullYear()} CodeVault. All rights reserved.
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <Link to="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
        <Link to="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
        <Link to="#" style={{ color: 'inherit', textDecoration: 'none' }}>Twitter</Link>
      </div>
    </div>
  </footer>
);

const Layout = ({ children }) => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--spacing-md) 0',
        backgroundColor: 'var(--color-background)', // Solid background
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', textDecoration: 'none' }}>
            <div style={{ borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', width: '44px', height: '44px' }}>
              <img src="/logo.jpg" alt="CodeVault Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '-1px',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)'
            }}>
              CodeVault<span style={{ color: 'var(--color-primary)' }}>.</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            
            <SignedIn>
              <Link to="/dashboard" className="btn btn-ghost" style={{ color: location.pathname === '/dashboard' ? 'var(--color-primary)' : 'inherit' }}>
                Dashboard
              </Link>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }}></div>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-primary">Sign In</button>
              </SignInButton>
            </SignedOut>
            
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, padding: 'var(--spacing-xl) 0' }}>
        {children}
      </main>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div style={{
    padding: 'var(--spacing-lg)',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)'
  }}>
    <div style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-xs)' }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{description}</p>
  </div>
);

import { api } from './api/client';
import AnalysisResult from './components/AnalysisResult';

const HomePage = () => {
  const [code, setCode] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { user } = useUser();
  const { openSignIn } = useClerk();
  
  const [wordIndex, setWordIndex] = useState(0);
  const rotatingWords = ["clickable", "pasteable", "shareable"];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const formatDocs = (result) => {
    const { description, tags, time_complexity, space_complexity, language } = result;
    const lang = (language || 'javascript').toLowerCase();

    const isPythonStyle = ['python', 'ruby', 'shell', 'bash', 'yaml'].some(l => lang.includes(l));
    const isHtmlStyle = ['html', 'xml', 'markup'].some(l => lang.includes(l));

    if (isPythonStyle) {
      return `"""
AI GENERATED DOCUMENTATION
--------------------------
Description: ${description}
Complexity: Time: ${time_complexity} | Space: ${space_complexity}
Tags: ${(tags || []).map(t => '#' + t).join(' ')}
"""

`;
    } else if (isHtmlStyle) {
      return `<!--
AI GENERATED DOCUMENTATION
--------------------------
Description: ${description}
Complexity: Time: ${time_complexity} | Space: ${space_complexity}
Tags: ${(tags || []).map(t => '#' + t).join(' ')}
-->

`;
    } else {
      return `/**
 * AI GENERATED DOCUMENTATION
 * --------------------------
 * Description: ${description}
 * Complexity: Time: ${time_complexity} | Space: ${space_complexity}
 * Tags: ${(tags || []).map(t => '#' + t).join(' ')}
 */

`;
    }
  };

  const handleCodeDropped = async (droppedCode) => {
    if (!user) {
      alert("Please sign in to use the AI Documentor.");
      openSignIn();
      return;
    }

    setAnalyzing(true);
    try {
      // 1. Get API Key
      const key = await api.auth.getAnalyzerKey();

      // 2. Call AI Service
      const result = await api.ai.analyzeCode(droppedCode, key.token);

      const docString = formatDocs(result);
      setAnalysisResult(result);
      setCode(docString + droppedCode);
    } catch (error) {
      console.error("Analysis Failed:", error);
      alert("Failed to analyze code: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setCode(null);
    setAnalysisResult(null);
  }

  return (
    <div className="container">
      {!code ? (
        <div style={{ maxWidth: '1000px', margin: '4rem auto', textAlign: 'center', position: 'relative' }}>
          <div className="hero-glow" />
          {analyzing ? (
            <div style={{ padding: '4rem', color: 'var(--color-primary)' }}>
              <div className="spinner" style={{
                width: '48px', height: '48px',
                border: '4px solid rgba(255,255,255,0.1)',
                borderLeftColor: 'var(--color-primary)',
                borderRadius: '50%',
                margin: '0 auto 2rem',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h2>Validating with CodeVault AI...</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Extracting semantics, complexity, and tags.</p>
            </div>
          ) : (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: 'var(--spacing-lg)', lineHeight: 1.1, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3em', flexWrap: 'wrap' }}>
                Make your code
                <span style={{ position: 'relative', display: 'inline-block', width: '220px', textAlign: 'left' }}>
                  <AnimatePresence>
                    <motion.span
                      className="text-gradient-animated"
                      key={rotatingWords[wordIndex]}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ position: 'absolute', left: 0 }}
                    >
                      {rotatingWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                  <span style={{ visibility: 'hidden' }}>shareable</span>
                </span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '5rem', maxWidth: '700px', marginInline: 'auto', lineHeight: 1.6 }}>
                Drop a checkpoint link anywhere. Your audience clicks once, and the code is already in their clipboard.
              </p>
              <CodeDropZone onCodeDropped={handleCodeDropped} />

              <div style={{
                marginTop: '8rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                textAlign: 'left'
              }}>
                <FeatureCard
                  icon={<Search size={28} />}
                  title="Semantic Search"
                  description="Don't remember the exact function name? Just describe what it does, and we'll find it for you."
                />
                <FeatureCard
                  icon={<Zap size={28} />}
                  title="Lightning Fast"
                  description="Optimized for speed. Your snippets are indexed and ready to be pasted in milliseconds."
                />
                <FeatureCard
                  icon={<Shield size={28} />}
                  title="Secure Cloud"
                  description="Your code is your verified asset. We encrypt and store your snippets safely in the cloud."
                />
              </div>

              <div style={{
                marginTop: '10rem',
                textAlign: 'center',
                paddingBottom: '5rem'
              }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '4rem', letterSpacing: '-0.02em' }}>Why CodeVault?</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                  <FeatureCard
                    icon={<Video size={28} />}
                    title="Dev Content Creators"
                    description="Stop making your audience manually type code from your videos. Drop a CodeVault checkpoint link in your description so they can copy exactly what you wrote."
                  />
                  <FeatureCard
                    icon={<GraduationCap size={28} />}
                    title="Programming Tutors & Students"
                    description="Share assignments, examples, and boilerplate perfectly. CodeVault provides instantly accessible, formatted code that speeds up the learning process."
                  />
                  <FeatureCard
                    icon={<Users size={28} />}
                    title="Teams & Personal"
                    description="Create a centralized, secure repository for your team's most valuable snippets, scripts, and configurations. Never lose a crucial one-liner again."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button onClick={reset} className="btn btn-ghost" style={{ marginBottom: 'var(--spacing-md)' }}>← Drop new code</button>

          <AnalysisResult result={analysisResult} />

          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <SnippetEditor code={code} />
          </div>
        </div>
      )}
    </div>
  );
};

const AppContent = () => {
  const { getToken } = useAuth();
  
  useEffect(() => {
    setTokenFetcher(getToken);
  }, [getToken]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sn/:documentId" element={<SnippetLink />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
