'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, BookOpen, ArrowRight } from 'lucide-react';

export default function CheckoutSuccess() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '480px',
        background: 'white',
        borderRadius: '1rem',
        padding: '3rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <CheckCircle size={32} color="white" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Payment Successful!
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
          Your content is now unlocked. Start learning right away or browse more courses.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/student/dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #6c5ce7, #5b4cdb)',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}>
            <BookOpen size={18} /> My Dashboard
          </Link>
          <Link href="/courses" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            border: '1px solid #e2e8f0',
            color: '#475569',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}>
            Browse Courses <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
