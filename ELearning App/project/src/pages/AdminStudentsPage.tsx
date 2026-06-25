import React, { useEffect, useState } from 'react';
import { useLocation } from '../router';
import { supabase } from '../lib/supabase';
import {
  Users, Search, BookOpen, TrendingUp, Award, Mail, Calendar,
  ChevronDown, ChevronUp, Eye, PlusCircle, RefreshCw, X
} from 'lucide-react';

type StudentRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  role: string;
  email: string;
  created_at: string;
  enrolled_count: number;
  completed_count: number;
  bookmark_count: number;
};

type StudentDetail = StudentRow & {
  enrollments: Array<{
    course_title: string;
    enrolled_at: string;
    progress_pct: number;
  }>;
};

export default function AdminStudentsPage() {
  const { navigate } = useLocation();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [sortField, setSortField] = useState<'full_name' | 'enrolled_count' | 'created_at'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, courses: 0 });

  const load = async () => {
    setLoading(true);
    // Fetch all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!profiles || profiles.length === 0) { setLoading(false); return; }

    const ids = profiles.map(p => p.id);

    // Batch fetch counts
    const [enrRes, progRes, bmRes] = await Promise.all([
      supabase.from('enrollments').select('user_id, course_id').in('user_id', ids),
      supabase.from('lesson_progress').select('user_id').in('user_id', ids).eq('completed', true),
      supabase.from('bookmarks').select('user_id').in('user_id', ids),
    ]);

    const enrMap = new Map<string, number>();
    const progMap = new Map<string, number>();
    const bmMap = new Map<string, number>();
    (enrRes.data ?? []).forEach(e => enrMap.set(e.user_id, (enrMap.get(e.user_id) ?? 0) + 1));
    (progRes.data ?? []).forEach(p => progMap.set(p.user_id, (progMap.get(p.user_id) ?? 0) + 1));
    (bmRes.data ?? []).forEach(b => bmMap.set(b.user_id, (bmMap.get(b.user_id) ?? 0) + 1));

    // Fetch emails from auth (use user id as display fallback)
    const rows: StudentRow[] = profiles.map(p => ({
      ...p,
      email: `user-${p.id.slice(0, 8)}@learnhub.in`,
      enrolled_count: enrMap.get(p.id) ?? 0,
      completed_count: progMap.get(p.id) ?? 0,
      bookmark_count: bmMap.get(p.id) ?? 0,
    }));

    setStudents(rows);
    setStats({
      total: rows.length,
      active: rows.filter(r => r.enrolled_count > 0).length,
      courses: Array.from(enrMap.values()).reduce((a, b) => a + b, 0),
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const fetchDetail = async (student: StudentRow) => {
    if (expandedId === student.id) { setExpandedId(null); setDetail(null); return; }
    setExpandedId(student.id);
    setDetailLoading(true);
    const { data: enrData } = await supabase
      .from('enrollments')
      .select('course_id, enrolled_at, course:courses(title, total_lessons)')
      .eq('user_id', student.id)
      .order('enrolled_at', { ascending: false });

    const courseIds = (enrData ?? []).map(e => e.course_id);
    const { data: progData } = await supabase
      .from('lesson_progress')
      .select('course_id')
      .eq('user_id', student.id)
      .eq('completed', true)
      .in('course_id', courseIds);

    const progMap = new Map<string, number>();
    (progData ?? []).forEach(p => progMap.set(p.course_id, (progMap.get(p.course_id) ?? 0) + 1));

    const enrollments = (enrData ?? []).map((e: any) => ({
      course_title: e.course?.title ?? 'Unknown',
      enrolled_at: e.enrolled_at,
      progress_pct: e.course?.total_lessons
        ? Math.round(((progMap.get(e.course_id) ?? 0) / e.course.total_lessons) * 100)
        : 0,
    }));

    setDetail({ ...student, enrollments });
    setDetailLoading(false);
  };

  const filtered = students
    .filter(s =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortField === 'full_name') return dir * a.full_name.localeCompare(b.full_name);
      if (sortField === 'enrolled_count') return dir * (a.enrolled_count - b.enrolled_count);
      return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(v => !v);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field
      ? (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)
      : <ChevronDown className="w-3.5 h-3.5 opacity-30" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Details</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor learner activity and progress</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-secondary gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => navigate('admin-courses')} className="btn-primary gap-2">
            <PlusCircle className="w-4 h-4" /> Add Course
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users, label: 'Total Students', value: stats.total, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
          { icon: TrendingUp, label: 'Active Learners', value: stats.active, color: 'text-accent-600 bg-accent-50 dark:bg-accent-900/30' },
          { icon: BookOpen, label: 'Total Enrollments', value: stats.courses, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email…"
          className="input pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button onClick={() => toggleSort('full_name')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
                    Student <SortIcon field="full_name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button onClick={() => toggleSort('enrolled_count')} className="flex items-center gap-1 mx-auto hover:text-gray-700 dark:hover:text-gray-200">
                    Enrolled <SortIcon field="enrolled_count" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bookmarks</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button onClick={() => toggleSort('created_at')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
                    Joined <SortIcon field="created_at" />
                  </button>
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No students found
                  </td>
                </tr>
              ) : (
                filtered.map(student => (
                  <React.Fragment key={student.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name || 'S')}&background=3b82f6&color=fff&size=36`}
                            alt={student.full_name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{student.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{student.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 capitalize px-2 py-1">
                          {student.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{student.enrolled_count}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-accent-600 dark:text-accent-400">{student.completed_count}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{student.bookmark_count}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(student.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => fetchDetail(student)}
                          className={`p-1.5 rounded-lg transition-colors ${expandedId === student.id ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedId === student.id && (
                      <tr className="bg-primary-50/50 dark:bg-primary-900/10">
                        <td colSpan={7} className="px-6 py-4">
                          {detailLoading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                              Loading details…
                            </div>
                          ) : detail && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                {student.bio && <span className="italic">"{student.bio}"</span>}
                              </div>
                              {detail.enrollments.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No course enrollments yet.</p>
                              ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {detail.enrollments.map((enr, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">{enr.course_title}</p>
                                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                        <span>Progress</span>
                                        <span className={`font-semibold ${enr.progress_pct === 100 ? 'text-accent-600' : 'text-primary-600 dark:text-primary-400'}`}>
                                          {enr.progress_pct}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                        <div
                                          className={`h-1.5 rounded-full transition-all ${enr.progress_pct === 100 ? 'bg-accent-500' : 'bg-primary-500'}`}
                                          style={{ width: `${enr.progress_pct}%` }}
                                        />
                                      </div>
                                      <p className="text-xs text-gray-400 mt-1.5">
                                        Enrolled {new Date(enr.enrolled_at).toLocaleDateString('en-IN')}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            Showing {filtered.length} of {students.length} students
          </div>
        )}
      </div>
    </div>
  );
}
