import React, { useEffect, useState } from 'react';
import { useLocation } from '../router';
import { supabase, Course, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen, Users, Star, Clock, TrendingUp, Award, ChevronRight,
  Play, Zap, ArrowRight
} from 'lucide-react';
import CourseCard from '../components/CourseCard';

export default function HomePage() {
  const { navigate } = useLocation();
  const { profile } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      const [coursesRes, catsRes] = await Promise.all([
        supabase.from('courses').select('*, category:categories(*), instructor:profiles(*)').eq('is_published', true).order('students_count', { ascending: false }).limit(6),
        supabase.from('categories').select('*').limit(8),
      ]);
      setFeaturedCourses(coursesRes.data ?? []);
      setCategories(catsRes.data ?? []);

      if (user) {
        const { data } = await supabase.from('enrollments').select('course_id').eq('user_id', user.id);
        setEnrolledIds(new Set((data ?? []).map(e => e.course_id)));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const stats = [
    { icon: BookOpen, label: 'Courses', value: '500+', color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
    { icon: Users, label: 'Students', value: '50K+', color: 'text-accent-600 bg-accent-50 dark:bg-accent-900/30' },
    { icon: Award, label: 'Certificates', value: '10K+', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
    { icon: TrendingUp, label: 'Completion Rate', value: '94%', color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 dark:from-primary-900 dark:via-primary-800 dark:to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 border border-white/20">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
              Continue Your
              <span className="block text-accent-300"> Learning Journey</span>
            </h1>
            <p className="text-primary-200 text-lg mb-8 leading-relaxed">
              Explore curated courses, track your progress, and achieve your learning goals with world-class instructors.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('courses')} className="flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors">
                <BookOpen className="w-4 h-4" /> Browse Courses
              </button>
              <button onClick={() => navigate('my-learning')} className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-colors">
                <TrendingUp className="w-4 h-4" /> My Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Categories</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Find courses in your area of interest</p>
              </div>
              <button onClick={() => navigate('courses')} className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => navigate('courses')}
                  className="card p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                    <BookOpen className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Featured Courses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Courses</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Top-rated courses loved by students</p>
            </div>
            <button onClick={() => navigate('courses')} className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-44 rounded-none" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-full" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map(course => (
                <CourseCard key={course.id} course={course} enrolled={enrolledIds.has(course.id)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
