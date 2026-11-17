import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { isSupabaseConfigured } from '../../services/authService';
import PageContainer from '../../components/layout/PageContainer';
import { Badge, Button, Card, CardBody, CardHeader, Spinner } from '../../components/ui';

export default function AdminReportsPage() {
  const { profile } = useAuth(); const [reports, setReports] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [stats, setStats] = useState(null); const [profileEmail, setProfileEmail] = useState(''); const [moderationProfile, setModerationProfile] = useState(null);
  const load = useCallback(async () => {
    if (profile?.platform_role !== 'admin' || !isSupabaseConfigured()) { setLoading(false); return; }
    const [reportResult, usersResult, orgsResult, activeResult, completedResult, pendingResult] = await Promise.all([
      supabase.from('content_reports').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('organizations').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }).in('status', ['open', 'reviewing', 'in_progress']),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('content_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);
    const queryError = [reportResult, usersResult, orgsResult, activeResult, completedResult, pendingResult].find((item) => item.error)?.error;
    if (queryError) setError(queryError.message); else {
      setReports(reportResult.data || []);
      setStats({ users: usersResult.count || 0, organizations: orgsResult.count || 0, active: activeResult.count || 0, completed: completedResult.count || 0, pending: pendingResult.count || 0 });
    }
    setLoading(false);
  }, [profile?.platform_role]);
  useEffect(() => { load(); }, [load]);
  const setStatus = async (report, status) => {
    setError('');
    const { error: updateError } = await supabase.from('content_reports').update({ status, resolution_note: status === 'resolved' ? 'Reviewed by platform moderator.' : null }).eq('id', report.id);
    if (updateError) { setError(updateError.message); return; }
    await supabase.from('moderation_actions').insert({ moderator_id: profile.id, report_id: report.id, action: status === 'dismissed' ? 'dismiss_report' : 'resolve_report', details: `Report status set to ${status}.` });
    await load();
  };
  const hideReview = async (report) => {
    setError('');
    const { error: hideError } = await supabase.from('project_reviews').update({ moderation_status: 'hidden' }).eq('id', report.target_id);
    if (hideError) { setError(hideError.message); return; }
    await supabase.from('moderation_actions').insert({ moderator_id: profile.id, report_id: report.id, action: 'hide_review', details: 'Review hidden after report review.' });
    await setStatus(report, 'resolved');
  };
  const findProfile = async (event) => {
    event.preventDefault(); setError(''); setModerationProfile(null);
    const { data, error: queryError } = await supabase.from('profiles').select('id, full_name, email, account_status').eq('email', profileEmail.trim()).maybeSingle();
    if (queryError) setError(queryError.message); else if (!data) setError('No account matched that exact email address.'); else setModerationProfile(data);
  };
  const changeAccountStatus = async (status) => {
    if (!moderationProfile) return;
    const { error: updateError } = await supabase.from('profiles').update({ account_status: status }).eq('id', moderationProfile.id);
    if (updateError) { setError(updateError.message); return; }
    await supabase.from('moderation_actions').insert({ moderator_id: profile.id, action: 'account_action', details: `Account ${moderationProfile.id} status changed to ${status}.` });
    setModerationProfile({ ...moderationProfile, account_status: status });
  };
  if (profile?.platform_role !== 'admin') return <PageContainer className="py-12"><Card><CardBody><h1 className="text-lg font-bold">Administrator access required</h1><p className="mt-2 text-sm text-slate-600">This moderation queue is restricted to platform administrators.</p></CardBody></Card></PageContainer>;
  return <PageContainer className="py-8 max-w-4xl">
    <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">Trust and safety</p><h1 className="mt-1 text-2xl font-bold">Content reports</h1><p className="mt-1 text-sm text-slate-600">Review user reports and record moderation actions.</p></div>
    {error && <p role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {stats && <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">{[['Registered users', stats.users], ['Organizations', stats.organizations], ['Active projects', stats.active], ['Completed projects', stats.completed], ['Pending reports', stats.pending]].map(([label, value]) => <Card key={label}><CardBody><p className="text-2xl font-bold text-brand-indigo">{value}</p><p className="text-xs text-slate-500">{label}</p></CardBody></Card>)}</div>}
    <Card className="mb-6"><CardHeader><h2 className="font-semibold">Account moderation</h2></CardHeader><CardBody><form onSubmit={findProfile} className="flex flex-wrap gap-2"><input type="email" required value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} placeholder="Find account by exact email" className="min-w-64 flex-1 rounded border border-card-border px-3 py-2 text-sm" /><Button type="submit" variant="outline">Find account</Button></form>{moderationProfile && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded border border-card-border p-3"><div><p className="text-sm font-semibold">{moderationProfile.full_name}</p><p className="text-xs text-slate-500">{moderationProfile.email} · {moderationProfile.account_status}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" disabled={moderationProfile.account_status === 'active'} onClick={() => changeAccountStatus('active')}>Activate</Button><Button size="sm" variant="danger" disabled={moderationProfile.account_status === 'suspended'} onClick={() => changeAccountStatus('suspended')}>Suspend</Button><Button size="sm" variant="ghost" disabled={moderationProfile.account_status === 'deactivated'} onClick={() => changeAccountStatus('deactivated')}>Deactivate</Button></div></div>}</CardBody></Card>
    {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : reports.length === 0 ? <Card><CardBody className="py-10 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-teal-600" /><p className="mt-2 text-sm font-semibold">No reports to review</p></CardBody></Card> : <div className="space-y-4">{reports.map((report) => <Card key={report.id}><CardHeader className="flex items-center justify-between"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /><h2 className="font-semibold">{report.target_type} report</h2></div><Badge variant={report.status === 'pending' ? 'amber' : report.status === 'resolved' ? 'teal' : 'neutral'}>{report.status}</Badge></CardHeader><CardBody><p className="text-sm text-slate-800">{report.reason}</p><p className="mt-1 text-xs text-slate-500">Target ID: {report.target_id} · Filed {new Date(report.created_at).toLocaleString()}</p><div className="mt-4 flex flex-wrap gap-2">{report.target_type === 'review' && report.status !== 'resolved' && <Button size="sm" variant="danger" onClick={() => hideReview(report)}>Hide reported review</Button>}{report.status === 'pending' && <Button size="sm" variant="outline" onClick={() => setStatus(report, 'reviewing')}>Mark reviewing</Button>}{['pending', 'reviewing'].includes(report.status) && <><Button size="sm" onClick={() => setStatus(report, 'resolved')}>Resolve</Button><Button size="sm" variant="ghost" onClick={() => setStatus(report, 'dismissed')}>Dismiss</Button></>}</div></CardBody></Card>)}</div>}
  </PageContainer>;
}
