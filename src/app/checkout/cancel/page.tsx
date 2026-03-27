'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutCancel() {
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
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <XCircle size={32} color="white" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Payment Cancelled
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
          No worries! Your payment was not processed. You can try again anytime.
        </p>
        <Link href="/courses" style={{
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
          <ArrowLeft size={18} /> Back to Courses
        </Link>
      </div>
    </div>
  );
}
