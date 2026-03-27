// ============================================
// POCKETCLASS — Type Definitions
// ============================================

export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  createdAt: string;
}

export interface Instructor extends User {
  role: 'instructor';
  expertise: string[];
  rating: number;
  reviewCount: number;
  studentCount: number;
  courseCount: number;
  hourlyRate: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  instructor: Instructor;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  reviewCount: number;
  studentCount: number;
  duration: string;
  lessonCount: number;
  chapters: Chapter[];
  isFeatured?: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'live';
  duration: string;
  videoUrl?: string;
  content?: string;
  order: number;
  isFree?: boolean;
  isCompleted?: boolean;
}

export interface StreamingSession {
  id: string;
  title: string;
  description: string;
  instructor: Instructor;
  date: string;
  time: string;
  duration: string;
  timezone: string;
  meetingUrl?: string;
  price: number;
  maxParticipants: number;
  enrolledCount: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  category: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
  lastAccessedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
}

export interface Review {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'paypal' | 'bank_transfer';
  label: string;
  icon: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod['type'];
  courseId?: string;
  sessionId?: string;
  studentId: string;
  instructorId: string;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalInstructors: number;
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  activeSessionsToday: number;
  newUsersThisMonth: number;
  revenueThisMonth: number;
}
