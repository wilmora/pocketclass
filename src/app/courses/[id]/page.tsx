'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, Clock, Users, BookOpen, Play, CheckCircle, ChevronDown, ChevronRight, Lock, MessageSquare, Video, Award } from 'lucide-react';
import { courses, reviews } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import styles from './courseDetail.module.css';

export default function CourseDetailPage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const course = courses.find(c => c.id === params.id);
  const [openChapters, setOpenChapters] = useState<string[]>([course?.chapters[0]?.id || '']);
  const [showCheckout, setShowCheckout] = useState(false);

  if (!course) return <div className={styles.notFound}>Course not found</div>;

  const courseReviews = reviews.filter(r => r.courseId === course.id);
  const toggleChapter = (id: string) => {
    setOpenChapters(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.breadcrumb}>
            <Link href="/courses">Courses</Link> <ChevronRight size={14} /> <span>{course.category}</span>
          </div>
          <h1>{course.title}</h1>
          <p className={styles.heroDesc}>{course.description}</p>
          <div className={styles.heroMeta}>
            <span className={styles.rating}><Star size={16} fill="#FDCB6E" stroke="#FDCB6E" /> {course.rating} ({course.reviewCount} reviews)</span>
            <span><Users size={16} /> {course.studentCount.toLocaleString()} students</span>
            <span><Clock size={16} /> {course.duration}</span>
            <span><BookOpen size={16} /> {course.lessonCount} lessons</span>
          </div>
          <div className={styles.heroInstructor}>
            <img src={course.instructor.avatar} alt={course.instructor.name} />
            <div>
              <span>Created by</span>
              <Link href={`/instructors/${course.instructor.id}`}>{course.instructor.name}</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Main */}
        <div className={styles.main}>
          {/* What you'll learn */}
          <section className={styles.section}>
            <h2>What you&apos;ll learn</h2>
            <div className={styles.learnGrid}>
              {['Build production-ready applications', 'Master advanced patterns and best practices', 'Work with real-world projects and scenarios', 'Gain confidence for professional development', 'Understand core concepts deeply', 'Deploy and manage live applications'].map((item, i) => (
                <div key={i} className={styles.learnItem}>
                  <CheckCircle size={18} className={styles.checkIcon} /> <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Curriculum */}
          <section className={styles.section}>
            <h2>Course Curriculum</h2>
            <p className={styles.curriculumMeta}>{course.chapters.length} chapters · {course.lessonCount} lessons · {course.duration} total</p>
            <div className={styles.curriculum}>
              {course.chapters.map(chapter => (
                <div key={chapter.id} className={styles.chapter}>
                  <button className={styles.chapterHeader} onClick={() => toggleChapter(chapter.id)}>
                    {openChapters.includes(chapter.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span className={styles.chapterTitle}>{chapter.title}</span>
                    <span className={styles.chapterCount}>{chapter.lessons.length} lessons</span>
                  </button>
                  {openChapters.includes(chapter.id) && (
                    <div className={styles.lessonList}>
                      {chapter.lessons.map(lesson => (
                        <div key={lesson.id} className={styles.lessonItem}>
                          {lesson.type === 'video' ? <Play size={14} /> : <BookOpen size={14} />}
                          <span className={styles.lessonTitle}>{lesson.title}</span>
                          {lesson.isFree && <span className={styles.freeBadge}>Free</span>}
                          <span className={styles.lessonDuration}>{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className={styles.section}>
            <h2>Student Reviews</h2>
            <div className={styles.reviewList}>
              {courseReviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <img src={review.studentAvatar} alt="" className={styles.reviewAvatar} />
                    <div>
                      <strong>{review.studentName}</strong>
                      <div className={styles.reviewStars}>
                        {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= review.rating ? '#FDCB6E' : 'none'} stroke={i <= review.rating ? '#FDCB6E' : '#D1D5DB'} />)}
                      </div>
                    </div>
                    <span className={styles.reviewDate}>{review.createdAt}</span>
                  </div>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarPreview}>
              <Play size={40} />
              <span>Preview this course</span>
            </div>
            <div className={styles.sidebarBody}>
              <div className={styles.priceRow}>
                <span className={styles.mainPrice}>${course.price}</span>
                {course.originalPrice && <span className={styles.origPrice}>${course.originalPrice}</span>}
              </div>
              <button className={styles.enrollBtn} onClick={() => setShowCheckout(true)}>
                Enroll Now
              </button>
              <button className={styles.wishlistBtn}>Add to Wishlist</button>
              <ul className={styles.includes}>
                <li><Video size={16} /> {course.duration} of video content</li>
                <li><BookOpen size={16} /> {course.lessonCount} lessons</li>
                <li><Award size={16} /> Certificate of completion</li>
                <li><Clock size={16} /> Lifetime access</li>
                <li><MessageSquare size={16} /> Direct instructor messaging</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className={styles.modalOverlay} onClick={() => setShowCheckout(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Complete Your Purchase</h2>
            <div className={styles.modalCourse}>
              <h4>{course.title}</h4>
              <p>by {course.instructor.name}</p>
            </div>
            <div className={styles.paymentMethods}>
              <h3>Payment Method</h3>
              <label className={styles.paymentOption}>
                <input type="radio" name="payment" defaultChecked /> 💳 Credit / Debit Card
              </label>
              <label className={styles.paymentOption}>
                <input type="radio" name="payment" /> <span className={styles.paypalLogo}>PayPal</span>
              </label>
              <label className={styles.paymentOption}>
                <input type="radio" name="payment" /> 🏦 Bank Transfer / Interac
              </label>
            </div>
            <div className={styles.cardForm}>
              <input placeholder="Card number" className={styles.cardInput} />
              <div className={styles.cardRow}>
                <input placeholder="MM/YY" className={styles.cardInput} />
                <input placeholder="CVC" className={styles.cardInput} />
              </div>
            </div>
            <div className={styles.modalTotal}>
              <span>Total</span>
              <strong>${course.price}</strong>
            </div>
            <button className={styles.payBtn} onClick={() => { setShowCheckout(false); alert('Payment successful! (Demo)'); }}>
              Pay ${course.price}
            </button>
            <p className={styles.secureNote}>🔒 Secured with 256-bit encryption</p>
          </div>
        </div>
      )}
    </div>
  );
}
