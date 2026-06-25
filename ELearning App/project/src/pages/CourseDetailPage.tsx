import React, { useEffect, useState } from 'react';
import { useLocation } from '../router';
import { supabase, Course, Lesson, LessonProgress } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Star, Clock, Users, BookOpen, Play, CheckCircle, Lock,
  ArrowLeft, ChevronDown, ChevronUp, Award, BarChart3, Download
} from 'lucide-react';

const THUMBNAILS = [
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=800',
];

function getThumb(course: Course) {
  if (course.thumbnail_url) return course.thumbnail_url;
  const idx = parseInt(course.id.replace(/-/g, '').slice(0, 8), 16) % THUMBNAILS.length;
  return THUMBNAILS[idx];
}

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function CourseDetailPage() {
  const { params, navigate } = useLocation();
  const { user } = useAuth();
  const courseId = params.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Map<string, LessonProgress>>(new Map());
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      const [courseRes, lessonsRes] = await Promise.all([
        supabase.from('courses').select('*, category:categories(*), instructor:profiles(*)').eq('id', courseId).maybeSingle(),
        supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index'),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data ?? []);

      if (user) {
        const [enrollRes, progRes] = await Promise.all([
          supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', courseId).maybeSingle(),
          supabase.from('lesson_progress').select('*').eq('user_id', user.id).eq('course_id', courseId),
        ]);
        setEnrolled(!!enrollRes.data);
        const map = new Map<string, LessonProgress>();
        (progRes.data ?? []).forEach(p => map.set(p.lesson_id, p));
        setProgress(map);
      }
      setLoading(false);
    };
    load();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user || !courseId) return;
    setEnrolling(true);
    const { error } = await supabase.from('enrollments').insert({ course_id: courseId });
    if (!error) {
      setEnrolled(true);
      await supabase.from('notifications').insert({
        title: 'Enrollment Successful!',
        message: `You've enrolled in "${course?.title}". Start learning now!`,
        type: 'success',
        link: courseId,
      });
      await supabase.from('courses').update({ students_count: (course?.students_count ?? 0) + 1 }).eq('id', courseId);
    }
    setEnrolling(false);
  };

  const completedCount = lessons.filter(l => progress.get(l.id)?.completed).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="skeleton h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-72 rounded-2xl" />
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course) return <div className="text-center py-20 text-gray-500">Course not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('courses')}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80">
            <img src={getThumb(course)} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              {course.category && (
                <span className="inline-block px-2.5 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full mb-2">
                  {course.category.name}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{course.title}</h1>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4">
            <span className={`badge px-3 py-1.5 capitalize ${DIFFICULTY_COLORS[course.difficulty]}`}>
              {course.difficulty}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-900 dark:text-white">{course.rating.toFixed(1)}</span>
              <span>rating</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" /> {course.students_count.toLocaleString()} students
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <BookOpen className="w-4 h-4" /> {course.total_lessons} lessons
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" /> {course.total_duration_minutes} minutes
            </span>
          </div>

          {/* Description */}
          <div className="card p-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About This Course</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{course.description}</p>
          </div>

          {/* Progress (if enrolled) */}
          {enrolled && lessons.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Progress</h2>
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
                <div
                  className="bg-primary-600 h-2.5 rounded-full progress-bar"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {completedCount} of {lessons.length} lessons completed
                {progressPercent === 100 && (
                  <span className="ml-2 text-accent-600 font-semibold flex items-center gap-1 inline-flex">
                    <Award className="w-4 h-4" /> Course Complete!
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Lessons */}
          <div className="card overflow-hidden">
            <div
              className="flex items-center justify-between p-5 cursor-pointer"
              onClick={() => setExpandedSections(v => !v)}
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Course Content ({lessons.length} lessons)
              </h2>
              {expandedSections ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            {expandedSections && (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {lessons.map((lesson, idx) => {
                  const prog = progress.get(lesson.id);
                  const canAccess = enrolled || lesson.is_preview;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => canAccess && navigate('lesson', { lessonId: lesson.id, courseId: course.id })}
                      className={`flex items-center gap-4 px-5 py-4 transition-colors ${canAccess ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                        {prog?.completed ? (
                          <CheckCircle className="w-6 h-6 text-accent-500" />
                        ) : canAccess ? (
                          <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${prog?.completed ? 'text-accent-600 dark:text-accent-400' : 'text-gray-900 dark:text-white'}`}>
                          {lesson.title}
                        </p>
                        {lesson.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{lesson.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {lesson.is_preview && !enrolled && (
                          <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Preview</span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.duration_minutes}m
                        </span>
                        {canAccess && <Play className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {course.price === 0 ? 'Free' : `₹${Number(course.price).toLocaleString('en-IN')}`}
            </div>
            {course.price > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">One-time payment</p>
            )}

            {enrolled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-xl text-accent-700 dark:text-accent-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> You're enrolled!
                </div>
                <button
                  onClick={() => lessons[0] && navigate('lesson', { lessonId: lessons[0].id, courseId: course.id })}
                  className="btn-primary w-full py-3 text-base"
                >
                  <Play className="w-4 h-4" />
                  {completedCount > 0 ? 'Continue Learning' : 'Start Learning'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling || !user}
                className="btn-primary w-full py-3 text-base mb-3"
              >
                {enrolling ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enrolling...
                  </span>
                ) : course.price === 0 ? 'Enroll for Free' : `Enroll Now — ₹${Number(course.price).toLocaleString('en-IN')}`}
              </button>
            )}

            <div className="mt-5 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">This course includes:</h3>
              {[
                { icon: BookOpen, text: `${course.total_lessons} on-demand lessons` },
                { icon: Clock, text: `${course.total_duration_minutes} minutes of video content` },
                { icon: BarChart3, text: `${course.difficulty} level` },
                { icon: Award, text: 'Certificate of completion' },
                { icon: Download, text: 'Lifetime access' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <Icon className="w-4 h-4 text-gray-400" /> {text}
                </div>
              ))}
            </div>

            {course.instructor && (
              <div className="mt-5 border-t border-gray-100 dark:border-gray-800 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Instructor</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={course.instructor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.full_name)}&background=3b82f6&color=fff&size=48`}
                    alt={course.instructor.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{course.instructor.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{course.instructor.role}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
