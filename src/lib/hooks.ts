'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, CourseWithInstructor, SessionWithInstructor, DbMessage } from '@/lib/supabase/types';
import { courses as mockCourses, instructors as mockInstructors, streamingSessions as mockSessions, mockMessages, mockConversations } from '@/lib/mock-data';
import type { Course, Instructor, StreamingSession, Conversation, Message } from '@/types';

const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

const supabase = createClient();

// ============================================
// Courses
// ============================================
export function useCourses(filters?: { category?: string; level?: string; search?: string; sort?: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      let filtered = [...mockCourses];
      if (filters?.category) filtered = filtered.filter(c => c.category === filters.category);
      if (filters?.level) filtered = filtered.filter(c => c.level === filters.level);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
      }
      if (filters?.sort) {
        switch (filters.sort) {
          case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
          case 'students': filtered.sort((a, b) => b.studentCount - a.studentCount); break;
          case 'newest': filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
          case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
          case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
        }
      }
      setCourses(filtered);
      setLoading(false);
      return;
    }

    async function fetchCourses() {
      let query = supabase
        .from('courses')
        .select(`*, instructor:profiles!instructor_id(*), chapters(*, lessons(*))`)
        .eq('is_published', true);

      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.level) query = query.eq('level', filters.level);
      if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

      const { data } = await query;
      if (data) {
        setCourses(data.map(dbCourseToFrontend));
      }
      setLoading(false);
    }

    fetchCourses();
  }, [filters?.category, filters?.level, filters?.search, filters?.sort]);

  return { courses, loading };
}

export function useCourse(id: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setCourse(mockCourses.find(c => c.id === id) || null);
      setLoading(false);
      return;
    }

    async function fetchCourse() {
      const { data } = await supabase
        .from('courses')
        .select(`*, instructor:profiles!instructor_id(*), chapters(*, lessons(*))`)
        .eq('id', id)
        .single();

      if (data) setCourse(dbCourseToFrontend(data));
      setLoading(false);
    }

    fetchCourse();
  }, [id]);

  return { course, loading };
}

// ============================================
// Instructors
// ============================================
export function useInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setInstructors(mockInstructors);
      setLoading(false);
      return;
    }

    async function fetchInstructors() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'instructor');

      if (data) {
        setInstructors(data.map(profileToInstructor));
      }
      setLoading(false);
    }

    fetchInstructors();
  }, []);

  return { instructors, loading };
}

export function useInstructor(id: string) {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setInstructor(mockInstructors.find(i => i.id === id) || null);
      setLoading(false);
      return;
    }

    async function fetchInstructor() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'instructor')
        .single();

      if (data) setInstructor(profileToInstructor(data));
      setLoading(false);
    }

    fetchInstructor();
  }, [id]);

  return { instructor, loading };
}

// ============================================
// Sessions
// ============================================
export function useSessions() {
  const [sessions, setSessions] = useState<StreamingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setSessions(mockSessions);
      setLoading(false);
      return;
    }

    async function fetchSessions() {
      const { data } = await supabase
        .from('streaming_sessions')
        .select(`*, instructor:profiles!instructor_id(*)`)
        .in('status', ['upcoming', 'live'])
        .order('date', { ascending: true });

      if (data) {
        setSessions(data.map(dbSessionToFrontend));
      }
      setLoading(false);
    }

    fetchSessions();
  }, []);

  return { sessions, loading };
}

// ============================================
// Messages
// ============================================
export function useConversations(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setConversations(mockConversations);
      setLoading(false);
      return;
    }

    async function fetchConversations() {
      // Get distinct conversation partners
      const { data: sent } = await supabase
        .from('messages')
        .select('receiver_id')
        .eq('sender_id', userId);
      const { data: received } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', userId);

      const partnerIds = new Set<string>();
      sent?.forEach((m: { receiver_id: string }) => partnerIds.add(m.receiver_id));
      received?.forEach((m: { sender_id: string }) => partnerIds.add(m.sender_id));

      // Fetch profiles and last messages for each partner
      const convs: Conversation[] = [];
      for (const partnerId of partnerIds) {
        const { data: partner } = await supabase.from('profiles').select('*').eq('id', partnerId).single();
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', partnerId)
          .eq('receiver_id', userId)
          .eq('is_read', false);

        if (partner && lastMsg) {
          convs.push({
            id: `conv-${partnerId}`,
            participants: [
              { id: userId, name: 'You', email: '', role: 'student', avatar: '', createdAt: '' },
              profileToUser(partner),
            ],
            lastMessage: dbMessageToFrontend(lastMsg),
            unreadCount: count || 0,
          });
        }
      }

      setConversations(convs);
      setLoading(false);
    }

    fetchConversations();
  }, [userId]);

  return { conversations, loading };
}

export function useMessages(userId: string, partnerId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setMessages(mockMessages);
      setLoading(false);
      return;
    }

    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (data) setMessages(data.map(dbMessageToFrontend));
      setLoading(false);

      // Mark as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', userId)
        .eq('is_read', false);
    }

    fetchMessages();

    // Subscribe to new messages in real-time
    const channel = supabase
      .channel(`messages-${userId}-${partnerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload: { new: Record<string, unknown> }) => {
        const msg = payload.new as unknown as DbMessage;
        if (
          (msg.sender_id === userId && msg.receiver_id === partnerId) ||
          (msg.sender_id === partnerId && msg.receiver_id === userId)
        ) {
          setMessages(prev => [...prev, dbMessageToFrontend(msg)]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, partnerId]);

  return { messages, loading };
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  if (DEMO_MODE) return { id: `m-${Date.now()}`, senderId, receiverId, content, timestamp: new Date().toISOString(), isRead: false };

  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, content })
    .select()
    .single();

  if (error) throw error;
  return dbMessageToFrontend(data);
}

// ============================================
// Purchases
// ============================================
export function usePurchasedLessons(userId: string) {
  const [lessonIds, setLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE || !userId) {
      setLoading(false);
      return;
    }

    async function fetchPurchases() {
      const { data } = await supabase
        .from('purchases')
        .select('lesson_id')
        .eq('student_id', userId)
        .eq('status', 'completed')
        .not('lesson_id', 'is', null);

      if (data) {
        setLessonIds(new Set(data.map((p: { lesson_id: string }) => p.lesson_id).filter(Boolean)));
      }
      setLoading(false);
    }

    fetchPurchases();
  }, [userId]);

  return { lessonIds, loading };
}

// ============================================
// Student Dashboard Stats
// ============================================
export function useStudentStats(userId: string) {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    totalSpent: 0,
    avgProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE || !userId) {
      setStats({ enrolledCourses: 3, completedLessons: 24, totalSpent: 48, avgProgress: 67 });
      setLoading(false);
      return;
    }

    async function fetchStats() {
      const [enrollments, purchases] = await Promise.all([
        supabase.from('enrollments').select('*').eq('student_id', userId),
        supabase.from('purchases').select('amount').eq('student_id', userId).eq('status', 'completed'),
      ]);

      const enrolls = enrollments.data || [];
      const totalSpent = (purchases.data || []).reduce((sum: number, p: Record<string, unknown>) => sum + Number(p.amount), 0);
      const avgProgress = enrolls.length > 0
        ? enrolls.reduce((sum: number, e: Record<string, unknown>) => sum + Number(e.progress), 0) / enrolls.length
        : 0;

      setStats({
        enrolledCourses: enrolls.length,
        completedLessons: enrolls.reduce((sum: number, e: Record<string, unknown>) => sum + ((e.completed_lessons as string[])?.length || 0), 0),
        totalSpent,
        avgProgress: Math.round(avgProgress),
      });
      setLoading(false);
    }

    fetchStats();
  }, [userId]);

  return { stats, loading };
}

// ============================================
// Instructor Dashboard Stats
// ============================================
export function useInstructorStats(userId: string) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    courseCount: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE || !userId) {
      setStats({ totalRevenue: 12450, totalStudents: 2840, courseCount: 8, avgRating: 4.9 });
      setLoading(false);
      return;
    }

    async function fetchStats() {
      const [courses, purchases, profile] = await Promise.all([
        supabase.from('courses').select('id').eq('instructor_id', userId),
        supabase.from('purchases').select('instructor_amount').eq('status', 'completed'),
        supabase.from('profiles').select('rating, student_count').eq('id', userId).single(),
      ]);

      setStats({
        totalRevenue: (purchases.data || []).reduce((sum: number, p: Record<string, unknown>) => sum + Number(p.instructor_amount), 0),
        totalStudents: profile.data?.student_count || 0,
        courseCount: (courses.data || []).length,
        avgRating: profile.data?.rating || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, [userId]);

  return { stats, loading };
}

// ============================================
// Converters (DB → Frontend types)
// ============================================
function profileToUser(p: Profile | Record<string, unknown>) {
  return {
    id: p.id as string,
    name: p.name as string,
    email: p.email as string,
    role: p.role as 'student' | 'instructor' | 'admin',
    avatar: (p.avatar_url as string) || '',
    createdAt: p.created_at as string,
  };
}

function profileToInstructor(p: Profile | Record<string, unknown>): Instructor {
  return {
    ...profileToUser(p),
    role: 'instructor',
    expertise: (p.expertise as string[]) || [],
    rating: Number(p.rating) || 0,
    reviewCount: Number(p.review_count) || 0,
    studentCount: Number(p.student_count) || 0,
    courseCount: 0,
    hourlyRate: Number(p.hourly_rate) || 0,
    socialLinks: (p.social_links as Record<string, string>) || {},
  };
}

function dbCourseToFrontend(c: CourseWithInstructor | Record<string, unknown>): Course {
  const chapters = (c.chapters as Array<Record<string, unknown>>) || [];
  const instructor = c.instructor as Record<string, unknown>;
  const lessonCount = chapters.reduce((sum: number, ch: Record<string, unknown>) => {
    return sum + ((ch.lessons as unknown[]) || []).length;
  }, 0);

  return {
    id: c.id as string,
    title: c.title as string,
    slug: c.slug as string,
    description: (c.description as string) || '',
    shortDescription: (c.short_description as string) || '',
    thumbnail: (c.thumbnail_url as string) || '/api/placeholder/800/450',
    instructor: profileToInstructor(instructor),
    price: 0, // Free enrollment, pay per video
    category: c.category as string,
    tags: (c.tags as string[]) || [],
    level: c.level as 'beginner' | 'intermediate' | 'advanced',
    rating: Number(instructor?.rating) || 0,
    reviewCount: Number(instructor?.review_count) || 0,
    studentCount: Number(instructor?.student_count) || 0,
    duration: `${lessonCount * 25} min`,
    lessonCount,
    chapters: chapters.map((ch: Record<string, unknown>) => ({
      id: ch.id as string,
      title: ch.title as string,
      order: ch.order as number,
      lessons: ((ch.lessons as Array<Record<string, unknown>>) || []).map((l) => ({
        id: l.id as string,
        title: l.title as string,
        type: l.type as 'video' | 'text' | 'quiz' | 'live',
        duration: (l.duration as string) || '',
        videoUrl: l.video_url as string | undefined,
        content: l.content as string | undefined,
        order: l.order as number,
        isFree: l.is_free as boolean,
      })),
    })),
    isFeatured: c.is_featured as boolean,
    isPublished: c.is_published as boolean,
    createdAt: c.created_at as string,
    updatedAt: c.updated_at as string,
  };
}

function dbSessionToFrontend(s: SessionWithInstructor | Record<string, unknown>): StreamingSession {
  return {
    id: s.id as string,
    title: s.title as string,
    description: (s.description as string) || '',
    instructor: profileToInstructor(s.instructor as Record<string, unknown>),
    date: s.date as string,
    time: s.time as string,
    duration: s.duration as string,
    timezone: (s.timezone as string) || 'EST',
    meetingUrl: s.meeting_url as string | undefined,
    price: 3,
    maxParticipants: (s.max_participants as number) || 30,
    enrolledCount: (s.enrolled_count as number) || 0,
    status: s.status as 'upcoming' | 'live' | 'completed' | 'cancelled',
    category: (s.category as string) || '',
  };
}

function dbMessageToFrontend(m: DbMessage | Record<string, unknown>): Message {
  return {
    id: m.id as string,
    senderId: m.sender_id as string,
    receiverId: m.receiver_id as string,
    content: m.content as string,
    timestamp: m.created_at as string,
    isRead: m.is_read as boolean,
  };
}
