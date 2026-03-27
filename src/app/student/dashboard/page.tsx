'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useStudentStats, useCourses, useSessions } from '@/lib/hooks';
import { formatPrice } from '@/lib/pricing';
import { BookOpen, Clock, Play, MessageSquare, Calendar, TrendingUp, Star, ArrowRight } from 'lucide-react';
import styles from './dashboard.module.css';

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { stats, loading: statsLoading } = useStudentStats(user?.id || '');
  const { courses, loading: coursesLoading } = useCourses();
  const { sessions, loading: sessionsLoading } = useSessions();

  if (authLoading) {
    return <div className={styles.authPrompt}><h2>Loading...</h2></div>;
  }

  if (!isAuthenticated) {
    return <div className={styles.authPrompt}><h2>Please <Link href="/login">sign in</Link> to access your dashboard</h2></div>;
  }

  const enrolledCourses = courses.slice(0, 3);
  const upcomingSessions = sessions.slice(0, 2);

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
        {statsLoading ? (
          <>
            <div className={styles.statCard}><BookOpen size={24} className={styles.statIcon} /><div><strong>...</strong><span>Enrolled Courses</span></div></div>
            <div className={styles.statCard}><Clock size={24} className={styles.statIcon} /><div><strong>...</strong><span>Completed Lessons</span></div></div>
            <div className={styles.statCard}><TrendingUp size={24} className={styles.statIcon} /><div><strong>...</strong><span>Avg. Progress</span></div></div>
            <div className={styles.statCard}><Star size={24} className={styles.statIcon} /><div><strong>...</strong><span>Total Spent</span></div></div>
          </>
        ) : (
          <>
            <div className={styles.statCard}>
              <BookOpen size={24} className={styles.statIcon} />
              <div><strong>{stats.enrolledCourses}</strong><span>Enrolled Courses</span></div>
            </div>
            <div className={styles.statCard}>
              <Clock size={24} className={styles.statIcon} />
              <div><strong>{stats.completedLessons}</strong><span>Completed Lessons</span></div>
            </div>
            <div className={styles.statCard}>
              <TrendingUp size={24} className={styles.statIcon} />
              <div><strong>{stats.avgProgress}%</strong><span>Avg. Progress</span></div>
            </div>
            <div className={styles.statCard}>
              <Star size={24} className={styles.statIcon} />
              <div><strong>{formatPrice(stats.totalSpent)}</strong><span>Total Spent</span></div>
            </div>
          </>
        )}
      </div>

      <div className={styles.grid}>
        {/* Enrolled Courses */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>My Courses</h2>
            <Link href="/courses">View All</Link>
          </div>
          <div className={styles.courseList}>
            {coursesLoading ? (
              <div className={styles.enrolledCard}>
                <div className={styles.enrolledInfo}><h4>Loading courses...</h4></div>
              </div>
            ) : (
              enrolledCourses.map((course) => (
                <Link href={`/courses/${course.id}/learn`} key={course.id} className={styles.enrolledCard}>
                  <div className={styles.enrolledThumb}>
                    <BookOpen size={20} />
                  </div>
                  <div className={styles.enrolledInfo}>
                    <h4>{course.title}</h4>
                    <p>{course.instructor.name}</p>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${stats.avgProgress}%` }} />
                    </div>
                    <span className={styles.progressText}>{stats.avgProgress}% complete</span>
                  </div>
                  <Play size={18} className={styles.playIcon} />
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Upcoming Sessions */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Upcoming Sessions</h2>
            <Link href="/sessions">View All</Link>
          </div>
          <div className={styles.sessionList}>
            {sessionsLoading ? (
              <div className={styles.sessionCard}>
                <div className={styles.sessionInfo}><h4>Loading sessions...</h4></div>
              </div>
            ) : (
              upcomingSessions.map(session => (
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
              ))
            )}
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
