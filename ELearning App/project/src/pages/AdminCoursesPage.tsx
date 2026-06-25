import React, { useEffect, useState } from 'react';
import { useLocation } from '../router';
import { supabase, Category } from '../lib/supabase';
import {
  PlusCircle, BookOpen, ArrowLeft, CheckCircle, AlertCircle,
  Upload, Clock, Users, Star, IndianRupee, GraduationCap
} from 'lucide-react';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

const THUMBNAIL_PRESETS = [
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=600',
];

type LessonDraft = {
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  is_preview: boolean;
};

const emptyLesson = (): LessonDraft => ({
  title: '',
  description: '',
  video_url: '',
  duration_minutes: 30,
  is_preview: false,
});

export default function AdminCoursesPage() {
  const { navigate } = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'lessons'>('details');

  // Course fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTIES[number]>('beginner');
  const [price, setPrice] = useState('0');
  const [thumbnailUrl, setThumbnailUrl] = useState(THUMBNAIL_PRESETS[0]);
  const [rating, setRating] = useState('4.5');

  // Lessons
  const [lessons, setLessons] = useState<LessonDraft[]>([emptyLesson()]);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data ?? []));
  }, []);

  const totalDuration = lessons.reduce((acc, l) => acc + (Number(l.duration_minutes) || 0), 0);

  const updateLesson = (idx: number, field: keyof LessonDraft, value: string | number | boolean) => {
    setLessons(ls => ls.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const addLesson = () => setLessons(ls => [...ls, emptyLesson()]);
  const removeLesson = (idx: number) => setLessons(ls => ls.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!title.trim()) { setError('Course title is required'); return; }
    if (!description.trim()) { setError('Description is required'); return; }
    if (!categoryId) { setError('Please select a category'); return; }
    if (lessons.some(l => !l.title.trim())) { setError('All lessons must have a title'); return; }

    setSaving(true);
    setError('');

    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .insert({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        difficulty,
        price: parseFloat(price) || 0,
        thumbnail_url: thumbnailUrl,
        rating: parseFloat(rating) || 4.5,
        total_lessons: lessons.length,
        total_duration_minutes: totalDuration,
        students_count: 0,
        is_published: true,
      })
      .select()
      .single();

    if (courseErr || !course) {
      setError(courseErr?.message ?? 'Failed to create course');
      setSaving(false);
      return;
    }

    const lessonRows = lessons.map((l, idx) => ({
      course_id: course.id,
      title: l.title.trim(),
      description: l.description.trim(),
      video_url: l.video_url.trim(),
      duration_minutes: Number(l.duration_minutes) || 30,
      order_index: idx,
      is_preview: l.is_preview,
    }));

    const { error: lessonErr } = await supabase.from('lessons').insert(lessonRows);
    if (lessonErr) {
      setError(lessonErr.message);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    setTimeout(() => {
      navigate('course-detail', { courseId: course.id });
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('admin-students')}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Course</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and publish a new course with lessons</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-xl text-accent-700 dark:text-accent-400 animate-slide-down">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          Course created successfully! Redirecting…
        </div>
      )}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 animate-slide-down">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
        {(['details', 'lessons'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'details' ? 'Course Details' : `Lessons (${lessons.length})`}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course Title *</label>
                <input className="input" placeholder="e.g. Complete JavaScript Bootcamp" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
                <textarea
                  className="input resize-none h-32"
                  placeholder="Describe what students will learn in this course…"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                  <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Difficulty</label>
                  <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)}>
                    {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> Price (₹)</span>
                  </label>
                  <input type="number" min="0" className="input" placeholder="0 for free" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Initial Rating</span>
                  </label>
                  <input type="number" min="1" max="5" step="0.1" className="input" value={rating} onChange={e => setRating(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Thumbnail</h3>
              <div className="rounded-xl overflow-hidden h-36 mb-3">
                <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {THUMBNAIL_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setThumbnailUrl(url)}
                    className={`rounded-lg overflow-hidden h-12 border-2 transition-all ${thumbnailUrl === url ? 'border-primary-500' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Preview</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Lessons</span><span className="font-medium text-gray-900 dark:text-white">{lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span><span className="font-medium text-gray-900 dark:text-white">{totalDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Level</span><span className="font-medium text-gray-900 dark:text-white capitalize">{difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {parseFloat(price) === 0 ? 'Free' : `₹${Number(price).toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <div className="space-y-4 animate-fade-in">
          {lessons.map((lesson, idx) => (
            <div key={idx} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Lesson {idx + 1}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lesson.is_preview}
                      onChange={e => updateLesson(idx, 'is_preview', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Free Preview
                  </label>
                  {lessons.length > 1 && (
                    <button onClick={() => removeLesson(idx)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Remove</button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
                  <input
                    className="input text-sm"
                    placeholder="Lesson title"
                    value={lesson.title}
                    onChange={e => updateLesson(idx, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">YouTube URL</label>
                  <input
                    className="input text-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={lesson.video_url}
                    onChange={e => updateLesson(idx, 'video_url', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                  <input
                    className="input text-sm"
                    placeholder="Brief lesson description"
                    value={lesson.description}
                    onChange={e => updateLesson(idx, 'description', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className="input text-sm"
                    value={lesson.duration_minutes}
                    onChange={e => updateLesson(idx, 'duration_minutes', parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addLesson} className="btn-secondary w-full py-3 border-dashed">
            <PlusCircle className="w-4 h-4" /> Add Another Lesson
          </button>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate('courses')} className="btn-secondary">
          Cancel
        </button>
        <div className="flex items-center gap-3">
          {activeTab === 'details' && (
            <button onClick={() => setActiveTab('lessons')} className="btn-secondary">
              Next: Add Lessons →
            </button>
          )}
          <button onClick={handleSave} disabled={saving || success} className="btn-primary px-8 py-2.5">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <><PlusCircle className="w-4 h-4" /> Publish Course</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
