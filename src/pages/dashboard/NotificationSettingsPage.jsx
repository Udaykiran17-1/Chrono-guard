import { useEffect, useState } from 'react';
import { Bell, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotificationPreferences, updateNotificationPreferences } from '../../services/notificationService';
import PageContainer from '../../components/layout/PageContainer';
import { Button, Card, CardBody, CardHeader, Spinner } from '../../components/ui';

export default function NotificationSettingsPage() {
  const { user } = useAuth(); const [preferences, setPreferences] = useState({ in_app_enabled: true, email_enabled: false });
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  useEffect(() => { let active = true; getNotificationPreferences(user?.id).then((data) => { if (active) setPreferences(data); }).catch((err) => { if (active) setError(err.message || 'Could not load preferences.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [user?.id]);
  const save = async () => { setSaving(true); setMessage(''); setError(''); try { const saved = await updateNotificationPreferences(user.id, preferences); setPreferences(saved); setMessage('Notification preferences saved.'); } catch (err) { setError(err.message || 'Could not save preferences.'); } finally { setSaving(false); } };
  return <PageContainer className="py-8 max-w-2xl">
    <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">Account settings</p><h1 className="mt-1 text-2xl font-bold">Notification preferences</h1><p className="mt-1 text-sm text-slate-600">Choose how SkillBridge updates you about project activity.</p></div>
    <Card><CardHeader><h2 className="font-semibold">Delivery preferences</h2></CardHeader><CardBody>
      {loading ? <div className="flex justify-center py-5"><Spinner size="md" /></div> : <div className="space-y-5">
        <label className="flex items-start gap-3"><input type="checkbox" checked={preferences.in_app_enabled} onChange={(event) => setPreferences({ ...preferences, in_app_enabled: event.target.checked })} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-indigo" /><span><span className="flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4 text-brand-indigo" />In-app notifications</span><span className="mt-1 block text-xs text-slate-500">Application, agreement, and handover updates appear in your dashboard.</span></span></label>
        <div className="flex items-start gap-3 border-t border-card-border pt-4 opacity-60"><input type="checkbox" checked={false} disabled className="mt-1 h-4 w-4 rounded border-slate-300" /><span><span className="flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4 text-slate-500" />Email notifications</span><span className="mt-1 block text-xs text-slate-500">Email delivery is not configured yet.</span></span></div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}{message && <p role="status" className="text-sm text-teal-700">{message}</p>}
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save preferences'}</Button>
      </div>}
    </CardBody></Card>
  </PageContainer>;
}
