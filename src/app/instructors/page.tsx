'use client';

import Link from 'next/link';
import { Star, Users, BookOpen, Clock, MapPin } from 'lucide-react';
import { useInstructors } from '@/lib/hooks';
import styles from './instructors.module.css';

export default function InstructorsPage() {
  const { instructors, loading } = useInstructors();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Our Instructors</h1>
          <p>Learn from industry professionals and subject matter experts</p>
        </div>
        <div className={styles.grid}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.card} style={{ opacity: 0.5, pointerEvents: 'none' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e0e0e0', margin: '0 auto' }} />
              <h3 style={{ background: '#e0e0e0', height: 20, borderRadius: 4, width: '60%', margin: '12px auto' }}>&nbsp;</h3>
              <p style={{ background: '#e0e0e0', height: 40, borderRadius: 4 }}>&nbsp;</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Our Instructors</h1>
        <p>Learn from industry professionals and subject matter experts</p>
      </div>
      <div className={styles.grid}>
        {instructors.map(inst => (
          <Link href={`/instructors/${inst.id}`} key={inst.id} className={styles.card}>
            <img src={inst.avatar} alt={inst.name} className={styles.avatar} />
            <h3>{inst.name}</h3>
            <p className={styles.bio}>{inst.bio}</p>
            <div className={styles.tags}>
              {inst.expertise.slice(0, 3).map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
            <div className={styles.stats}>
              <span><Star size={14} fill="#FDCB6E" stroke="#FDCB6E" /> {inst.rating}</span>
              <span><Users size={14} /> {inst.studentCount.toLocaleString()}</span>
              <span><BookOpen size={14} /> {inst.courseCount} courses</span>
            </div>
            <div className={styles.rate}>
              <span>From <strong>${inst.hourlyRate}</strong>/hr</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
