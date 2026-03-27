'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  BookOpen, Search, Bell, MessageSquare, Menu, X, User, LogOut,
  LayoutDashboard, ChevronDown, Video
} from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/courses?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'instructor': return '/instructor/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/student/dashboard';
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image 
            src="/Logomain.png" 
            alt="Pocketclass Logo"
            width={40}
            height={40}
            className={styles.logoImage}
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          <Link href="/courses" className={styles.navLink}>
            <BookOpen size={16} />
            Courses
          </Link>
          <Link href="/sessions" className={styles.navLink}>
            <Video size={16} />
            Streaming Sessions
          </Link>
          <Link href="/instructors" className={styles.navLink}>
            <User size={16} />
            Instructors
          </Link>
        </nav>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} onClick={handleSearch} style={{ cursor: 'pointer', pointerEvents: 'auto' }} />
          <input
            type="text"
            placeholder="Search courses, instructors..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        {/* Right Actions */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Link href="/messages" className={styles.iconBtn} title="Messages">
                <MessageSquare size={20} />
                <span className={styles.badge}>2</span>
              </Link>
              <button className={styles.iconBtn} title="Notifications">
                <Bell size={20} />
                <span className={styles.badge}>3</span>
              </button>
              <div className={styles.profileWrapper}>
                <button
                  className={styles.profileBtn}
                  onClick={() => setProfileDropdown(!profileDropdown)}
                >
                  <img src={user?.avatar} alt={user?.name} className={styles.avatar} />
                  <span className={styles.userName}>{user?.name}</span>
                  <ChevronDown size={14} />
                </button>
                {profileDropdown && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <img src={user?.avatar} alt={user?.name} className={styles.dropdownAvatar} />
                      <div>
                        <div className={styles.dropdownName}>{user?.name}</div>
                        <div className={styles.dropdownRole}>{user?.role}</div>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link href={getDashboardLink()} className={styles.dropdownItem} onClick={() => setProfileDropdown(false)}>
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link href="/messages" className={styles.dropdownItem} onClick={() => setProfileDropdown(false)}>
                      <MessageSquare size={16} /> Messages
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownItem} onClick={() => { logout(); setProfileDropdown(false); }}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginBtn}>Log In</Link>
              <Link href="/register" className={styles.signupBtn}>Sign Up Free</Link>
            </>
          )}
          <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/courses" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Courses</Link>
          <Link href="/sessions" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Streaming Sessions</Link>
          <Link href="/instructors" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Instructors</Link>
          {isAuthenticated ? (
            <>
              <Link href={getDashboardLink()} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link href="/messages" className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <button className={styles.mobileLogout} onClick={() => { logout(); setMobileMenuOpen(false); }}>Sign Out</button>
            </>
          ) : (
            <div className={styles.mobileAuthBtns}>
              <Link href="/login" className={styles.loginBtn} onClick={() => setMobileMenuOpen(false)}>Log In</Link>
              <Link href="/register" className={styles.signupBtn} onClick={() => setMobileMenuOpen(false)}>Sign Up Free</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
