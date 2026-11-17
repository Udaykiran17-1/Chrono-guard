import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';

const MOCK_NOTIFICATIONS_KEY = 'skillbridge_mock_notifications';

// Initial mock notifications for demo testing
const DEFAULT_MOCK_NOTIFICATIONS = [
  {
    id: 'demo-notif-1',
    user_id: 'mock-user-1',
    type: 'welcome',
    title: 'Welcome to SkillBridge! 🚀',
    message: 'Explore campus project opportunities or showcase your portfolio to student clubs.',
    link_url: '/projects',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'demo-notif-2',
    user_id: 'mock-user-1',
    type: 'recommendation',
    title: 'New Matching Project Available ✨',
    message: 'A new project "ACM Student Chapter Annual Website Revamp" matches your technical skills.',
    link_url: '/projects/demo-proj-1',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 hours ago
  },
];

/**
 * Get all notifications for a specific user
 */
export async function getNotifications(userId) {
  if (!userId) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  }

  // Mock Mode
  const allNotifs = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || 'null');
  if (!allNotifs) {
    localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_MOCK_NOTIFICATIONS));
    return DEFAULT_MOCK_NOTIFICATIONS.filter(
      (n) => n.user_id === userId || n.user_id === 'mock-user-1'
    );
  }

  return allNotifs
    .filter((n) => n.user_id === userId || n.user_id === 'mock-user-1')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId) {
  if (!userId) return 0;

  if (isSupabaseConfigured()) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  }

  const notifs = await getNotifications(userId);
  return notifs.filter((n) => !n.is_read).length;
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId) {
  if (!notificationId) return;

  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) console.error('Error marking notification read:', error);
    return;
  }

  // Mock Mode
  const allNotifs = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || '[]');
  const updated = allNotifs.map((n) =>
    n.id === notificationId ? { ...n, is_read: true } : n
  );
  localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(updated));
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllAsRead(userId) {
  if (!userId) return;

  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) console.error('Error marking all notifications read:', error);
    return;
  }

  // Mock Mode
  const allNotifs = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || '[]');
  const updated = allNotifs.map((n) =>
    n.user_id === userId || n.user_id === 'mock-user-1'
      ? { ...n, is_read: true }
      : n
  );
  localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(updated));
}

/**
 * Create a new in-app notification
 */
export async function createNotification({ userId, type, title, message, linkUrl }) {
  if (!userId || !title) return;

  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    type: type || 'system',
    title,
    message: message || '',
    link_url: linkUrl || null,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type: type || 'system',
      title,
      message: message || '',
      link_url: linkUrl || null,
    });
    if (error) console.error('Error creating notification in Supabase:', error);
    return newNotif;
  }

  // Mock Mode
  const allNotifs = JSON.parse(localStorage.getItem(MOCK_NOTIFICATIONS_KEY) || 'null') || DEFAULT_MOCK_NOTIFICATIONS;
  allNotifs.unshift(newNotif);
  localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(allNotifs));
  return newNotif;
}
