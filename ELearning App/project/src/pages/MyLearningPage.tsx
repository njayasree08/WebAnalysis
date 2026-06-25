import React, { useEffect, useState } from 'react';
import { useLocation } from '../router';
import { supabase, Course, Enrollment } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Clock, TrendingUp, Award, Play, CheckCircle, BarChart3 } from 'lucide-react';

type EnrolledCourse = Enrollment & {
  course: Course & { category?: { name: string } };
  completedLessons: number;
  totalLessons: number;
};

const THUMBNAILS = [
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=400',
];

function getThumb(course: Course) {
  if (course.thumbnail_url) return course.thumbnail_url;
  const idx = parseInt(course.id.replace(/-/g, '').slice(0, 8), 16) % THUMBNAILS.length;
  return THUMBNAILS[idx];
}

function CircularProgress({ pct, size = 64 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct === 100 ? '#10b981' : '#3b82f6';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-200 dark:text-gray-700" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
      />
    </svg>
  );
}

export default function MyLearningPage() {
  const { navigate } = useLocation();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: enrData } = await supabase
        .from('enrollments')
        .select('*, course:courses(*, category:categories(name))')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (!enrData) { setLoading(false); return; }

      const courseIds = enrData.map(e => e.course_id);
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('course_id')
        .eq('user_id', user.id)
        .in('course_id', courseIds)
        .eq('completed', true);

      const completedMap = new Map<string, number>();
      (progressData ?? []).forEach(p => {
        completedMap.set(p.course_id, (completedMap.get(p.course_id) ?? 0) + 1);
      });

      setEnrollments(enrData.map(e => ({
        ...e,
        completedLessons: completedMap.get(e.course_id) ?? 0,
        totalLessons: e.course?.total_lessons ?? 0,
      })));
      setLoading(false);
    };
    load();
  }, [user]);

  const totalCompleted = enrollments.filter(e => e.totalLessons > 0 && e.completedLessons >= e.totalLessons).length;
  const totalMinutes = Math.round(enrollments.reduce((acc, e) => acc + ((e.course?.total_duration_minutes ?? 0) * (e.completedLessons / Math.max(e.totalLessons, 1))), 0));
  const overallProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.completedLessons / Math.max(e.totalLessons, 1)) * 100, 0) / enrollments.length)
    : 0;
  const totalLessonsCompleted = enrollments.reduce((acc, e) => acc + e.completedLessons, 0);

  const filtered = enrollments.filter(e => {
    const pct = e.totalLessons > 0 ? Math.round((e.completedLessons / e.totalLessons) * 100) : 0;
    if (filter === 'completed') return pct === 100;
    if (filter === 'in-progress') return pct > 0 && pct < 100;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Learning</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Track your progress and continue where you left off</p>
      </div>

      {/* Overall Progress Banner */}
      {enrollments.length > 0 && (
        <div className="card p-6 mb-8 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 border-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <CircularProgress pct={overallProgress} size={80} />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{overallProgress}%</span>
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Overall Progress</p>
                <p className="text-white text-2xl font-bold">{overallProgress}% Complete</p>
                <p className="text-white/70 text-sm mt-0.5">{totalLessonsCompleted} lessons across {enrollments.length} courses</p>
              </div>
            </div>
            <div className="sm:ml-auto grid grid-cols-3 gap-4 sm:gap-8">
              {[
                { label: 'Enrolled', value: enrollments.length },
                { label: 'Completed', value: totalCompleted },
                { label: 'Hours', value: Math.round(totalMinutes / 60) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-white/70 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: BookOpen, label: 'Total Courses', value: enrollments.length, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
          { icon: Award, label: 'Completed', value: totalCompleted, color: 'text-accent-600 bg-accent-50 dark:bg-accent-900/30' },
          { icon: CheckCircle, label: 'Lessons Done', value: totalLessonsCompleted, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
          { icon: Clock, label: 'Minutes Learned', value: totalMinutes, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      {enrollments.length > 0 && (
        <div className="flex gap-2 mb-6">
          {(['all', 'in-progress', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {f.replace('-', ' ')}
              <span className="ml-1.5 text-xs opacity-70">
                ({f === 'all' ? enrollments.length
                  : f === 'completed' ? enrollments.filter(e => e.totalLessons > 0 && e.completedLessons >= e.totalLessons).length
                  : enrollments.filter(e => { const p = e.completedLessons / Math.max(e.totalLessons, 1); return p > 0 && p < 1; }).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton h-36 rounded-none" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Enroll in a course to start your learning journey</p>
          <button onClick={() => navigate('courses')} className="btn-primary">Browse Courses</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No {filter.replace('-', ' ')} courses found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(enrollment => {
            const pct = enrollment.totalLessons > 0
              ? Math.round((enrollment.completedLessons / enrollment.totalLessons) * 100)
              : 0;
            const isComplete = pct === 100;
            return (
              <div
                key={enrollment.id}
                className="card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate('course-detail', { courseId: enrollment.course_id })}
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={getThumb(enrollment.course)} alt={enrollment.course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {isComplete && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full shadow">
                      <Award className="w-3 h-3" /> Completed
                    </div>
                  )}
                  {/* Circular progress overlay */}
                  <div className="absolute bottom-3 right-3">
                    <div className="relative w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <CircularProgress pct={pct} size={44} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{pct}%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
                    {enrollment.course.category?.name}
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {enrollment.course.title}
                  </h3>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-accent-500" />
                        {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                      </span>
                      <span className={`font-semibold ${isComplete ? 'text-accent-600 dark:text-accent-400' : 'text-primary-600 dark:text-primary-400'}`}>{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full progress-bar ${isComplete ? 'bg-accent-500' : 'bg-primary-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); navigate('course-detail', { courseId: enrollment.course_id }); }}
                      className="btn-primary flex-1 py-2 text-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {pct === 0 ? 'Start' : pct === 100 ? 'Review' : 'Continue'}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); navigate('course-detail', { courseId: enrollment.course_id }); }}
                      className="btn-secondary py-2 px-3 text-xs"
                      title="View details"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
