'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, Users, BookOpen, Clock, MessageSquare, Globe, ExternalLink } from 'lucide-react';
import { useInstructor, useCourses } from '@/lib/hooks';
import styles from './profile.module.css';

export default function InstructorProfilePage() {
  const params = useParams();
  const { instructor, loading: instructorLoading } = useInstructor(params.id as string);
  const { courses, loading: coursesLoading } = useCourses();

  if (instructorLoading || coursesLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.profileHeader} style={{ opacity: 0.5 }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#e0e0e0' }} />
          <div className={styles.profileInfo}>
            <h1 style={{ background: '#e0e0e0', height: 28, borderRadius: 4, width: '40%' }}>&nbsp;</h1>
            <p style={{ background: '#e0e0e0', height: 40, borderRadius: 4, marginTop: 12 }}>&nbsp;</p>
          </div>
        </div>
      </div>
    );
  }

  if (!instructor) return <div className={styles.notFound}>Instructor not found</div>;

  const instructorCourses = courses.filter(c => c.instructor.id === instructor.id);

  return (
    <div className={styles.page}>
      <div className={styles.profileHeader}>
        <img src={instructor.avatar} alt={instructor.name} className={styles.avatar} />
        <div className={styles.profileInfo}>
          <h1>{instructor.name}</h1>
          <p className={styles.bio}>{instructor.bio}</p>
          <div className={styles.tags}>
            {instructor.expertise.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
          </div>
          <div className={styles.stats}>
            <span><Star size={16} fill="#FDCB6E" stroke="#FDCB6E" /> {instructor.rating} ({instructor.reviewCount} reviews)</span>
            <span><Users size={16} /> {instructor.studentCount.toLocaleString()} students</span>
            <span><BookOpen size={16} /> {instructor.courseCount} courses</span>
          </div>
          <div className={styles.actions}>
            <Link href="/messages" className={styles.msgBtn}><MessageSquare size={16} /> Message</Link>
            <span className={styles.rate}>${instructor.hourlyRate}/hr</span>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <h2>Courses by {instructor.name}</h2>
        <div className={styles.courseGrid}>
          {instructorCourses.map(course => (
            <Link href={`/courses/${course.id}`} key={course.id} className={styles.courseCard}>
              <div className={styles.thumbnail}><BookOpen size={24} /><span>{course.category}</span></div>
              <div className={styles.courseBody}>
                <h3>{course.title}</h3>
                <p>{course.shortDescription}</p>
                <div className={styles.courseMeta}>
                  <span><Star size={12} fill="#FDCB6E" stroke="#FDCB6E" /> {course.rating}</span>
                  <span>{course.duration}</span>
                  <strong>${course.price}</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
