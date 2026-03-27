'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DollarSign, Users, BookOpen, Video, Plus, TrendingUp, Star, Calendar, ArrowRight, BarChart3, Settings } from 'lucide-react';
import { courses, streamingSessions } from '@/lib/mock-data';
import styles from './instDash.module.css';

export default function InstructorDashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== 'instructor') {
    return <div className={styles.authPrompt}><h2>Please <Link href="/login">sign in as an instructor</Link></h2></div>;
  }

  const myCourses = courses.slice(0, 4);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1>Instructor Dashboard</h1>
          <p>Manage your courses, sessions, and earnings</p>
        </div>
        <div className={styles.topActions}>
          <Link href="/instructor/courses/new" className={styles.createBtn}><Plus size={16} /> Create Course</Link>
          <Link href="/instructor/sessions" className={styles.sessionBtn}><Calendar size={16} /> Schedule Session</Link>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard + ' ' + styles.revenue}>
          <DollarSign size={24} />
          <div><strong>$12,450</strong><span>Total Revenue</span></div>
          <span className={styles.trend}>+18% ↑</span>
        </div>
        <div className={styles.statCard}>
          <Users size={24} />
          <div><strong>2,840</strong><span>Total Students</span></div>
        </div>
        <div className={styles.statCard}>
          <BookOpen size={24} />
          <div><strong>8</strong><span>Active Courses</span></div>
        </div>
        <div className={styles.statCard}>
          <Star size={24} />
          <div><strong>4.9</strong><span>Avg Rating</span></div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* My Courses */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>My Courses</h2>
            <Link href="/instructor/courses/new">+ New Course</Link>
          </div>
          <div className={styles.courseTable}>
            <div className={styles.tableHeader}>
              <span>Course</span><span>Students</span><span>Rating</span><span>Revenue</span><span>Status</span>
            </div>
            {myCourses.map((course, i) => (
              <div key={course.id} className={styles.tableRow}>
                <div className={styles.courseCell}>
                  <div className={styles.courseThumb}><BookOpen size={16} /></div>
                  <div>
                    <strong>{course.title}</strong>
                    <span>{course.category}</span>
                  </div>
                </div>
                <span>{course.studentCount.toLocaleString()}</span>
                <span><Star size={12} fill="#FDCB6E" stroke="#FDCB6E" /> {course.rating}</span>
                <span>${(course.price * course.studentCount * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className={styles.statusBadge + ' ' + styles.statusPublished}>Published</span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Side */}
        <div className={styles.rightCol}>
          {/* Earnings Chart Placeholder */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Earnings Overview</h2>
            <div className={styles.chartPlaceholder}>
              <BarChart3 size={40} />
              <p>Revenue chart coming soon</p>
              <div className={styles.chartBars}>
                {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                  <div key={i} className={styles.chartBar} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.actionList}>
              <Link href="/instructor/courses/new" className={styles.actionItem}>
                <Plus size={18} /> Create a new course
              </Link>
              <Link href="/instructor/sessions" className={styles.actionItem}>
                <Video size={18} /> Schedule streaming session
              </Link>
              <Link href="/messages" className={styles.actionItem}>
                <Users size={18} /> View student messages
              </Link>
              <Link href="/instructor/profile" className={styles.actionItem}>
                <Settings size={18} /> Edit your profile
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
