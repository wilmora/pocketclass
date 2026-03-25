'use client';

import Link from 'next/link';
import { Star, Users, BookOpen, Clock, MapPin } from 'lucide-react';
import { instructors } from '@/lib/mock-data';
import styles from './instructors.module.css';

export default function InstructorsPage() {
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
