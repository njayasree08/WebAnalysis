import React from 'react';
import { Course } from '../lib/supabase';
import { useLocation } from '../router';
import { Star, Clock, Users, BookOpen, Play, CheckCircle } from 'lucide-react';

type Props = { course: Course; enrolled?: boolean };

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const THUMBNAILS = [
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600',
];

function getThumb(course: Course) {
  if (course.thumbnail_url) return course.thumbnail_url;
  const idx = parseInt(course.id.replace(/-/g, '').slice(0, 8), 16) % THUMBNAILS.length;
  return THUMBNAILS[idx];
}

export default function CourseCard({ course, enrolled }: Props) {
  const { navigate } = useLocation();

  return (
    <div
      className="card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate('course-detail', { courseId: course.id })}
    >
      <div className="relative overflow-hidden h-44">
        <img
          src={getThumb(course)}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`badge text-xs font-semibold ${DIFFICULTY_COLORS[course.difficulty]}`}>
            {course.difficulty}
          </span>
        </div>
        {enrolled && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full">
            <CheckCircle className="w-3 h-3" /> Enrolled
          </div>
        )}
        <div className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
          <Play className="w-4 h-4 text-primary-600 ml-0.5" />
        </div>
      </div>

      <div className="p-4">
        {course.category && (
          <span className="text-xs font-medium text-primary-600 dark:text-primary-400">{course.category.name}</span>
        )}
        <h3 className="font-semibold text-gray-900 dark:text-white mt-1 mb-2 line-clamp-2 text-sm leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{course.description}</p>

        {course.instructor && (
          <div className="flex items-center gap-2 mb-3">
            <img
              src={course.instructor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.full_name)}&background=3b82f6&color=fff&size=32`}
              alt={course.instructor.full_name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{course.instructor.full_name}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">{course.rating.toFixed(1)}</span>
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.total_lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.total_duration_minutes}m
          </span>
          <span className="ml-auto font-bold text-gray-900 dark:text-white text-sm">
            {course.price === 0 ? 'Free' : `₹${Number(course.price).toLocaleString('en-IN')}`}
          </span>
        </div>
      </div>
    </div>
  );
}
