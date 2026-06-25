import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Camera, Save, AlertCircle, CheckCircle, Mail, Calendar, BookOpen, Award } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, bookmarks: 0 });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
      supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]).then(([enr, prog, bm]) => {
      setStats({ enrolled: enr.count ?? 0, completed: prog.count ?? 0, bookmarks: bm.count ?? 0 });
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, bio, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) {
      setError(error.message);
    } else {
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'U')}&background=3b82f6&color=fff&size=128`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar + Stats */}
        <div className="space-y-6">
          <div className="card p-6 text-center">
            <div className="relative inline-block">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-primary-100 dark:ring-primary-900/30"
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white mt-3 text-lg">{fullName || 'Student'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{profile?.role || 'student'}</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              Joined {new Date(user?.created_at ?? '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Learning Stats</h3>
            <div className="space-y-3">
              {[
                { icon: BookOpen, label: 'Courses Enrolled', value: stats.enrolled, color: 'text-primary-600' },
                { icon: CheckCircle, label: 'Lessons Completed', value: stats.completed, color: 'text-accent-600' },
                { icon: Award, label: 'Bookmarks', value: stats.bookmarks, color: 'text-amber-600' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>

            {success && (
              <div className="mb-5 flex items-center gap-3 p-3.5 bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-lg text-accent-700 dark:text-accent-400 text-sm animate-slide-down">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Profile updated successfully!
              </div>
            )}
            {error && (
              <div className="mb-5 flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  className="input"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  className="input opacity-60 cursor-not-allowed"
                  value={user?.email ?? ''}
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Bio
                </label>
                <textarea
                  className="input resize-none h-28"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us a little about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Role
                </label>
                <input
                  className="input opacity-60 cursor-not-allowed capitalize"
                  value={profile?.role ?? 'student'}
                  disabled
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary px-6 py-2.5"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
