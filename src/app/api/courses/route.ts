import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { title, description, category, level, instructorId, chapters, thumbnailUrl } = body;

    if (!title || !category || !instructorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Insert course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        instructor_id: instructorId,
        title,
        slug: `${slug}-${Date.now()}`,
        description,
        short_description: description?.substring(0, 150),
        thumbnail_url: thumbnailUrl,
        category,
        level: level || 'beginner',
        is_published: false,
      })
      .select()
      .single();

    if (courseError) {
      console.error('Course creation error:', courseError);
      return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
    }

    // Insert chapters and lessons
    if (chapters && Array.isArray(chapters)) {
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        const { data: chapter, error: chError } = await supabase
          .from('chapters')
          .insert({
            course_id: course.id,
            title: ch.title,
            order: i,
          })
          .select()
          .single();

        if (chError || !chapter) continue;

        if (ch.lessons && Array.isArray(ch.lessons)) {
          for (let j = 0; j < ch.lessons.length; j++) {
            const lesson = ch.lessons[j];
            await supabase.from('lessons').insert({
              chapter_id: chapter.id,
              title: lesson.title,
              type: lesson.type || 'video',
              duration: lesson.duration,
              video_url: lesson.videoUrl,
              order: j,
              is_free: j === 0 && i === 0, // First lesson of first chapter is free
            });
          }
        }
      }
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Course API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
