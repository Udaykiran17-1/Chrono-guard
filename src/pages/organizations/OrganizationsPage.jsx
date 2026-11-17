import { useCallback, useEffect, useState } from 'react';
import { Building2, Plus, Users, ArrowRightLeft, BriefcaseBusiness } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../services/authService';
import { addFreelancerRecord, addOrganizationMember, createHandover, createOrganization, getIncomingHandovers, getMyOrganizations, getOrganizationWorkspace, respondToHandover } from '../../services/organizationService';
import PageContainer from '../../components/layout/PageContainer';
import { Badge, Button, Card, CardBody, CardHeader, Spinner } from '../../components/ui';

export default function OrganizationsPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]); const [selectedId, setSelectedId] = useState(''); const [workspace, setWorkspace] = useState(null);
  const [incomingHandovers, setIncomingHandovers] = useState([]);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const [newOrg, setNewOrg] = useState({ name: '', description: '', category: 'Student organization', contact_email: '' });
  const [member, setMember] = useState({ userId: '', role: 'member', permissions: 'view,view_records' });
  const [record, setRecord] = useState({ freelancer_id: '', project_id: '', skills: '', collaboration_date: '', agreed_price: '', payment_status: 'not_recorded', deliverables: '', feedback: '', notes: '' });
  const [handover, setHandover] = useState({ incomingUserId: '', payload: '{\n  "freelancer_contacts": [],\n  "project_costs": [],\n  "outstanding_payments": [],\n  "active_projects": [],\n  "important_documents": []\n}' });
  const refresh = useCallback(async (nextId) => {
    if (!user?.id) return;
    const [list, pendingHandovers] = await Promise.all([getMyOrganizations(user.id), getIncomingHandovers(user.id)]);
    setOrganizations(list); setIncomingHandovers(pendingHandovers);
    const chosenId = nextId || list[0]?.id || '';
    setSelectedId(chosenId);
    setWorkspace(chosenId ? await getOrganizationWorkspace(chosenId) : null);
  }, [user]);
  useEffect(() => {
    let active = true;
    (async () => { try { await refresh(); } catch (err) { if (active) setError(err.message || 'Could not load organizations.'); } finally { if (active) setLoading(false); } })();
    return () => { active = false; };
  }, [refresh]);
  const perform = async (action) => { setSaving(true); setError(''); try { const id = await action(); await refresh(id || selectedId); } catch (err) { setError(err.message || 'Could not save changes.'); } finally { setSaving(false); } };

  if (!isSupabaseConfigured()) return <PageContainer className="py-10"><Card><CardBody><h1 className="text-lg font-bold">Organization workspace</h1><p className="mt-2 text-sm text-slate-600">Connect Supabase to use organization records, permissions, and handovers. Local demo mode does not store organization data.</p></CardBody></Card></PageContainer>;
  return <PageContainer className="py-8 max-w-6xl">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">Campus continuity</p><h1 className="mt-1 text-2xl font-bold">Organizations</h1><p className="mt-1 text-sm text-slate-600">Keep project history, freelancer relationships, and committee handovers with the organization.</p></div>{workspace && <select value={selectedId} onChange={async (e) => { setSelectedId(e.target.value); try { setWorkspace(await getOrganizationWorkspace(e.target.value)); } catch (err) { setError(err.message); } }} className="rounded-md border border-card-border bg-white px-3 py-2 text-sm">{organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select>}</div>
    {error && <p role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <div className="py-12 flex justify-center"><Spinner size="lg" /></div> : <div className="space-y-5">
      {incomingHandovers.length > 0 && <Card><CardHeader><h2 className="flex items-center gap-2 font-semibold"><ArrowRightLeft className="h-4 w-4" />Incoming committee handovers</h2><p className="text-xs text-slate-500">Review the transfer details before accepting access to the organization.</p></CardHeader><CardBody className="space-y-3">{incomingHandovers.map((item) => <div key={item.id} className="rounded border border-card-border p-3"><p className="text-sm font-semibold">Organization handover · {item.organization_id}</p><pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-600">{JSON.stringify(item.payload, null, 2)}</pre><div className="mt-3 flex gap-2"><Button size="sm" onClick={() => perform(async () => { await respondToHandover(item.id, 'accepted'); })}>Accept handover</Button><Button size="sm" variant="outline" onClick={() => perform(async () => { await respondToHandover(item.id, 'declined'); })}>Decline</Button></div></div>)}</CardBody></Card>}
      <div className="grid gap-6 lg:grid-cols-3">
      {!workspace && <Card className="lg:col-span-1"><CardHeader><h2 className="flex items-center gap-2 font-semibold"><Building2 className="h-4 w-4" />Create an organization</h2></CardHeader><CardBody><form className="space-y-3" onSubmit={(e) => { e.preventDefault(); perform(async () => { const org = await createOrganization(user.id, newOrg); setNewOrg({ name: '', description: '', category: 'Student organization', contact_email: '' }); return org.id; }); }}>
        <Field label="Organization name" required value={newOrg.name} onChange={(value) => setNewOrg({ ...newOrg, name: value })} />
        <Field label="Category" required value={newOrg.category} onChange={(value) => setNewOrg({ ...newOrg, category: value })} />
        <Field label="Contact email" type="email" value={newOrg.contact_email} onChange={(value) => setNewOrg({ ...newOrg, contact_email: value })} />
        <Field label="Description" multiline value={newOrg.description} onChange={(value) => setNewOrg({ ...newOrg, description: value })} />
        <Button type="submit" disabled={saving || !newOrg.name.trim()}><Plus className="mr-1 h-4 w-4" />Create organization</Button>
      </form></CardBody></Card>}
      {workspace && <>
        <div className="space-y-6 lg:col-span-2">
          <Card><CardHeader className="flex items-start justify-between"><div><h2 className="text-lg font-bold">{workspace.organization.name}</h2><p className="mt-1 text-sm text-slate-600">{workspace.organization.description || workspace.organization.category}</p></div><Badge variant={workspace.organization.is_official ? 'teal' : 'neutral'}>{workspace.organization.is_official ? 'Official' : 'Community'}</Badge></CardHeader><CardBody><div className="grid gap-3 sm:grid-cols-2"><Metric label="Committee members" value={workspace.members.length} /><Metric label="Saved freelancer records" value={workspace.freelancers.length} /><Metric label="Organization projects" value={workspace.projects.length} /><Metric label="Handovers" value={workspace.handovers.length} /></div></CardBody></Card>

          <Card><CardHeader><h2 className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" />Committee members and permissions</h2></CardHeader><CardBody className="space-y-3">{workspace.members.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-card-border pb-2"><div><p className="text-sm font-semibold">{item.profiles?.full_name || item.profiles?.email || item.user_id}</p><p className="text-xs capitalize text-slate-500">{item.role.replaceAll('_', ' ')} · {item.permissions.join(', ')}</p></div></div>)}
            <form className="grid gap-2 border-t border-card-border pt-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); perform(async () => { await addOrganizationMember(selectedId, member.userId.trim(), member.role, member.permissions.split(',').map((part) => part.trim()).filter(Boolean)); setMember({ ...member, userId: '' }); }); }}>
              <input aria-label="Member profile UUID" required value={member.userId} onChange={(e) => setMember({ ...member, userId: e.target.value })} placeholder="Member profile UUID" className="rounded border border-card-border px-2 py-2 text-sm" />
              <select aria-label="Organization role" value={member.role} onChange={(e) => setMember({ ...member, role: e.target.value })} className="rounded border border-card-border px-2 py-2 text-sm">{['president', 'secretary', 'treasurer', 'event_coordinator', 'media_head', 'member'].map((role) => <option key={role} value={role}>{role.replaceAll('_', ' ')}</option>)}</select>
              <input aria-label="Permissions" value={member.permissions} onChange={(e) => setMember({ ...member, permissions: e.target.value })} placeholder="Comma-separated permissions" className="rounded border border-card-border px-2 py-2 text-xs sm:col-span-2" />
              <Button type="submit" size="sm" disabled={saving} className="sm:col-span-2">Add member</Button>
            </form>
          </CardBody></Card>

          <Card><CardHeader><h2 className="font-semibold">Freelancer directory</h2><p className="text-xs text-slate-500">Visible only to authorized organization members.</p></CardHeader><CardBody className="space-y-4">{workspace.freelancers.map((item) => <div key={item.id} className="rounded-lg border border-card-border p-3"><div className="flex justify-between"><p className="font-semibold">{item.freelancer?.full_name || 'Freelancer'}</p><Badge variant={item.payment_status === 'paid' ? 'teal' : 'amber'}>{item.payment_status.replaceAll('_', ' ')}</Badge></div><p className="mt-1 text-xs text-slate-500">{item.project?.title || 'Previous collaboration'} · {item.skills.join(', ') || 'Skills not recorded'}{item.agreed_price != null ? ` · ₹${Number(item.agreed_price).toLocaleString()}` : ''}</p><p className="mt-2 text-sm text-slate-700">{item.notes || item.deliverables || item.feedback}</p></div>)}
            <form className="grid gap-2 border-t border-card-border pt-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); perform(async () => { await addFreelancerRecord(selectedId, user.id, { ...record, project_id: record.project_id || null, collaboration_date: record.collaboration_date || null, agreed_price: record.agreed_price ? Number(record.agreed_price) : null, skills: record.skills.split(',').map((part) => part.trim()).filter(Boolean) }); setRecord({ ...record, freelancer_id: '', project_id: '', skills: '' }); }); }}>
              <input aria-label="Freelancer profile UUID" required value={record.freelancer_id} onChange={(e) => setRecord({ ...record, freelancer_id: e.target.value })} placeholder="Freelancer profile UUID" className="rounded border border-card-border px-2 py-2 text-sm" />
              <input aria-label="Project UUID" value={record.project_id} onChange={(e) => setRecord({ ...record, project_id: e.target.value })} placeholder="Project UUID (optional)" className="rounded border border-card-border px-2 py-2 text-sm" />
              <input aria-label="Skills" value={record.skills} onChange={(e) => setRecord({ ...record, skills: e.target.value })} placeholder="Skills provided, comma separated" className="rounded border border-card-border px-2 py-2 text-sm sm:col-span-2" />
              <input aria-label="Agreed price" type="number" min="0" value={record.agreed_price} onChange={(e) => setRecord({ ...record, agreed_price: e.target.value })} placeholder="Agreed price" className="rounded border border-card-border px-2 py-2 text-sm" />
              <select aria-label="Payment status" value={record.payment_status} onChange={(e) => setRecord({ ...record, payment_status: e.target.value })} className="rounded border border-card-border px-2 py-2 text-sm"><option value="not_recorded">Not recorded</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="not_applicable">Not applicable</option></select>
              <textarea aria-label="Notes for future committees" value={record.notes} onChange={(e) => setRecord({ ...record, notes: e.target.value })} placeholder="Collaboration notes for future committees" className="rounded border border-card-border px-2 py-2 text-sm sm:col-span-2" />
              <Button type="submit" size="sm" disabled={saving} className="sm:col-span-2">Save freelancer record</Button>
            </form>
          </CardBody></Card>

          <Card><CardHeader><h2 className="flex items-center gap-2 font-semibold"><BriefcaseBusiness className="h-4 w-4" />Permanent project history</h2></CardHeader><CardBody>{workspace.projects.length ? workspace.projects.map((project) => <div key={project.id} className="flex justify-between border-b border-card-border py-2 text-sm"><span>{project.title}</span><Badge variant="neutral">{project.status}</Badge></div>) : <p className="text-sm text-slate-500">No projects have been linked to this organization yet.</p>}</CardBody></Card>
        </div>
        <div className="space-y-6">
          <Card><CardHeader><h2 className="flex items-center gap-2 font-semibold"><ArrowRightLeft className="h-4 w-4" />Committee handover</h2></CardHeader><CardBody className="space-y-3">{workspace.handovers.map((item) => <div key={item.id} className="rounded border border-card-border p-3"><div className="flex items-center justify-between"><span className="text-sm font-semibold">Handover</span><Badge variant={item.status === 'accepted' ? 'teal' : 'amber'}>{item.status}</Badge></div><pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-600">{JSON.stringify(item.payload, null, 2)}</pre>{item.incoming_user_id === user.id && item.status === 'pending' && <div className="mt-2 flex gap-2"><Button size="sm" onClick={() => perform(async () => { await respondToHandover(item.id, 'accepted'); })}>Accept</Button><Button size="sm" variant="outline" onClick={() => perform(async () => { await respondToHandover(item.id, 'declined'); })}>Decline</Button></div>}</div>)}
            <form className="space-y-2 border-t border-card-border pt-3" onSubmit={(e) => { e.preventDefault(); perform(async () => { let payload; try { payload = JSON.parse(handover.payload); } catch { throw new Error('Handover details must be valid JSON.'); } await createHandover(selectedId, user.id, handover.incomingUserId.trim(), payload); }); }}>
              <input aria-label="Incoming administrator UUID" required value={handover.incomingUserId} onChange={(e) => setHandover({ ...handover, incomingUserId: e.target.value })} placeholder="Incoming administrator UUID" className="w-full rounded border border-card-border px-2 py-2 text-sm" />
              <textarea aria-label="Handover contents" rows="8" required value={handover.payload} onChange={(e) => setHandover({ ...handover, payload: e.target.value })} className="w-full rounded border border-card-border px-2 py-2 font-mono text-xs" />
              <Button type="submit" size="sm" disabled={saving}>Prepare handover</Button>
            </form>
          </CardBody></Card>
        </div>
      </>}
      </div>
    </div>}</PageContainer>;
}

function Field({ label, value, onChange, required, type = 'text', multiline = false }) {
  const shared = { required, value, onChange: (event) => onChange(event.target.value), className: 'mt-1 w-full rounded border border-card-border px-3 py-2 text-sm' };
  return <label className="block text-xs font-medium text-slate-600">{label}{multiline ? <textarea {...shared} rows="3" /> : <input {...shared} type={type} />}</label>;
}
function Metric({ label, value }) { return <div className="rounded-lg bg-slate-50 p-3"><p className="text-2xl font-bold text-brand-indigo">{value}</p><p className="text-xs text-slate-500">{label}</p></div>; }
