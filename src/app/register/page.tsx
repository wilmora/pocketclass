'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await register(name, email, password, role);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.push(role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logoIcon}><GraduationCap size={24} /></div>
          <h1>Create your account</h1>
          <p>Start learning or teaching today</p>
        </div>

        <div className={styles.roleSwitcher}>
          <button className={`${styles.roleBtn} ${role === 'student' ? styles.roleBtnActive : ''}`} onClick={() => setRole('student')}>
            I want to learn
          </button>
          <button className={`${styles.roleBtn} ${role === 'instructor' ? styles.roleBtnActive : ''}`} onClick={() => setRole('instructor')}>
            I want to teach
          </button>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <User size={18} className={styles.inputIcon} />
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className={styles.input} required />
          </div>
          <div className={styles.inputGroup}>
            <Mail size={18} className={styles.inputIcon} />
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className={styles.input} required />
          </div>
          <div className={styles.inputGroup}>
            <Lock size={18} className={styles.inputIcon} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 8 characters)" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} required minLength={8} />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <><Loader2 size={18} className={styles.spinner} /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <div className={styles.socialBtns}>
          <button className={styles.socialBtn}>
            <span>G</span> Continue with Google
          </button>
        </div>

        <p className={styles.authFooter}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
