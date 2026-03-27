// ============================================
// POCKETCLASS — Supabase Database Types
// ============================================

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar_url: string | null;
  bio: string | null;
  expertise: string[];
  rating: number;
  review_count: number;
  student_count: number;
  hourly_rate: number | null;
  social_links: Record<string, string>;
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCourse {
  id: string;
  instructor_id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbChapter {
  id: string;
  course_id: string;
  title: string;
  order: number;
  created_at: string;
}

export interface DbLesson {
  id: string;
  chapter_id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'live';
  duration: string | null;
  video_url: string | null;
  content: string | null;
  order: number;
  is_free: boolean;
  created_at: string;
}

export interface DbStreamingSession {
  id: string;
  instructor_id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  duration: string;
  timezone: string;
  meeting_url: string | null;
  max_participants: number;
  enrolled_count: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  category: string | null;
  created_at: string;
}

export interface DbPurchase {
  id: string;
  student_id: string;
  lesson_id: string | null;
  session_id: string | null;
  course_id: string | null;
  amount: number;
  platform_fee: number;
  instructor_amount: number;
  currency: string;
  stripe_payment_id: string | null;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  created_at: string;
}

export interface DbEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  progress: number;
  completed_lessons: string[];
  enrolled_at: string;
  last_accessed_at: string;
}

export interface DbMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface DbReview {
  id: string;
  course_id: string;
  student_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

// Joined types for common queries
export interface CourseWithInstructor extends DbCourse {
  instructor: Profile;
  chapters: (DbChapter & { lessons: DbLesson[] })[];
  _count?: {
    enrollments: number;
    reviews: number;
  };
  _avg_rating?: number;
}

export interface SessionWithInstructor extends DbStreamingSession {
  instructor: Profile;
}

export interface MessageWithSender extends DbMessage {
  sender: Profile;
}
