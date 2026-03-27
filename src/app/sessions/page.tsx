'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Calendar, Clock, Users, Star, MapPin } from 'lucide-react';
import { useSessions } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { PRICING, formatPrice } from '@/lib/pricing';
import styles from './sessions.module.css';

export default function SessionsPage() {
  const { sessions, loading } = useSessions();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string | null>(null);

  async function handleBook(session: (typeof sessions)[number]) {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    setBookingId(session.id);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ type: 'session', id: session.id, title: session.title }],
          userId: user.id,
          instructorId: session.instructor.id,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setBookingId(null);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Streaming Sessions</h1>
          <p>Join interactive, real-time sessions with expert instructors</p>
        </div>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.card} style={{ minHeight: 280, opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Streaming Sessions</h1>
        <p>Join interactive, real-time sessions with expert instructors</p>
      </div>
      <div className={styles.grid}>
        {sessions.map(session => (
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
                <strong>{formatPrice(PRICING.SESSION_PRICE)}</strong>
                <button
                  className={styles.bookBtn}
                  onClick={() => handleBook(session)}
                  disabled={bookingId === session.id}
                >
                  {bookingId === session.id ? 'Booking...' : 'Book Seat'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
