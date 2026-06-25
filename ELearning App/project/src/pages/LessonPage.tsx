import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from '../router';
import { supabase, Lesson, Course, LessonProgress } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, ArrowRight, CheckCircle, Bookmark, BookmarkCheck,
  Play, ChevronLeft, ChevronRight, Clock, List, Volume2, X
} from 'lucide-react';

export default function LessonPage() {
  const { params, navigate } = useLocation();
  const { user } = useAuth();
  const { lessonId, courseId } = params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completingLesson, setCompletingLesson] = useState(false);

  useEffect(() => {
    if (!lessonId || !courseId) return;
    const load = async () => {
      setLoading(true);
      const [lessonRes, courseRes, allLessonsRes] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', lessonId).maybeSingle(),
        supabase.from('courses').select('*, instructor:profiles(*)').eq('id', courseId).maybeSingle(),
        supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index'),
      ]);
      setLesson(lessonRes.data);
      setCourse(courseRes.data);
      setAllLessons(allLessonsRes.data ?? []);

      if (user) {
        const [progRes, bookmarkRes] = await Promise.all([
          supabase.from('lesson_progress').select('*').eq('user_id', user.id).eq('lesson_id', lessonId).maybeSingle(),
          supabase.from('bookmarks').select('id').eq('user_id', user.id).eq('lesson_id', lessonId).maybeSingle(),
        ]);
        setProgress(progRes.data);
        setBookmarked(!!bookmarkRes.data);
      }
      setLoading(false);
    };
    load();
  }, [lessonId, courseId, user]);

  const markComplete = async () => {
    if (!user || !lesson || !courseId) return;
    setCompletingLesson(true);
    if (progress) {
      await supabase.from('lesson_progress').update({
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', progress.id);
    } else {
      await supabase.from('lesson_progress').insert({
        lesson_id: lesson.id,
        course_id: courseId,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    }
    setProgress(p => ({ ...p!, completed: true, completed_at: new Date().toISOString() }));

    // Check if all lessons completed
    const { data: allProgress } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('completed', true);

    const completedLessons = new Set((allProgress ?? []).map(p => p.lesson_id));
    completedLessons.add(lesson.id);

    if (completedLessons.size >= allLessons.length) {
      await supabase.from('notifications').insert({
        title: 'Course Completed!',
        message: `Congratulations! You've completed "${course?.title}". You can now download your certificate.`,
        type: 'success',
      });
    }
    setCompletingLesson(false);
  };

  const toggleBookmark = async () => {
    if (!user || !lesson || !courseId) return;
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('lesson_id', lesson.id);
    } else {
      await supabase.from('bookmarks').insert({ lesson_id: lesson.id, course_id: courseId });
    }
    setBookmarked(v => !v);
  };

  const currentIdx = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    return url;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) return <div className="text-center py-20 text-gray-500">Lesson not found.</div>;

  const embedUrl = getVideoEmbedUrl(lesson.video_url);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900`}>
        <div className="h-full flex flex-col w-72">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => navigate('course-detail', { courseId })}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Course
            </button>
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">{course?.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{allLessons.length} lessons</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {allLessons.map((l, idx) => {
              const isCurrent = l.id === lessonId;
              return (
                <button
                  key={l.id}
                  onClick={() => navigate('lesson', { lessonId: l.id, courseId })}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-l-2 ${
                    isCurrent
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-l-primary-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-transparent'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-medium leading-snug ${isCurrent ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {l.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {l.duration_minutes}m
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <List className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{lesson.title}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{course?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-lg transition-colors ${bookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
            >
              {bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <button
              onClick={markComplete}
              disabled={progress?.completed || completingLesson}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                progress?.completed
                  ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 cursor-default'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {completingLesson ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {progress?.completed ? 'Completed' : 'Mark Complete'}
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 overflow-y-auto bg-gray-950">
          <div className="max-w-4xl mx-auto p-6">
            {embedUrl ? (
              <div className="video-container mb-6">
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <div className="text-center text-gray-400">
                  <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Video not available</p>
                </div>
              </div>
            )}

            {/* Lesson Info */}
            <div className="bg-gray-900 rounded-xl p-5 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white mb-2">{lesson.title}</h2>
                  {lesson.description && (
                    <p className="text-gray-400 text-sm leading-relaxed">{lesson.description}</p>
                  )}
                </div>
                <span className="flex items-center gap-1.5 text-sm text-gray-400 flex-shrink-0">
                  <Clock className="w-4 h-4" /> {lesson.duration_minutes}m
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => prevLesson && navigate('lesson', { lessonId: prevLesson.id, courseId })}
                disabled={!prevLesson}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-gray-500">{currentIdx + 1} / {allLessons.length}</span>
              <button
                onClick={() => nextLesson && navigate('lesson', { lessonId: nextLesson.id, courseId })}
                disabled={!nextLesson}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
