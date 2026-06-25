import React, { useEffect, useState } from 'react';
import { useLocation } from '../router';
import { supabase, Bookmark } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Bookmark as BookmarkIcon, Play, Clock, Trash2, BookOpen } from 'lucide-react';

export default function BookmarksPage() {
  const { navigate } = useLocation();
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('bookmarks')
      .select('*, lesson:lessons(*), course:courses(id, title, thumbnail_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setBookmarks(data ?? []); setLoading(false); });
  }, [user]);

  const removeBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('bookmarks').delete().eq('id', id);
    setBookmarks(bs => bs.filter(b => b.id !== id));
  };

  const THUMBNAILS = [
    'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=400',
  ];
  function getThumb(courseId: string, url?: string | null) {
    if (url) return url;
    const idx = parseInt(courseId.replace(/-/g, '').slice(0, 8), 16) % THUMBNAILS.length;
    return THUMBNAILS[idx];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookmarks</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Your saved lessons for quick access</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 flex gap-4">
              <div className="skeleton w-32 h-20 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookmarkIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No bookmarks yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Bookmark lessons while studying to save them here
          </p>
          <button onClick={() => navigate('courses')} className="btn-primary">Browse Courses</button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(bm => (
            <div
              key={bm.id}
              className="card p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              onClick={() => navigate('lesson', { lessonId: bm.lesson_id, courseId: bm.course_id })}
            >
              <div className="w-32 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={getThumb(bm.course_id, bm.course?.thumbnail_url)}
                  alt={bm.lesson?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                  <span className="text-xs text-primary-600 dark:text-primary-400 font-medium truncate">{bm.course?.title}</span>
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                  {bm.lesson?.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {bm.lesson?.duration_minutes}m
                  </span>
                  <span>Saved {new Date(bm.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); navigate('lesson', { lessonId: bm.lesson_id, courseId: bm.course_id }); }}
                  className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={e => removeBookmark(bm.id, e)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
