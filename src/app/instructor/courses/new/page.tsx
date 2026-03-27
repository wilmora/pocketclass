'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Upload, Plus, Trash2, GripVertical, Save, Eye } from 'lucide-react';
import styles from './newCourse.module.css';

interface Lesson {
  id: string;
  title: string;
  type: string;
  videoFile?: File | null;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function NewCoursePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('beginner');
  const [price, setPrice] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: '1', title: 'Introduction', lessons: [{ id: '1-1', title: 'Welcome to the course', type: 'video', videoFile: null }] }
  ]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

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
        ? { ...ch, lessons: [...ch.lessons, { id: `${ch.id}-${ch.lessons.length + 1}`, title: '', type: 'video', videoFile: null }] }
        : ch
    ));
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (chapterIndex: number, lessonIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const nc = [...chapters];
    nc[chapterIndex] = {
      ...nc[chapterIndex],
      lessons: nc[chapterIndex].lessons.map((l, li) =>
        li === lessonIndex ? { ...l, videoFile: file } : l
      ),
    };
    setChapters(nc);
  };

  const deleteChapter = (chapterIndex: number) => {
    setChapters(chapters.filter((_, i) => i !== chapterIndex));
  };

  const deleteLesson = (chapterIndex: number, lessonIndex: number) => {
    const nc = [...chapters];
    nc[chapterIndex] = {
      ...nc[chapterIndex],
      lessons: nc[chapterIndex].lessons.filter((_, li) => li !== lessonIndex),
    };
    setChapters(nc);
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'Course title is required.';
    if (!description.trim()) return 'Course description is required.';
    if (!category) return 'Please select a category.';
    if (chapters.length === 0) return 'At least one chapter is required.';
    const hasLesson = chapters.some(ch => ch.lessons.length > 0);
    if (!hasLesson) return 'At least one chapter must have a lesson.';
    for (const ch of chapters) {
      if (!ch.title.trim()) return 'All chapters must have a title.';
      for (const l of ch.lessons) {
        if (!l.title.trim()) return 'All lessons must have a title.';
      }
    }
    return null;
  };

  const handlePublish = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsPublishing(true);

    try {
      // Upload thumbnail
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const fd = new FormData();
        fd.append('file', thumbnailFile);
        fd.append('type', 'thumbnail');
        fd.append('userId', user!.id);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Thumbnail upload failed');
        const data = await res.json();
        thumbnailUrl = data.url;
      }

      // Upload videos for each lesson and build the chapters payload
      const chaptersPayload = [];
      for (const ch of chapters) {
        const lessons = [];
        for (const lesson of ch.lessons) {
          let videoUrl = '';
          if (lesson.videoFile) {
            const fd = new FormData();
            fd.append('file', lesson.videoFile);
            fd.append('type', 'video');
            fd.append('userId', user!.id);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!res.ok) throw new Error(`Video upload failed for lesson "${lesson.title}"`);
            const data = await res.json();
            videoUrl = data.url;
          }
          lessons.push({
            title: lesson.title,
            type: lesson.type,
            videoUrl,
          });
        }
        chaptersPayload.push({ title: ch.title, lessons });
      }

      // Create the course
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          level,
          instructorId: user!.id,
          thumbnailUrl,
          chapters: chaptersPayload,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create course');
      }

      router.push('/instructor/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/instructor/dashboard" className={styles.backBtn}><ArrowLeft size={18} /> Back</Link>
        <h1>Create New Course</h1>
        <div className={styles.topActions}>
          <button className={styles.previewBtn}><Eye size={16} /> Preview</button>
          <button className={styles.publishBtn} onClick={handlePublish} disabled={isPublishing}>
            <Save size={16} /> {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

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
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              style={{ display: 'none' }}
            />
            <div className={styles.uploadArea} onClick={() => thumbnailInputRef.current?.click()}>
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
              ) : (
                <>
                  <Upload size={24} />
                  <p>Click to upload or drag & drop</p>
                  <span>PNG, JPG up to 5MB</span>
                </>
              )}
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
                  <button className={styles.deleteBtn} onClick={() => deleteChapter(ci)}><Trash2 size={14} /></button>
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
                      <label className={styles.uploadSmall} style={{ position: 'relative' }}>
                        <Upload size={12} />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleVideoSelect(ci, li, e)}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                        />
                      </label>
                      {lesson.videoFile && (
                        <span style={{ fontSize: '0.65rem', color: '#666', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lesson.videoFile.name}>
                          {lesson.videoFile.name}
                        </span>
                      )}
                      <button className={styles.deleteBtn} onClick={() => deleteLesson(ci, li)}><Trash2 size={12} /></button>
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
            <button className={styles.nextBtn} onClick={() => setStep(2 + 1)}>Next: Pricing</button>
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
            <button className={styles.publishBtn} onClick={handlePublish} disabled={isPublishing}>
              <Save size={16} /> {isPublishing ? 'Publishing...' : 'Publish Course'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
