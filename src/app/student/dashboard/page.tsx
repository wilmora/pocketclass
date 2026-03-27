'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { BookOpen, Clock, Play, MessageSquare, Calendar, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { courses, streamingSessions } from '@/lib/mock-data';
import styles from './dashboard.module.css';

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div className={styles.authPrompt}><h2>Please <Link href="/login">sign in</Link> to access your dashboard</h2></div>;
  }

  const enrolledCourses = courses.slice(0, 3);
  const upcomingSessions = streamingSessions.slice(0, 2);

  return (
    <div className={styles.page}>
      <div className={styles.welcome}>
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Continue where you left off</p>
        </div>
        <Link href="/courses" className={styles.browseBtn}>Browse Courses <ArrowRight size={16} /></Link>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <BookOpen size={24} className={styles.statIcon} />
          <div><strong>3</strong><span>Enrolled Courses</span></div>
        </div>
        <div className={styles.statCard}>
          <Clock size={24} className={styles.statIcon} />
          <div><strong>24h</strong><span>Learning Time</span></div>
        </div>
        <div className={styles.statCard}>
          <TrendingUp size={24} className={styles.statIcon} />
          <div><strong>67%</strong><span>Avg. Progress</span></div>
        </div>
        <div className={styles.statCard}>
          <Star size={24} className={styles.statIcon} />
          <div><strong>2</strong><span>Certificates</span></div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Enrolled Courses */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>My Courses</h2>
            <Link href="/courses">View All</Link>
          </div>
          <div className={styles.courseList}>
            {enrolledCourses.map((course, i) => {
              const progress = [72, 45, 15][i];
              return (
                <Link href={`/courses/${course.id}/learn`} key={course.id} className={styles.enrolledCard}>
                  <div className={styles.enrolledThumb}>
                    <BookOpen size={20} />
                  </div>
                  <div className={styles.enrolledInfo}>
                    <h4>{course.title}</h4>
                    <p>{course.instructor.name}</p>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <span className={styles.progressText}>{progress}% complete</span>
                  </div>
                  <Play size={18} className={styles.playIcon} />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Upcoming Sessions */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Upcoming Sessions</h2>
            <Link href="/sessions">View All</Link>
          </div>
          <div className={styles.sessionList}>
            {upcomingSessions.map(session => (
              <div key={session.id} className={styles.sessionCard}>
                <div className={styles.sessionDate}>
                  <span>{new Date(session.date).toLocaleDateString('en', { month: 'short' })}</span>
                  <strong>{new Date(session.date).getDate()}</strong>
                </div>
                <div className={styles.sessionInfo}>
                  <h4>{session.title}</h4>
                  <p>{session.instructor.name} · {session.time} {session.timezone}</p>
                </div>
                <button className={styles.joinBtn}>Join</button>
              </div>
            ))}
          </div>

          <div className={styles.sectionHeader} style={{ marginTop: 'var(--space-8)' }}>
            <h2>Messages</h2>
            <Link href="/messages">View All</Link>
          </div>
          <Link href="/messages" className={styles.messagePreview}>
            <MessageSquare size={20} />
            <div>
              <strong>2 unread messages</strong>
              <p>Sarah Chen sent you a message</p>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
