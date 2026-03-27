'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star, BookOpen, Loader2 } from 'lucide-react';
import { useCourses } from '@/lib/hooks';
import { categories } from '@/lib/mock-data';
import { PRICING, formatPrice } from '@/lib/pricing';
import styles from './courses.module.css';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const { courses, loading } = useCourses({
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    level: selectedLevel !== 'All' ? selectedLevel : undefined,
    search: searchQuery || undefined,
    sort: sortBy,
  });

  // Apply sorting (hooks already sort in demo mode, but ensure it works)
  const sorted = useMemo(() => {
    const list = [...courses];
    switch (sortBy) {
      case 'rating': return list.sort((a, b) => b.rating - a.rating);
      case 'students':
      case 'popular': return list.sort((a, b) => b.studentCount - a.studentCount);
      case 'newest': return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default: return list;
    }
  }, [courses, sortBy]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Explore Courses</h1>
        <p>Discover {courses.length}+ courses from expert instructors</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={styles.searchInput} />
        </div>
        <div className={styles.filters}>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={styles.filterSelect}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} className={styles.filterSelect}>
            <option value="All">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={styles.filterSelect}>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <p className={styles.resultCount}>{sorted.length} courses found</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className={styles.courseGrid}>
          {sorted.map(course => (
            <Link href={`/courses/${course.id}`} key={course.id} className={styles.courseCard}>
              <div className={styles.thumbnail}>
                <div className={styles.thumbnailPlaceholder}>
                  <BookOpen size={28} />
                  <span>{course.category}</span>
                </div>
              </div>
              <div className={styles.body}>
                <div className={styles.meta}>
                  <span className={styles.level}>{course.level}</span>
                  <span className={styles.duration}>{course.lessonCount} lessons</span>
                </div>
                <h3>{course.title}</h3>
                <p className={styles.desc}>{course.shortDescription}</p>
                <div className={styles.instructor}>
                  <img src={course.instructor.avatar} alt="" />
                  <span>{course.instructor.name}</span>
                </div>
                <div className={styles.footer}>
                  <div className={styles.rating}>
                    <Star size={14} fill="#FDCB6E" stroke="#FDCB6E" />
                    <strong>{course.rating}</strong>
                    <span>({course.reviewCount})</span>
                  </div>
                  <div className={styles.price}>
                    <strong>Free Enrollment</strong>
                    <span className={styles.videoPricing}>{formatPrice(PRICING.VIDEO_PRICE)} per video</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
