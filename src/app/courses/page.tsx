'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Star, BookOpen, ChevronDown } from 'lucide-react';
import { courses, categories } from '@/lib/mock-data';
import styles from './courses.module.css';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const filtered = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

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
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <p className={styles.resultCount}>{filtered.length} courses found</p>

      <div className={styles.courseGrid}>
        {filtered.map(course => (
          <Link href={`/courses/${course.id}`} key={course.id} className={styles.courseCard}>
            <div className={styles.thumbnail}>
              <div className={styles.thumbnailPlaceholder}>
                <BookOpen size={28} />
                <span>{course.category}</span>
              </div>
              {course.originalPrice && (
                <span className={styles.badge}>{Math.round((1 - course.price / course.originalPrice) * 100)}% OFF</span>
              )}
            </div>
            <div className={styles.body}>
              <div className={styles.meta}>
                <span className={styles.level}>{course.level}</span>
                <span className={styles.duration}>{course.duration}</span>
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
                  <span className={styles.videoPricing}>$2 per video</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
