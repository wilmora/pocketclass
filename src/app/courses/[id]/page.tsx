'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Star, Clock, Users, BookOpen, Play, CheckCircle, ChevronDown, ChevronRight, Lock, MessageSquare, Video, Award, ShieldCheck } from 'lucide-react';
import { reviews } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { useCourse } from '@/lib/hooks';
import { PRICING, formatPrice } from '@/lib/pricing';
import styles from './courseDetail.module.css';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { course, loading } = useCourse(params.id as string);
  const [openChapters, setOpenChapters] = useState<string[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Once course loads, open the first chapter by default
  if (course && openChapters.length === 0 && course.chapters.length > 0) {
    setOpenChapters([course.chapters[0].id]);
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>Loading course...</div>
      </div>
    );
  }

  if (!course) return <div className={styles.notFound}>Course not found</div>;

  const courseReviews = reviews.filter(r => r.courseId === course.id);
  const toggleChapter = (id: string) => {
    setOpenChapters(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const selectedCount = selectedVideos.size;
  const totalCost = selectedCount * PRICING.VIDEO_PRICE;

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setShowCheckout(true);
  };

  const handleStripeCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setCheckoutLoading(true);

    // Build items array from selected videos
    const items: { type: 'video'; id: string; title: string }[] = [];
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (selectedVideos.has(lesson.id)) {
          items.push({ type: 'video', id: lesson.id, title: lesson.title });
        }
      }
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          userId: user.id,
          instructorId: course.instructor.id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session. Please try again.');
        setCheckoutLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setCheckoutLoading(false);
    }
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
                          {lesson.type === 'video' ? (
                            <>
                              <input
                                type="checkbox"
                                checked={selectedVideos.has(lesson.id)}
                                onChange={() => toggleVideoSelection(lesson.id)}
                                className={styles.videoCheckbox}
                              />
                              <Play size={14} />
                            </>
                          ) : (
                            <BookOpen size={14} />
                          )}
                          <span className={styles.lessonTitle}>{lesson.title}</span>
                          {lesson.isFree && <span className={styles.freeBadge}>Free</span>}
                          {lesson.type === 'video' && !lesson.isFree && (
                            <span className={styles.videoPrice}>{formatPrice(PRICING.VIDEO_PRICE)}</span>
                          )}
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
                <span className={styles.mainPrice}>Free Enrollment</span>
                <span className={styles.videoPricing}>{formatPrice(PRICING.VIDEO_PRICE)} per video</span>
              </div>
              {selectedCount > 0 && (
                <div className={styles.selectionSummary}>
                  <p>{selectedCount} video{selectedCount !== 1 ? 's' : ''} selected</p>
                  <p className={styles.totalCost}>Total: {formatPrice(totalCost)}</p>
                </div>
              )}
              <button className={styles.enrollBtn} onClick={handleCheckoutClick}>
                {selectedCount > 0 ? `Purchase ${selectedCount} Video${selectedCount !== 1 ? 's' : ''}` : 'Select Videos to Start'}
              </button>
              <button className={styles.wishlistBtn}>Add to Wishlist</button>
              <ul className={styles.includes}>
                <li><Video size={16} /> Choose your own learning path</li>
                <li><BookOpen size={16} /> {course.lessonCount} lessons available</li>
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
              <div className={styles.selectedVideos}>
                <h5>Selected Videos ({selectedCount})</h5>
                {course.chapters.map(chapter =>
                  chapter.lessons
                    .filter(lesson => selectedVideos.has(lesson.id))
                    .map(lesson => (
                      <div key={lesson.id} className={styles.selectedVideo}>
                        <Play size={14} />
                        <span>{lesson.title}</span>
                        <span>{formatPrice(PRICING.VIDEO_PRICE)}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
            <div className={styles.paymentMethods}>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.5 }}>
                You pay {formatPrice(PRICING.VIDEO_PRICE)} per video. Only pay for the content you want -- no subscriptions, no hidden fees.
              </p>
            </div>
            <div className={styles.modalTotal}>
              <span>Total ({selectedCount} video{selectedCount !== 1 ? 's' : ''})</span>
              <strong>{formatPrice(totalCost)}</strong>
            </div>
            <button
              className={styles.payBtn}
              onClick={handleStripeCheckout}
              disabled={checkoutLoading || selectedCount === 0}
            >
              {checkoutLoading ? 'Redirecting to Stripe...' : `Pay with Stripe - ${formatPrice(totalCost)}`}
            </button>
            <p className={styles.secureNote}>
              <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
