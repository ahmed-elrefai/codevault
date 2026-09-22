import React from 'react';
import { Shield, Zap, Users, Code, ExternalLink, Github, Facebook, Youtube, Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '4rem auto', color: 'var(--color-text)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center', letterSpacing: '-0.02em' }}>
          About <span style={{ color: 'var(--color-primary)' }}>CodeVault</span>
        </h1>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)' }}>What is CodeVault?</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            CodeVault is a platform engineered specifically for developers, content creators, and educators to share code snippets flawlessly. Say goodbye to messy unformatted text in video descriptions or disorganized gists. 
          </p>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            With a single click, your audience can grab beautifully formatted, AI-documented code directly into their clipboard, empowering seamless knowledge transfer and reducing friction for learners and collaborators alike.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <Zap size={32} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.5rem' }}>Lightning Fast Sharing</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Drop your code, get a link, and share it instantly. Everything is indexed for semantic search and immediately accessible.
            </p>
          </div>
          <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <Code size={32} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.5rem' }}>AI-Powered Context</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Our built-in AI automatically documents your code, calculates complexities, and extracts relevant tags so you don't have to.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '3rem', background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Meet the Creator</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              border: '3px solid var(--color-primary)',
              marginBottom: '1.5rem'
            }}>
              <img src="/ahmed-elrefai.png" alt="Ahmed Elrefai" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ahmed Elrefai</h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0.5rem auto 1.5rem', lineHeight: 1.6 }}>
              Passionate about creating tools that empower the developer community and streamline education.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <a href="mailto:elrefaayahmed196@gmail.com" title="Email Ahmed" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', transition: 'color 0.2s' }}>
                <Mail size={24} />
              </a>
              <a href="https://www.youtube.com/@ibnalrefai" title="Ahmed's YouTube" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', transition: 'color 0.2s' }}>
                <Youtube size={24} />
              </a>
              <a href="https://www.linkedin.com/in/ahmed-elrefai" title="Ahmed's LinkedIn" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', transition: 'color 0.2s' }}>
                <Linkedin size={24} />
              </a>
            </div>

            <div style={{ width: '50px', height: '2px', background: 'var(--color-border)', marginBottom: '2.5rem' }}></div>

            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Powered by E5traat</h4>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="https://www.facebook.com/profile.php?id=61554362476535" title="E5traat Facebook Page" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text)', transition: 'color 0.2s' }}>
                <Facebook size={24} />
              </a>
            </div>
            
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default About;
