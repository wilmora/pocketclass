'use client';

import { Video, Calendar, Clock, Users, Star, MapPin } from 'lucide-react';
import { streamingSessions } from '@/lib/mock-data';
import styles from './sessions.module.css';

export default function SessionsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Streaming Sessions</h1>
        <p>Join interactive, real-time sessions with expert instructors</p>
      </div>
      <div className={styles.grid}>
        {streamingSessions.map(session => (
          <div key={session.id} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.badge}><Video size={14} /> Live</span>
              <span className={styles.category}>{session.category}</span>
            </div>
            <h3>{session.title}</h3>
            <p className={styles.desc}>{session.description}</p>
            <div className={styles.instructor}>
              <img src={session.instructor.avatar} alt="" />
              <div>
                <strong>{session.instructor.name}</strong>
                <span><Star size={12} fill="#FDCB6E" stroke="#FDCB6E" /> {session.instructor.rating}</span>
              </div>
            </div>
            <div className={styles.details}>
              <span><Calendar size={14} /> {session.date}</span>
              <span><Clock size={14} /> {session.time} {session.timezone}</span>
              <span><Users size={14} /> {session.enrolledCount}/{session.maxParticipants}</span>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.spots}>
                <div className={styles.spotsBar}><div className={styles.spotsFill} style={{ width: `${(session.enrolledCount / session.maxParticipants) * 100}%` }} /></div>
                <span>{session.maxParticipants - session.enrolledCount} spots left</span>
              </div>
              <div className={styles.priceAction}>
                <strong>${session.price}</strong>
                <button className={styles.bookBtn}>Book Seat</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
