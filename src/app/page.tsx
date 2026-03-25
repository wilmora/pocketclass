'use client';

import Link from 'next/link';
import { ArrowRight, Play, Star, Users, BookOpen, Video, Zap, Shield, TrendingUp, ChevronRight } from 'lucide-react';
import { courses, instructors, categories, liveSessions } from '@/lib/mock-data';
import styles from './page.module.css';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} fill={i <= rating ? '#FDCB6E' : 'none'} stroke={i <= rating ? '#FDCB6E' : '#D1D5DB'} />
      ))}
    </span>
  );
}

export default function HomePage() {
  const featuredCourses = courses.filter(c => c.isFeatured).slice(0, 4);
  const topInstructors = instructors.slice(0, 4);

  return (
    <div className={styles.page}>
      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Zap size={14} /> New: Live sessions are here!
          </div>
          <h1 className={styles.heroTitle}>
            Learn from the <span className={styles.gradientText}>best minds</span> in the world
          </h1>
          <p className={styles.heroSubtitle}>
            Discover expert-led courses, join live training sessions, and level up your skills with personalized learning from top instructors.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/courses" className={styles.ctaPrimary}>
              Explore Courses <ArrowRight size={18} />
            </Link>
            <Link href="/register" className={styles.ctaSecondary}>
              <Play size={16} /> Start Teaching
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <strong>12,000+</strong>
              <span>Students</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <strong>450+</strong>
              <span>Courses</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <strong>148</strong>
              <span>Instructors</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <strong>4.9★</strong>
              <span>Avg Rating</span>
            </div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardVideo}>
              <Play size={40} />
            </div>
            <div className={styles.heroCardInfo}>
              <span className={styles.heroCardBadge}>Most Popular</span>
              <h3>React & TypeScript Masterclass</h3>
              <div className={styles.heroCardMeta}>
                <img src={instructors[0].avatar} alt="" className={styles.heroCardAvatar} />
                <span>{instructors[0].name}</span>
                <StarRating rating={5} />
              </div>
            </div>
          </div>
          <div className={styles.floatingCard + ' ' + styles.floatingCard1}>
            <Users size={18} /> <strong>2,840</strong> students enrolled
          </div>
          <div className={styles.floatingCard + ' ' + styles.floatingCard2}>
            <Star size={18} fill="#FDCB6E" stroke="#FDCB6E" /> <strong>4.9</strong> rating
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Explore Categories</h2>
          <p>Find exactly what you want to learn</p>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map(cat => (
            <Link href={`/courses?category=${encodeURIComponent(cat.name)}`} key={cat.name} className={styles.categoryCard}>
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <h4>{cat.name}</h4>
              <span className={styles.categoryCount}>{cat.count} courses</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURED COURSES ===== */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Featured Courses</h2>
            <p>Hand-picked by our team for exceptional quality</p>
          </div>
          <Link href="/courses" className={styles.viewAllLink}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.courseGrid}>
          {featuredCourses.map(course => (
            <Link href={`/courses/${course.id}`} key={course.id} className={styles.courseCard}>
              <div className={styles.courseThumbnail}>
                <div className={styles.courseThumbnailPlaceholder}>
                  <BookOpen size={32} />
                  <span>{course.category}</span>
                </div>
                {course.originalPrice && (
                  <span className={styles.courseBadge}>
                    {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              <div className={styles.courseBody}>
                <div className={styles.courseMeta}>
                  <span className={styles.courseLevel}>{course.level}</span>
                  <span className={styles.courseDuration}>{course.duration}</span>
                </div>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <p className={styles.courseDesc}>{course.shortDescription}</p>
                <div className={styles.courseInstructor}>
                  <img src={course.instructor.avatar} alt="" className={styles.courseInstructorAvatar} />
                  <span>{course.instructor.name}</span>
                </div>
                <div className={styles.courseFooter}>
                  <div className={styles.courseRating}>
                    <Star size={14} fill="#FDCB6E" stroke="#FDCB6E" />
                    <strong>{course.rating}</strong>
                    <span>({course.reviewCount})</span>
                  </div>
                  <div className={styles.coursePrice}>
                    <strong>${course.price}</strong>
                    {course.originalPrice && <span className={styles.courseOriginalPrice}>${course.originalPrice}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== LIVE SESSIONS ===== */}
      <section className={styles.section + ' ' + styles.sessionSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Upcoming Live Sessions</h2>
            <p>Join interactive sessions with expert instructors in real time</p>
          </div>
          <Link href="/sessions" className={styles.viewAllLink}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.sessionGrid}>
          {liveSessions.slice(0, 3).map(session => (
            <div key={session.id} className={styles.sessionCard}>
              <div className={styles.sessionBadge}>
                <Video size={14} /> Live Session
              </div>
              <h3 className={styles.sessionTitle}>{session.title}</h3>
              <p className={styles.sessionDesc}>{session.description}</p>
              <div className={styles.sessionMeta}>
                <div className={styles.sessionInstructor}>
                  <img src={session.instructor.avatar} alt="" className={styles.sessionAvatar} />
                  <span>{session.instructor.name}</span>
                </div>
                <div className={styles.sessionDetails}>
                  <span>📅 {session.date}</span>
                  <span>🕐 {session.time} {session.timezone}</span>
                  <span>⏱ {session.duration}</span>
                </div>
              </div>
              <div className={styles.sessionFooter}>
                <div className={styles.sessionSpots}>
                  <div className={styles.sessionSpotsBar}>
                    <div className={styles.sessionSpotsFill} style={{ width: `${(session.enrolledCount / session.maxParticipants) * 100}%` }} />
                  </div>
                  <span>{session.maxParticipants - session.enrolledCount} spots left</span>
                </div>
                <strong className={styles.sessionPrice}>${session.price}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TOP INSTRUCTORS ===== */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Top Instructors</h2>
            <p>Learn from industry leaders and experienced professionals</p>
          </div>
          <Link href="/instructors" className={styles.viewAllLink}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.instructorGrid}>
          {topInstructors.map(inst => (
            <Link href={`/instructors/${inst.id}`} key={inst.id} className={styles.instructorCard}>
              <img src={inst.avatar} alt={inst.name} className={styles.instructorAvatar} />
              <h4>{inst.name}</h4>
              <p className={styles.instructorExpertise}>{inst.expertise.slice(0, 2).join(' · ')}</p>
              <div className={styles.instructorStats}>
                <span><Star size={12} fill="#FDCB6E" stroke="#FDCB6E" /> {inst.rating}</span>
                <span><Users size={12} /> {inst.studentCount.toLocaleString()}</span>
                <span><BookOpen size={12} /> {inst.courseCount}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className={styles.section + ' ' + styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2>How Pocketclass Works</h2>
          <p>Start learning in three simple steps</p>
        </div>
        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Discover</h3>
            <p>Browse courses and instructors. Find the perfect match for your learning goals.</p>
          </div>
          <div className={styles.stepConnector} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Enroll</h3>
            <p>Purchase courses or book live sessions. Pay securely with your preferred method.</p>
          </div>
          <div className={styles.stepConnector} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Learn</h3>
            <p>Watch videos at your own pace, join live sessions, and chat with your instructor.</p>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaSectionInner}>
          <h2>Ready to share your expertise?</h2>
          <p>Join Pocketclass as an instructor and reach thousands of eager learners worldwide.</p>
          <Link href="/register" className={styles.ctaPrimary}>
            Become an Instructor <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
