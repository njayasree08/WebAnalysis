import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  instructor_id: string | null;
  category_id: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  is_published: boolean;
  total_lessons: number;
  total_duration_minutes: number;
  rating: number;
  students_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  instructor?: Profile;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
  created_at: string;
};

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  course?: Course;
};

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  watch_time_seconds: number;
  completed_at: string | null;
  updated_at: string;
};

export type Bookmark = {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  created_at: string;
  lesson?: Lesson;
  course?: Course;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link: string | null;
  created_at: string;
};
