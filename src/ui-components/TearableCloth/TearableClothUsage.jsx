import React from 'react';
import { TearableCloth } from './TearableCloth';
import { Crown, Check, Star, Zap, Shield, Gem } from 'lucide-react';
export default function TearableClothUsage() {
    return (<div style={{
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative',
        }}>
      <TearableCloth gridSpacing={14} gravity={0.22} influenceRadius={38}>
        {/* Black + Gold Pricing UI revealed behind the velvet curtain */}
        <div style={{
            width: '100%',
            height: '100%',
            background: '#080808',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '2rem',
            textAlign: 'center',
            boxSizing: 'border-box',
            position: 'relative',
            color: '#f5f5f0',
            fontFamily: "'Outfit', 'Inter', sans-serif",
        }}>
          {/* Subtle gold radial glow */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, transparent 65%)',
            pointerEvents: 'none',
            zIndex: 0,
        }}/>

          {/* Content wrapper */}
          <div style={{
            zIndex: 2,
            maxWidth: '1000px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'goldFadeIn 0.8s ease-out',
        }}>
            {/* Header badge */}
            <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            color: '#d4af37',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            padding: '0.45rem 1.2rem',
            borderRadius: '9999px',
            marginBottom: '1.25rem',
        }}>
              <Crown size={13}/>
              Exclusive Membership
            </div>

            {/* Title */}
            <h1 style={{
            fontSize: 'clamp(1.8rem, 4.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #d4af37, #f5e6a3, #d4af37)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.6rem',
        }}>
              Choose Your Plan
            </h1>

            {/* Subtitle */}
            <p style={{
            color: '#6b6b60',
            fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
            maxWidth: '460px',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            letterSpacing: '0.02em',
        }}>
              Unlock premium features with plans crafted for every ambition.
            </p>

            {/* Pricing Cards */}
            <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
            width: '100%',
            maxWidth: '880px',
        }}>
              {/* --- STARTER --- */}
              <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '18px',
            padding: '2rem 1.5rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'border-color 0.3s ease',
        }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Zap size={18} style={{ color: '#8b8b80' }}/>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#8b8b80', fontWeight: 600 }}>Starter</span>
                </div>

                <div style={{ marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#e8e8e0' }}>$9</span>
                  <span style={{ fontSize: '0.85rem', color: '#5a5a50', marginLeft: '0.25rem' }}>/mo</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#5a5a50', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Perfect for individuals getting started.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem', flex: 1 }}>
                  {['5 Projects', '10GB Storage', 'Email Support', 'Basic Analytics'].map((f, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#9a9a90' }}>
                      <Check size={14} style={{ color: '#5a5a50', flexShrink: 0 }}/>
                      {f}
                    </div>))}
                </div>

                <button style={{
            width: '100%',
            padding: '0.7rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#c0c0b5',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            transition: 'all 0.2s ease',
        }}>
                  Get Started
                </button>
              </div>

              {/* --- PRO (Featured) --- */}
              <div style={{
            background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.06) 0%, rgba(212, 175, 55, 0.01) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '18px',
            padding: '2rem 1.5rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 0 40px rgba(212, 175, 55, 0.06), inset 0 1px 0 rgba(212, 175, 55, 0.15)',
            transform: 'scale(1.03)',
        }}>
                {/* Popular badge */}
                <div style={{
            position: 'absolute',
            top: '-0.6rem',
            right: '1.25rem',
            background: 'linear-gradient(135deg, #d4af37, #f5e6a3)',
            color: '#080808',
            fontSize: '0.6rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
        }}>
                  Most Popular
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Star size={18} style={{ color: '#d4af37' }}/>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#d4af37', fontWeight: 600 }}>Pro</span>
                </div>

                <div style={{ marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #d4af37, #f5e6a3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>$29</span>
                  <span style={{ fontSize: '0.85rem', color: '#8b7a3a', marginLeft: '0.25rem' }}>/mo</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#8b7a3a', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  For professionals who demand excellence.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem', flex: 1 }}>
                  {['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'Custom Domains', 'Team Collaboration'].map((f, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#c8b860' }}>
                      <Check size={14} style={{ color: '#d4af37', flexShrink: 0 }}/>
                      {f}
                    </div>))}
                </div>

                <button style={{
            width: '100%',
            padding: '0.7rem',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #d4af37, #c5a028)',
            color: '#080808',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            boxShadow: '0 4px 16px rgba(212, 175, 55, 0.25)',
            transition: 'all 0.2s ease',
        }}>
                  Upgrade to Pro
                </button>
              </div>

              {/* --- ENTERPRISE --- */}
              <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '18px',
            padding: '2rem 1.5rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'border-color 0.3s ease',
        }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Shield size={18} style={{ color: '#8b8b80' }}/>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#8b8b80', fontWeight: 600 }}>Enterprise</span>
                </div>

                <div style={{ marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#e8e8e0' }}>$79</span>
                  <span style={{ fontSize: '0.85rem', color: '#5a5a50', marginLeft: '0.25rem' }}>/mo</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#5a5a50', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Scale without limits. Full control.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem', flex: 1 }}>
                  {['Everything in Pro', '1TB Storage', '24/7 Dedicated Support', 'SSO & SAML', 'Custom SLA', 'Audit Logs'].map((f, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#9a9a90' }}>
                      <Check size={14} style={{ color: '#5a5a50', flexShrink: 0 }}/>
                      {f}
                    </div>))}
                </div>

                <button style={{
            width: '100%',
            padding: '0.7rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#c0c0b5',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            transition: 'all 0.2s ease',
        }}>
                  Contact Sales
                </button>
              </div>
            </div>

            {/* Bottom trust line */}
            <div style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#4a4a40',
            fontSize: '0.72rem',
            letterSpacing: '0.06em',
        }}>
              <Gem size={12} style={{ color: '#d4af37' }}/>
              <span>Trusted by 12,000+ teams worldwide</span>
              <span style={{ margin: '0 0.5rem', color: '#2a2a20' }}>•</span>
              <span>Cancel anytime</span>
              <span style={{ margin: '0 0.5rem', color: '#2a2a20' }}>•</span>
              <span>No hidden fees</span>
            </div>
          </div>
        </div>
      </TearableCloth>

      {/* Keyframe animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes goldFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }}/>
    </div>);
}
