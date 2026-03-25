'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Upload, Plus, Trash2, GripVertical, Save, Eye } from 'lucide-react';
import styles from './newCourse.module.css';

export default function NewCoursePage() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('beginner');
  const [price, setPrice] = useState('');
  const [chapters, setChapters] = useState([
    { id: '1', title: 'Introduction', lessons: [{ id: '1-1', title: 'Welcome to the course', type: 'video' }] }
  ]);

  if (!isAuthenticated || user?.role !== 'instructor') {
    return <div className={styles.authPrompt}><h2>Please <Link href="/login">sign in as an instructor</Link></h2></div>;
  }

  const addChapter = () => {
    const id = String(chapters.length + 1);
    setChapters([...chapters, { id, title: '', lessons: [] }]);
  };

  const addLesson = (chapterId: string) => {
    setChapters(chapters.map(ch =>
      ch.id === chapterId
        ? { ...ch, lessons: [...ch.lessons, { id: `${ch.id}-${ch.lessons.length + 1}`, title: '', type: 'video' }] }
        : ch
    ));
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/instructor/dashboard" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
        <h1>Create New Course</h1>
        <div className={styles.topActions}>
          <button className={styles.previewBtn}><Eye size={16} /> Preview</button>
          <button className={styles.publishBtn} onClick={() => alert('Course saved! (Demo)')}><Save size={16} /> Publish</button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className={styles.steps}>
        {['Course Info', 'Curriculum', 'Pricing'].map((s, i) => (
          <button key={s} className={`${styles.stepBtn} ${step === i + 1 ? styles.stepActive : ''} ${step > i + 1 ? styles.stepDone : ''}`} onClick={() => setStep(i + 1)}>
            <span className={styles.stepNum}>{i + 1}</span> {s}
          </button>
        ))}
      </div>

      {/* Step 1: Course Info */}
      {step === 1 && (
        <div className={styles.formCard}>
          <h2>Course Information</h2>
          <div className={styles.formGroup}>
            <label>Course Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Complete React Masterclass" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your course..." className={styles.textarea} rows={5} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={styles.select}>
                <option value="">Select category</option>
                <option value="Web Development">Web Development</option>
                <option value="Game Development">Game Development</option>
                <option value="Design">Design</option>
                <option value="Data Science">Data Science</option>
                <option value="Photography">Photography</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className={styles.select}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Thumbnail</label>
            <div className={styles.uploadArea}>
              <Upload size={24} />
              <p>Click to upload or drag & drop</p>
              <span>PNG, JPG up to 5MB</span>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.nextBtn} onClick={() => setStep(2)}>Next: Curriculum</button>
          </div>
        </div>
      )}

      {/* Step 2: Curriculum */}
      {step === 2 && (
        <div className={styles.formCard}>
          <h2>Course Curriculum</h2>
          <p className={styles.formHint}>Organize your course into chapters and lessons</p>
          <div className={styles.chapterList}>
            {chapters.map((chapter, ci) => (
              <div key={chapter.id} className={styles.chapterBlock}>
                <div className={styles.chapterHeader}>
                  <GripVertical size={16} className={styles.grip} />
                  <input type="text" value={chapter.title} onChange={e => { const nc = [...chapters]; nc[ci].title = e.target.value; setChapters(nc); }} placeholder="Chapter title" className={styles.chapterInput} />
                  <button className={styles.deleteBtn}><Trash2 size={14} /></button>
                </div>
                <div className={styles.lessonList}>
                  {chapter.lessons.map((lesson, li) => (
                    <div key={lesson.id} className={styles.lessonRow}>
                      <GripVertical size={14} className={styles.grip} />
                      <input type="text" value={lesson.title} onChange={e => { const nc = [...chapters]; nc[ci].lessons[li].title = e.target.value; setChapters(nc); }} placeholder="Lesson title" className={styles.lessonInput} />
                      <select value={lesson.type} onChange={e => { const nc = [...chapters]; nc[ci].lessons[li].type = e.target.value; setChapters(nc); }} className={styles.typeSelect}>
                        <option value="video">Video</option>
                        <option value="text">Text</option>
                        <option value="quiz">Quiz</option>
                      </select>
                      <button className={styles.uploadSmall}><Upload size={12} /></button>
                      <button className={styles.deleteBtn}><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <button className={styles.addLessonBtn} onClick={() => addLesson(chapter.id)}><Plus size={14} /> Add Lesson</button>
                </div>
              </div>
            ))}
          </div>
          <button className={styles.addChapterBtn} onClick={addChapter}><Plus size={16} /> Add Chapter</button>
          <div className={styles.formActions}>
            <button className={styles.backStepBtn} onClick={() => setStep(1)}>Back</button>
            <button className={styles.nextBtn} onClick={() => setStep(3)}>Next: Pricing</button>
          </div>
        </div>
      )}

      {/* Step 3: Pricing */}
      {step === 3 && (
        <div className={styles.formCard}>
          <h2>Pricing</h2>
          <div className={styles.formGroup}>
            <label>Course Price ($)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="49.99" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>Original Price (for showing discount)</label>
            <input type="number" placeholder="99.99 (optional)" className={styles.input} />
          </div>
          <div className={styles.formActions}>
            <button className={styles.backStepBtn} onClick={() => setStep(2)}>Back</button>
            <button className={styles.publishBtn} onClick={() => alert('Course published! (Demo)')}><Save size={16} /> Publish Course</button>
          </div>
        </div>
      )}
    </div>
  );
}
