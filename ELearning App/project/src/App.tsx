import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { RouterProvider, useLocation } from './router';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonPage from './pages/LessonPage';
import MyLearningPage from './pages/MyLearningPage';
import BookmarksPage from './pages/BookmarksPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import { supabase } from './lib/supabase';

function AppContent() {
  const { user, loading } = useAuth();
  const { currentPage } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .then(({ count }) => setUnreadCount(count ?? 0));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading LearnHub...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const isLessonPage = currentPage === 'lesson';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {!isLessonPage && (
        <Navbar
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          unreadCount={unreadCount}
        />
      )}
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'courses' && <CoursesPage searchQuery={searchQuery} onSearch={setSearchQuery} />}
        {currentPage === 'course-detail' && <CourseDetailPage />}
        {currentPage === 'lesson' && <LessonPage />}
        {currentPage === 'my-learning' && <MyLearningPage />}
        {currentPage === 'bookmarks' && <BookmarksPage />}
        {currentPage === 'notifications' && (
          <NotificationsPage onUnreadChange={setUnreadCount} />
        )}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'admin-courses' && <AdminCoursesPage />}
        {currentPage === 'admin-students' && <AdminStudentsPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
