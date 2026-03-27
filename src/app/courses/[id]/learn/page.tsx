'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Play, ChevronLeft, ChevronRight, CheckCircle, BookOpen, Clock, MessageSquare, List, X, Loader2, Video } from 'lucide-react';
import { useCourse } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import styles from './learn.module.css';

export default function LearnPage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const { course, loading } = useCourse(params.id as string);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLesson, setActiveLesson] = useState<string>('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize activeLesson once course loads
  if (course && !initialized) {
    const firstLessonId = course.chapters[0]?.lessons[0]?.id || '';
    if (firstLessonId) {
      setActiveLesson(firstLessonId);
    }
    setInitialized(true);
  }

  if (!isAuthenticated) {
    return <div className={styles.authPrompt}><h2>Please <Link href="/login">sign in</Link> to access this course</h2></div>;
  }

  if (loading) {
    return (
      <div className={styles.authPrompt}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
        <h2>Loading course...</h2>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!course) return <div className={styles.authPrompt}><h2>Course not found</h2></div>;

  const allLessons = course.chapters.flatMap(ch => ch.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson);
  const currentLesson = allLessons[currentIndex];
  const progress = allLessons.length > 0 ? Math.round((completedLessons.length / allLessons.length) * 100) : 0;

  const toggleComplete = (id: string) => {
    setCompletedLessons(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  return (
    <div className={styles.learnLayout}>
      {/* Video Area */}
      <div className={styles.mainContent}>
        <div className={styles.videoContainer}>
          {currentLesson?.videoUrl ? (
            <video
              key={currentLesson.id}
              controls
              autoPlay={false}
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
              src={currentLesson.videoUrl}
            >
              Your browser does not support the video element.
            </video>
          ) : (
            <div className={styles.videoPlaceholder}>
              <Video size={56} />
              <h3>{currentLesson?.title}</h3>
              <p>Video content will be available soon</p>
            </div>
          )}
        </div>

        <div className={styles.videoControls}>
          <button className={styles.navBtn} disabled={currentIndex <= 0} onClick={() => setActiveLesson(allLessons[currentIndex - 1].id)}>
            <ChevronLeft size={16} /> Previous
          </button>
          <button className={styles.completeBtn} onClick={() => toggleComplete(activeLesson)}>
            <CheckCircle size={16} /> {completedLessons.includes(activeLesson) ? 'Completed' : 'Mark Complete'}
          </button>
          <button className={styles.navBtn} disabled={currentIndex >= allLessons.length - 1} onClick={() => setActiveLesson(allLessons[currentIndex + 1].id)}>
            Next <ChevronRight size={16} />
          </button>
        </div>

        <div className={styles.lessonInfo}>
          <h2>{currentLesson?.title}</h2>
          <div className={styles.lessonMeta}>
            <span><Clock size={14} /> {currentLesson?.duration}</span>
            <span><BookOpen size={14} /> {course.title}</span>
          </div>
          <p className={styles.lessonDescription}>
            This lesson covers key concepts that will help you build a strong foundation. Follow along with the examples and practice on your own.
          </p>
        </div>
      </div>

      {/* Sidebar Toggle */}
      <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={18} /> : <List size={18} />}
      </button>

      {/* Course Sidebar */}
      {sidebarOpen && (
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Course Content</h3>
            <div className={styles.progressInfo}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span>{progress}% complete</span>
            </div>
          </div>

          <div className={styles.chapterList}>
            {course.chapters.map(chapter => (
              <div key={chapter.id} className={styles.chapter}>
                <div className={styles.chapterTitle}>{chapter.title}</div>
                {chapter.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    className={`${styles.lessonItem} ${lesson.id === activeLesson ? styles.lessonActive : ''}`}
                    onClick={() => setActiveLesson(lesson.id)}
                  >
                    {completedLessons.includes(lesson.id) ? (
                      <CheckCircle size={14} className={styles.completedIcon} />
                    ) : (
                      <Play size={14} />
                    )}
                    <span className={styles.lessonName}>{lesson.title}</span>
                    <span className={styles.lessonDuration}>{lesson.duration}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          <Link href="/messages" className={styles.chatLink}>
            <MessageSquare size={16} /> Message Instructor
          </Link>
        </aside>
      )}
    </div>
  );
}
