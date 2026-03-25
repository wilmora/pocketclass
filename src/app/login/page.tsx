'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import styles from './auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'instructor' | 'admin'>('student');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, role);
    switch (role) {
      case 'instructor': router.push('/instructor/dashboard'); break;
      case 'admin': router.push('/admin/dashboard'); break;
      default: router.push('/student/dashboard');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logoIcon}><GraduationCap size={24} /></div>
          <h1>Welcome back</h1>
          <p>Sign in to continue learning</p>
        </div>

        {/* Quick role switcher for demo */}
        <div className={styles.roleSwitcher}>
          <button className={`${styles.roleBtn} ${role === 'student' ? styles.roleBtnActive : ''}`} onClick={() => setRole('student')}>Student</button>
          <button className={`${styles.roleBtn} ${role === 'instructor' ? styles.roleBtnActive : ''}`} onClick={() => setRole('instructor')}>Instructor</button>
          <button className={`${styles.roleBtn} ${role === 'admin' ? styles.roleBtnActive : ''}`} onClick={() => setRole('admin')}>Admin</button>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <Mail size={18} className={styles.inputIcon} />
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <Lock size={18} className={styles.inputIcon} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className={styles.formOptions}>
            <label className={styles.checkbox}><input type="checkbox" /> Remember me</label>
            <Link href="#" className={styles.forgotLink}>Forgot password?</Link>
          </div>
          <button type="submit" className={styles.submitBtn}>Sign In</button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <div className={styles.socialBtns}>
          <button className={styles.socialBtn}>
            <span>G</span> Continue with Google
          </button>
        </div>

        <p className={styles.authFooter}>
          Don&apos;t have an account? <Link href="/register">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
