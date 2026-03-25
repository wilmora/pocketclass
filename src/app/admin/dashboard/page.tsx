'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Users, BookOpen, DollarSign, TrendingUp, Activity, Search, MoreVertical, Shield, Ban, CheckCircle, Eye } from 'lucide-react';
import { courses, instructors, platformStats } from '@/lib/mock-data';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'payments'>('overview');

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className={styles.authPrompt}><h2>Please <Link href="/login">sign in as admin</Link></h2></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1>Admin Panel</h1>
          <p>Platform management and analytics</p>
        </div>
        <span className={styles.adminBadge}><Shield size={14} /> Admin</span>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['overview', 'users', 'courses', 'payments'] as const).map(tab => (
          <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}><Users size={24} className={styles.statIcon} /><div><strong>{platformStats.totalUsers.toLocaleString()}</strong><span>Total Users</span></div></div>
            <div className={styles.statCard}><BookOpen size={24} className={styles.statIcon} /><div><strong>{platformStats.totalCourses}</strong><span>Total Courses</span></div></div>
            <div className={styles.statCard + ' ' + styles.revenueCard}><DollarSign size={24} /><div><strong>${platformStats.totalRevenue.toLocaleString()}</strong><span>Total Revenue</span></div></div>
            <div className={styles.statCard}><Activity size={24} className={styles.statIcon} /><div><strong>{platformStats.activeSessionsToday}</strong><span>Live Sessions Today</span></div></div>
          </div>
          <div className={styles.overviewGrid}>
            <div className={styles.panel}>
              <h3>Monthly Growth</h3>
              <div className={styles.growthBars}>
                {[45, 62, 38, 71, 54, 82, 90, 78, 95, 68, 88, 93].map((h, i) => (
                  <div key={i} className={styles.growthBarWrapper}>
                    <div className={styles.growthBar} style={{ height: `${h}%` }} />
                    <span>{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.panel}>
              <h3>Quick Stats</h3>
              <div className={styles.quickStats}>
                <div><span>New Users (This Month)</span><strong>{platformStats.newUsersThisMonth.toLocaleString()}</strong></div>
                <div><span>Revenue (This Month)</span><strong>${platformStats.revenueThisMonth.toLocaleString()}</strong></div>
                <div><span>Active Instructors</span><strong>{platformStats.totalInstructors}</strong></div>
                <div><span>Active Students</span><strong>{platformStats.totalStudents.toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className={styles.tableContainer}>
          <div className={styles.tableToolbar}>
            <div className={styles.tableSearch}><Search size={16} /><input placeholder="Search users..." /></div>
          </div>
          <table className={styles.table}>
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {[...instructors.map(i => ({ ...i, status: 'active' as const })),
                { id: 's-1', name: 'Jordan Mitchell', email: 'jordan@email.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan', role: 'student' as const, status: 'active' as const, createdAt: '2024-06-01' },
                { id: 's-2', name: 'Taylor Green', email: 'taylor@email.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor', role: 'student' as const, status: 'active' as const, createdAt: '2024-08-15' },
              ].map(u => (
                <tr key={u.id}>
                  <td><div className={styles.userCell}><img src={u.avatar} alt="" /><div><strong>{u.name}</strong><span>{u.email}</span></div></div></td>
                  <td><span className={`${styles.roleBadge} ${styles['role_' + u.role]}`}>{u.role}</span></td>
                  <td><span className={styles.statusActive}><CheckCircle size={12} /> Active</span></td>
                  <td>{u.createdAt}</td>
                  <td><div className={styles.actionBtns}><button title="View"><Eye size={14} /></button><button title="Suspend"><Ban size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead><tr><th>Course</th><th>Instructor</th><th>Students</th><th>Rating</th><th>Revenue</th><th>Status</th></tr></thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.title}</strong></td>
                  <td>{c.instructor.name}</td>
                  <td>{c.studentCount.toLocaleString()}</td>
                  <td>⭐ {c.rating}</td>
                  <td>${(c.price * c.studentCount * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td><span className={styles.statusActive}><CheckCircle size={12} /> Published</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead><tr><th>Transaction ID</th><th>Student</th><th>Course</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {[
                { id: 'TXN-001', student: 'Jordan Mitchell', course: 'React Masterclass', amount: 79.99, method: 'Credit Card', date: '2025-03-20', status: 'completed' },
                { id: 'TXN-002', student: 'Taylor Green', course: 'Unity Game Dev', amount: 89.99, method: 'PayPal', date: '2025-03-19', status: 'completed' },
                { id: 'TXN-003', student: 'Alex Johnson', course: 'UI/UX Bootcamp', amount: 69.99, method: 'Bank Transfer', date: '2025-03-18', status: 'pending' },
                { id: 'TXN-004', student: 'Sam Wilson', course: 'ML A-Z', amount: 99.99, method: 'Credit Card', date: '2025-03-17', status: 'completed' },
              ].map(txn => (
                <tr key={txn.id}>
                  <td><code>{txn.id}</code></td>
                  <td>{txn.student}</td>
                  <td>{txn.course}</td>
                  <td><strong>${txn.amount}</strong></td>
                  <td>{txn.method}</td>
                  <td>{txn.date}</td>
                  <td><span className={txn.status === 'completed' ? styles.statusActive : styles.statusPending}>{txn.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
