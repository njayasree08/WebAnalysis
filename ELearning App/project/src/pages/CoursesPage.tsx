import React, { useEffect, useState } from 'react';
import { useLocation } from '../router';
import { supabase, Course, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import CourseCard from '../components/CourseCard';

const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];
const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'students_count' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Newest', value: 'created_at' },
];

type Props = { searchQuery: string; onSearch: (q: string) => void };

export default function CoursesPage({ searchQuery, onSearch }: Props) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('students_count');
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data ?? []));
    if (user) {
      supabase.from('enrollments').select('course_id').eq('user_id', user.id).then(({ data }) => {
        setEnrolledIds(new Set((data ?? []).map(e => e.course_id)));
      });
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from('courses')
      .select('*, category:categories(*), instructor:profiles(*)')
      .eq('is_published', true)
      .order(sortBy, { ascending: sortBy === 'created_at' ? false : false });

    if (selectedCategory !== 'all') q = q.eq('category_id', selectedCategory);
    if (selectedDifficulty !== 'all') q = q.eq('difficulty', selectedDifficulty);
    if (searchQuery.trim()) {
      q = q.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    q.then(({ data }) => {
      setCourses(data ?? []);
      setLoading(false);
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const activeFilters = (selectedCategory !== 'all' ? 1 : 0) + (selectedDifficulty !== 'all' ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Courses</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {loading ? 'Loading...' : `${courses.length} courses available`}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses, topics, instructors..."
            className="input pl-9"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`btn-secondary gap-2 ${activeFilters > 0 ? 'border-primary-500 text-primary-600 dark:text-primary-400' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input py-2 w-auto pr-8 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="card p-5 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Difficulty</h3>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${selectedDifficulty === d ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    {d === 'all' ? 'All Levels' : d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedDifficulty('all'); }}
              className="mt-4 text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
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
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search or filters</p>
          <button
            onClick={() => { onSearch(''); setSelectedCategory('all'); setSelectedDifficulty('all'); }}
            className="btn-primary mt-4"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} enrolled={enrolledIds.has(course.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
