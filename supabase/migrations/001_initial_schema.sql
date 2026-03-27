-- ============================================
-- POCKETCLASS — Database Schema
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null default 'student' check (role in ('student', 'instructor', 'admin')),
  avatar_url text,
  bio text,
  expertise text[] default '{}',
  rating numeric(3,2) default 0,
  review_count int default 0,
  student_count int default 0,
  hourly_rate numeric(10,2),
  social_links jsonb default '{}',
  stripe_account_id text,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- COURSES
-- ============================================
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  instructor_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  description text,
  short_description text,
  thumbnail_url text,
  category text not null,
  tags text[] default '{}',
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  is_featured boolean default false,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- CHAPTERS
-- ============================================
create table public.chapters (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  "order" int not null default 0,
  created_at timestamptz default now()
);

-- ============================================
-- LESSONS (individual purchasable videos)
-- ============================================
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  title text not null,
  type text not null default 'video' check (type in ('video', 'text', 'quiz', 'live')),
  duration text,
  video_url text,
  content text,
  "order" int not null default 0,
  is_free boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- STREAMING SESSIONS (live training)
-- ============================================
create table public.streaming_sessions (
  id uuid default uuid_generate_v4() primary key,
  instructor_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  date date not null,
  time text not null,
  duration text not null,
  timezone text default 'EST',
  meeting_url text,
  max_participants int default 30,
  enrolled_count int default 0,
  status text default 'upcoming' check (status in ('upcoming', 'live', 'completed', 'cancelled')),
  category text,
  created_at timestamptz default now()
);

-- ============================================
-- PURCHASES (per-video and per-session)
-- ============================================
create table public.purchases (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete set null,
  session_id uuid references public.streaming_sessions(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  amount numeric(10,2) not null,
  platform_fee numeric(10,2) not null,
  instructor_amount numeric(10,2) not null,
  currency text default 'usd',
  stripe_payment_id text,
  status text default 'completed' check (status in ('completed', 'pending', 'failed', 'refunded')),
  created_at timestamptz default now(),
  constraint purchase_item_check check (lesson_id is not null or session_id is not null)
);

-- ============================================
-- ENROLLMENTS (course-level tracking)
-- ============================================
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  progress numeric(5,2) default 0,
  completed_lessons text[] default '{}',
  enrolled_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  unique(student_id, course_id)
);

-- ============================================
-- MESSAGES
-- ============================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- REVIEWS
-- ============================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(course_id, student_id)
);

-- ============================================
-- PLATFORM SETTINGS (configurable pricing etc)
-- ============================================
create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Insert default pricing config
insert into public.platform_settings (key, value) values
  ('pricing', '{"video_price": 2.00, "session_price": 3.00, "platform_commission": 0.15, "currency": "usd"}'),
  ('platform_name', '"PocketClass"');

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles: public read, own write
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Courses: public read, instructor write
alter table public.courses enable row level security;
create policy "Published courses are viewable by everyone" on public.courses for select using (is_published = true or instructor_id = auth.uid());
create policy "Instructors can insert courses" on public.courses for insert with check (instructor_id = auth.uid());
create policy "Instructors can update own courses" on public.courses for update using (instructor_id = auth.uid());
create policy "Instructors can delete own courses" on public.courses for delete using (instructor_id = auth.uid());

-- Chapters: public read, instructor write
alter table public.chapters enable row level security;
create policy "Chapters viewable by everyone" on public.chapters for select using (true);
create policy "Instructors can manage chapters" on public.chapters for all using (
  exists (select 1 from public.courses where id = chapters.course_id and instructor_id = auth.uid())
);

-- Lessons: public read, instructor write
alter table public.lessons enable row level security;
create policy "Lessons viewable by everyone" on public.lessons for select using (true);
create policy "Instructors can manage lessons" on public.lessons for all using (
  exists (
    select 1 from public.chapters c
    join public.courses co on co.id = c.course_id
    where c.id = lessons.chapter_id and co.instructor_id = auth.uid()
  )
);

-- Sessions: public read, instructor write
alter table public.streaming_sessions enable row level security;
create policy "Sessions viewable by everyone" on public.streaming_sessions for select using (true);
create policy "Instructors can manage sessions" on public.streaming_sessions for insert with check (instructor_id = auth.uid());
create policy "Instructors can update own sessions" on public.streaming_sessions for update using (instructor_id = auth.uid());

-- Purchases: own read
alter table public.purchases enable row level security;
create policy "Users can view own purchases" on public.purchases for select using (student_id = auth.uid());
create policy "System can insert purchases" on public.purchases for insert with check (true);

-- Enrollments: own read/write
alter table public.enrollments enable row level security;
create policy "Users can view own enrollments" on public.enrollments for select using (student_id = auth.uid());
create policy "Users can manage own enrollments" on public.enrollments for all using (student_id = auth.uid());

-- Messages: participants can read/write
alter table public.messages enable row level security;
create policy "Users can view own messages" on public.messages for select using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "Users can send messages" on public.messages for insert with check (sender_id = auth.uid());
create policy "Users can mark messages as read" on public.messages for update using (receiver_id = auth.uid());

-- Reviews: public read, student write
alter table public.reviews enable row level security;
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Students can write reviews" on public.reviews for insert with check (student_id = auth.uid());

-- Platform settings: public read
alter table public.platform_settings enable row level security;
create policy "Settings are viewable by everyone" on public.platform_settings for select using (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || encode(new.id::bytea, 'hex')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
create trigger update_courses_updated_at before update on public.courses
  for each row execute procedure public.update_updated_at();

-- ============================================
-- INDEXES
-- ============================================
create index idx_courses_instructor on public.courses(instructor_id);
create index idx_courses_category on public.courses(category);
create index idx_courses_slug on public.courses(slug);
create index idx_chapters_course on public.chapters(course_id);
create index idx_lessons_chapter on public.lessons(chapter_id);
create index idx_purchases_student on public.purchases(student_id);
create index idx_purchases_lesson on public.purchases(lesson_id);
create index idx_enrollments_student on public.enrollments(student_id);
create index idx_enrollments_course on public.enrollments(course_id);
create index idx_messages_sender on public.messages(sender_id);
create index idx_messages_receiver on public.messages(receiver_id);
create index idx_reviews_course on public.reviews(course_id);
create index idx_sessions_instructor on public.streaming_sessions(instructor_id);
