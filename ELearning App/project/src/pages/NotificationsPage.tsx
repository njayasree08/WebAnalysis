import React, { useEffect, useState } from 'react';
import { supabase, Notification } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Bell, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle, BellOff } from 'lucide-react';

const TYPE_CONFIG = {
  info: { icon: Info, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' },
  success: { icon: CheckCircle, color: 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/30' },
  warning: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30' },
  error: { icon: XCircle, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30' },
};

type Props = { onUnreadChange: (n: number) => void };

export default function NotificationsPage({ onUnreadChange }: Props) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setNotifications(data ?? []);
    const unread = (data ?? []).filter(n => !n.is_read).length;
    onUnreadChange(unread);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [user]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
    onUnreadChange(notifications.filter(n => !n.is_read && n.id !== id).length);
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    setNotifications(ns => ns.map(n => ({ ...n, is_read: true })));
    onUnreadChange(0);
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(ns => ns.filter(n => n.id !== id));
    onUnreadChange(notifications.filter(n => !n.is_read && n.id !== id).length);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 flex gap-4">
              <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">You're all caught up! Notifications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const config = TYPE_CONFIG[notif.type];
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markRead(notif.id)}
                className={`card p-4 flex items-start gap-4 transition-all hover:shadow-md cursor-pointer ${!notif.is_read ? 'border-l-4 border-l-primary-500' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!notif.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={e => deleteNotification(notif.id, e)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
