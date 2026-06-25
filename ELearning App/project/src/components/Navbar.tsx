import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from '../router';
import {
  GraduationCap, Home, BookOpen, Bookmark, Bell, User, Search,
  Moon, Sun, Menu, X, LogOut, ChevronDown, TrendingUp,
  LayoutDashboard, Users, PlusCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

type NavbarProps = {
  onSearch: (q: string) => void;
  searchQuery: string;
  unreadCount: number;
};

export default function Navbar({ onSearch, searchQuery, unreadCount }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentPage, navigate } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) setAdminOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { label: 'Home', page: 'home', icon: Home },
    { label: 'Courses', page: 'courses', icon: BookOpen },
    { label: 'My Learning', page: 'my-learning', icon: TrendingUp },
    { label: 'Bookmarks', page: 'bookmarks', icon: Bookmark },
  ];

  const isAdminPage = currentPage === 'admin-courses' || currentPage === 'admin-students';
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&background=3b82f6&color=fff&size=64`;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">LearnHub</span>
          </button>

          {/* Search Bar */}
          <div className={`hidden md:flex flex-1 max-w-md mx-6 relative transition-all duration-200 ${searchFocused ? 'max-w-lg' : ''}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, topics..."
              className="input pl-9 py-2 text-sm"
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              onFocus={() => { setSearchFocused(true); if (currentPage !== 'courses') navigate('courses'); }}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ label, page, icon: Icon }) => (
              <button
                key={page}
                onClick={() => navigate(page)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}

            {/* Admin Dropdown */}
            <div className="relative" ref={adminRef}>
              <button
                onClick={() => setAdminOpen(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isAdminPage
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
              </button>
              {adminOpen && (
                <div className="absolute right-0 mt-2 w-48 card shadow-xl py-1 animate-slide-down">
                  <button
                    onClick={() => { navigate('admin-students'); setAdminOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Users className="w-4 h-4 text-primary-500" /> Student Details
                  </button>
                  <button
                    onClick={() => { navigate('admin-courses'); setAdminOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-accent-500" /> Add Course
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => navigate('notifications')}
              className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/20" />
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 card shadow-xl py-1 animate-slide-down">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile?.full_name || 'Student'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('profile'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </button>
                  <button
                    onClick={() => { navigate('my-learning'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" /> My Progress
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                    <button
                      onClick={() => { navigate('admin-students'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Admin Panel
                    </button>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-slide-down">
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="input pl-9 py-2 text-sm"
                value={searchQuery}
                onChange={e => onSearch(e.target.value)}
                onFocus={() => navigate('courses')}
              />
            </div>
          </div>
          <div className="px-2 pb-3 space-y-1">
            {navLinks.map(({ label, page, icon: Icon }) => (
              <button
                key={page}
                onClick={() => { navigate(page); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
              <button
                onClick={() => { navigate('admin-students'); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Users className="w-4 h-4" /> Student Details
              </button>
              <button
                onClick={() => { navigate('admin-courses'); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add Course
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
