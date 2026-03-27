'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Users, BookOpen, Award, Target, Heart, Zap, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>About PocketClass</h1>
          <p className={styles.heroSubtitle}>
            Connecting expert instructors with passionate learners worldwide through innovative,
            flexible learning experiences.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <strong>10,000+</strong>
              <span>Students Learning</span>
            </div>
            <div className={styles.stat}>
              <strong>500+</strong>
              <span>Expert Instructors</span>
            </div>
            <div className={styles.stat}>
              <strong>1,200+</strong>
              <span>Courses & Sessions</span>
            </div>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.heroPlaceholder}>
            <Users size={64} />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.missionGrid}>
            <div className={styles.missionContent}>
              <h2>Our Mission</h2>
              <p>
                At PocketClass, we believe that quality education should be accessible to everyone,
                everywhere. Our mission is to democratize learning by connecting world-class instructors
                with curious minds, breaking down traditional barriers to education.
              </p>
              <p>
                We provide a flexible, pay-per-content model that allows learners to choose exactly
                what they want to learn, when they want to learn it, without being locked into
                expensive course packages.
              </p>
              <Link href="/courses" className={styles.ctaButton}>
                Explore Courses <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.missionValues}>
              <div className={styles.value}>
                <Target className={styles.valueIcon} />
                <h3>Accessibility</h3>
                <p>Learning should be available to anyone with internet access</p>
              </div>
              <div className={styles.value}>
                <Heart className={styles.valueIcon} />
                <h3>Quality</h3>
                <p>Only expert instructors with proven track records</p>
              </div>
              <div className={styles.value}>
                <Zap className={styles.valueIcon} />
                <h3>Flexibility</h3>
                <p>Learn at your own pace, choose your own path</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.section + ' ' + styles.grayBg}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>How PocketClass Works</h2>
            <p>Our unique approach makes learning more accessible and personalized</p>
          </div>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Free Enrollment</h3>
              <p>Browse and enroll in any course completely free. No upfront costs or commitments.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Choose Your Path</h3>
              <p>Select individual videos or topics you want to learn. Skip what you already know.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Pay Per Video</h3>
              <p>Only pay $2 per video you watch. Learn exactly what you need, nothing more.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <h3>Learn Forever</h3>
              <p>Lifetime access to everything you purchase. Revisit content anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>What Makes Us Different</h2>
            <p>We're not just another learning platform—we're reimagining education</p>
          </div>
          <div className={styles.differencesGrid}>
            <div className={styles.difference}>
              <div className={styles.differenceIcon}>
                <CheckCircle size={32} />
              </div>
              <h3>Pay-Per-Content Model</h3>
              <p>Unlike traditional platforms that charge hundreds for entire courses, we let you pay only for what you watch—$2 per video.</p>
            </div>
            <div className={styles.difference}>
              <div className={styles.differenceIcon}>
                <Users size={32} />
              </div>
              <h3>Flexible Learning Paths</h3>
              <p>Skip linear course structures. Choose exactly which topics and videos you want to learn, in any order.</p>
            </div>
            <div className={styles.difference}>
              <div className={styles.differenceIcon}>
                <Award size={32} />
              </div>
              <h3>Expert Instructors Only</h3>
              <p>Every instructor is carefully vetted for expertise and teaching ability. We maintain the highest quality standards.</p>
            </div>
            <div className={styles.difference}>
              <div className={styles.differenceIcon}>
                <Globe size={32} />
              </div>
              <h3>Global Community</h3>
              <p>Connect with learners and instructors from around the world. Learn from diverse perspectives and cultures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.section + ' ' + styles.grayBg}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Our Story</h2>
            <p>How PocketClass came to be</p>
          </div>
          <div className={styles.storyGrid}>
            <div className={styles.storyContent}>
              <h3>Founded in 2024</h3>
              <p>
                PocketClass was born from a simple observation: traditional online learning platforms
                were leaving many learners behind. High course prices created barriers, and rigid
                course structures didn't accommodate different learning styles.
              </p>
              <p>
                Our founders, a team of educators and technologists, set out to create a platform
                that puts learners first. We wanted to make quality education accessible to everyone,
                regardless of their budget or learning preferences.
              </p>
              <p>
                Today, PocketClass serves thousands of learners worldwide, offering flexible,
                affordable education that adapts to how people actually want to learn.
              </p>
            </div>
            <div className={styles.storyImage}>
              <div className={styles.storyPlaceholder}>
                <BookOpen size={48} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Ready to Start Learning?</h2>
            <p>Join thousands of learners who are already transforming their careers with PocketClass.</p>
            <div className={styles.ctaButtons}>
              <Link href="/courses" className={styles.primaryButton}>
                Browse Courses
              </Link>
              <Link href="/register" className={styles.secondaryButton}>
                Become an Instructor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}