import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Send, Users, CalendarDays, CheckCircle2, Star, Scale } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { Button, Card, CardBody, CardHeader, Badge, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getApplicationsForProject } from '../../services/applicationService';
import { getWorkspace, createAgreement, proposeAgreementRevision, acceptAgreementVersion, createMilestone, updateMilestone, addProjectUpdate, completeProject, getProjectReviews, submitProjectReview, getSkillEndorsementsForProfile, endorseProjectSkill, createProjectChangeRequest, respondToProjectChange } from '../../services/workspaceService';

const emptyTerms = { deliverables: '', deadline: '', compensation: '', payment_milestones: '', revision_limit: '2', responsibilities: '', additional_work_policy: '' };

export default function ProjectWorkspacePage() {
  const { id } = useParams(); const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null); const [acceptedApplications, setAcceptedApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [terms, setTerms] = useState(emptyTerms); const [milestone, setMilestone] = useState({ title: '', description: '', due_date: '' });
  const [updateText, setUpdateText] = useState(''); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const [changeForm, setChangeForm] = useState({ respondent_id: '', kind: 'scope_change', title: '', details: '', deliverables: '', deadline: '', compensation: '' });
  const [responses, setResponses] = useState({});
  const refresh = useCallback(async () => {
    if (!id || !user?.id) return;
    const data = await getWorkspace(id, user.id); setWorkspace(data);
    setReviews(await getProjectReviews(id));
    const projectMembers = data.members || [];
    const profileEndorsements = await Promise.all(projectMembers.map((member) => getSkillEndorsementsForProfile(member.user_id)));
    setEndorsements(profileEndorsements.flat());
    if (data.project.creator_id === user.id) {
      const applications = await getApplicationsForProject(id); setAcceptedApplications(applications.filter((item) => item.status === 'accepted'));
    }
  }, [id, user]);
  useEffect(() => {
    let active = true;
    (async () => { try { await refresh(); } catch (err) { if (active) setError(err.message || 'Could not load project workspace.'); } finally { if (active) setLoading(false); } })();
    return () => { active = false; };
  }, [refresh]);
  const perform = async (action) => { setSaving(true); setError(''); try { await action(); await refresh(); } catch (err) { setError(err.message || 'Could not save this change.'); } finally { setSaving(false); } };
  const agreements = workspace?.agreements || [];
  const agreement = agreements[0];
  const latestVersion = agreement?.agreement_versions?.slice().sort((a, b) => b.version - a.version)[0] || agreement?.versions?.slice().sort((a, b) => b.version - a.version)[0];
  const isClient = agreement?.client_id === user?.id;
  const currentAccepted = latestVersion?.client_accepted_at && latestVersion?.freelancer_accepted_at;
  const workspaceEnabled = agreements.some((item) => {
    const version = item.agreement_versions?.slice().sort((a, b) => b.version - a.version)[0] || item.versions?.slice().sort((a, b) => b.version - a.version)[0];
    return Boolean(version?.client_accepted_at && version?.freelancer_accepted_at);
  });
  const missingAgreements = acceptedApplications.filter((application) => !agreements.some((item) => item.application_id === application.id));
  const currentMemberRole = workspace?.members.find((member) => member.user_id === user?.id)?.role;

  if (loading) return <PageContainer className="py-16 flex justify-center"><Spinner size="lg" /></PageContainer>;
  if (!workspace) return <PageContainer className="py-12"><Card><CardBody><h1 className="font-bold text-lg">Workspace unavailable</h1><p className="mt-2 text-sm text-slate-600">{error || 'Only accepted project members can open this workspace.'}</p><Link to={`/projects/${id}`} className="mt-4 inline-block text-sm text-brand-indigo">Return to project</Link></CardBody></Card></PageContainer>;

  return <PageContainer className="py-8 max-w-5xl">
    <Link to={`/projects/${id}`} className="mb-5 inline-flex items-center gap-2 text-sm text-brand-indigo"><ArrowLeft className="h-4 w-4" /> Project brief</Link>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">Project workspace</p><h1 className="mt-1 text-2xl font-bold text-slate-900">{workspace.project.title}</h1><p className="mt-1 text-sm text-slate-600">{workspace.project.what_needs_doing}</p></div><Badge variant="indigo">{workspace.project.status.replace('_', ' ').toUpperCase()}</Badge></div>
    {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    {workspace.project.creator_id === user?.id && workspace.project.status === 'in_progress' && workspaceEnabled && <Button className="mb-5" disabled={saving} onClick={() => perform(async () => { await completeProject(id, user.id); })}><CheckCircle2 className="mr-1 h-4 w-4" />Mark project completed</Button>}

    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card><CardHeader><h2 className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4" />Agreement</h2></CardHeader><CardBody className="space-y-4">
          {!agreement ? <>
            {workspace.project.creator_id === user?.id && acceptedApplications.length > 0 ? <p className="text-sm text-slate-600">Prepare a versioned agreement for each accepted freelancer below.</p> : <p className="text-sm text-slate-600">The project creator can prepare agreement terms for the accepted freelancer.</p>}
          </> : <>
            <div className="flex items-center justify-between"><p className="text-sm font-semibold">Version {latestVersion?.version}</p><Badge variant={currentAccepted ? 'teal' : 'amber'}>{currentAccepted ? 'Accepted by both' : 'Awaiting acceptance'}</Badge></div>
            <dl className="grid gap-3 sm:grid-cols-2">{Object.entries(latestVersion?.terms || {}).map(([key, value]) => <div key={key} className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold capitalize text-slate-500">{key.replaceAll('_', ' ')}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{String(value || 'Not specified')}</dd></div>)}</dl>
            {!currentAccepted && !(isClient ? latestVersion?.client_accepted_at : latestVersion?.freelancer_accepted_at) && <Button disabled={saving} onClick={() => perform(async () => { const versionId = latestVersion.id || latestVersion.version; await acceptAgreementVersion(versionId, agreement.id, user.id); })}>Accept version {latestVersion?.version}</Button>}
            {currentAccepted && <p className="text-sm text-teal-800">Both sides accepted this version. Any change requires a new version and fresh acceptance from both parties.</p>}
            <details className="rounded-lg border border-card-border p-3"><summary className="cursor-pointer text-sm font-semibold">Propose a new agreement version</summary><div className="mt-3"><AgreementForm terms={terms} setTerms={setTerms} disabled={saving} onSubmit={() => perform(async () => { await proposeAgreementRevision(agreement.id, terms); })} label="Save new version" /></div></details>
          </>}
        </CardBody></Card>
        {agreements.slice(1).map((item) => <AgreementVersionPanel key={item.id} agreement={item} userId={user.id} saving={saving} terms={terms} setTerms={setTerms} perform={perform} />)}
        {workspace.project.creator_id === user?.id && missingAgreements.length > 0 && <Card><CardHeader><h2 className="font-semibold">Agreements to prepare</h2></CardHeader><CardBody className="space-y-3">{missingAgreements.map((app) => <div key={app.id} className="rounded-lg border border-card-border p-3"><p className="mb-2 text-sm font-semibold">{app.applicant?.full_name || 'Accepted applicant'}</p><AgreementForm terms={terms} setTerms={setTerms} disabled={saving} onSubmit={() => perform(async () => { await createAgreement(app.id, id, terms, user.id, app.applicant_id); })} label="Create agreement" /></div>)}</CardBody></Card>}

        <Card><CardHeader><h2 className="font-semibold">Milestones</h2></CardHeader><CardBody className="space-y-4">
          {!workspaceEnabled && <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">Milestones and progress updates unlock after both parties accept the latest agreement version.</p>}
          <form className="grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); perform(async () => { await createMilestone(id, user.id, milestone); setMilestone({ title: '', description: '', due_date: '' }); }); }}>
            <input aria-label="Milestone title" required maxLength="160" disabled={!workspaceEnabled} placeholder="Milestone title" value={milestone.title} onChange={(e) => setMilestone({ ...milestone, title: e.target.value })} className="rounded-md border border-card-border px-3 py-2 text-sm" />
            <input aria-label="Due date" type="date" disabled={!workspaceEnabled} value={milestone.due_date} onChange={(e) => setMilestone({ ...milestone, due_date: e.target.value })} className="rounded-md border border-card-border px-3 py-2 text-sm" />
            <input aria-label="Description" disabled={!workspaceEnabled} placeholder="Description" value={milestone.description} onChange={(e) => setMilestone({ ...milestone, description: e.target.value })} className="rounded-md border border-card-border px-3 py-2 text-sm sm:col-span-2" />
            <Button type="submit" disabled={saving || !workspaceEnabled} className="sm:col-span-2"><Plus className="mr-1 h-4 w-4" />Add milestone</Button>
          </form>
          {workspace.milestones.length === 0 ? <p className="text-sm text-slate-500">No milestones have been added.</p> : workspace.milestones.map((item) => <div key={item.id} className="rounded-lg border border-card-border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-slate-900">{item.title}</p><select aria-label={`Status for ${item.title}`} value={item.status} onChange={(e) => perform(async () => { await updateMilestone(item.id, { status: e.target.value, updated_at: new Date().toISOString() }); })} className="rounded border border-card-border px-2 py-1 text-xs">{getMilestoneStatuses(item.status, currentMemberRole).map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></div><p className="mt-1 text-sm text-slate-600">{item.description || 'No description'}</p><label className="mt-3 block text-xs font-medium text-slate-500">Completion notes<textarea disabled={!workspaceEnabled} defaultValue={item.completion_notes || ''} onBlur={(e) => { if (e.target.value !== (item.completion_notes || '')) perform(async () => { await updateMilestone(item.id, { completion_notes: e.target.value, updated_at: new Date().toISOString() }); }); }} maxLength="2000" rows="2" className="mt-1 w-full rounded border border-card-border px-2 py-1.5 text-sm text-slate-700" /></label>{item.due_date && <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><CalendarDays className="h-3 w-3" />Due {item.due_date}</p>}</div>)}
        </CardBody></Card>

        <Card><CardHeader><h2 className="font-semibold">Progress updates and comments</h2></CardHeader><CardBody className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); perform(async () => { await addProjectUpdate(id, user.id, updateText); setUpdateText(''); }); }} className="space-y-2"><textarea aria-label="Write a project update" required maxLength="4000" disabled={!workspaceEnabled} rows="3" value={updateText} onChange={(e) => setUpdateText(e.target.value)} placeholder="Share a progress update or feedback..." className="w-full rounded-md border border-card-border px-3 py-2 text-sm" /><Button type="submit" disabled={saving || !workspaceEnabled || !updateText.trim()}><Send className="mr-1 h-4 w-4" />Post update</Button></form>
          {workspace.updates.map((item) => <div key={item.id} className="border-t border-card-border pt-3"><p className="text-sm font-semibold">{item.profiles?.full_name || 'Project member'}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{item.body}</p><p className="mt-1 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p></div>)}
        </CardBody></Card>

        <Card><CardHeader><h2 className="flex items-center gap-2 font-semibold"><Scale className="h-4 w-4" />Scope changes and disputes</h2><p className="text-xs text-slate-500">Raise a written request with the other agreement party. Accepted scope changes create a new agreement version that both sides must accept.</p></CardHeader><CardBody className="space-y-4">
          {workspace.changeRequests.map((request) => <div key={request.id} className="rounded-lg border border-card-border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{request.title}</p><Badge variant={request.status === 'open' ? 'amber' : request.status === 'accepted' || request.status === 'resolved' ? 'teal' : 'neutral'}>{request.kind.replace('_', ' ')} · {request.status}</Badge></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{request.details}</p>{request.response && <p className="mt-2 text-xs text-slate-500">Response: {request.response}</p>}{request.suggested_terms && Object.keys(request.suggested_terms).length > 0 && <p className="mt-2 text-xs text-slate-600">Suggested terms: {Object.entries(request.suggested_terms).map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value}`).join(' · ')}</p>}{request.status === 'open' && request.respondent_id === user?.id && <div className="mt-3 space-y-2"><textarea rows="2" value={responses[request.id] || ''} onChange={(e) => setResponses({ ...responses, [request.id]: e.target.value })} placeholder="Optional response" className="w-full rounded border border-card-border px-2 py-1.5 text-sm" /><div className="flex gap-2">{request.kind === 'scope_change' ? <Button size="sm" disabled={saving} onClick={() => perform(async () => { await respondToProjectChange(request.id, 'accepted', responses[request.id]); })}>Accept and create agreement version</Button> : <Button size="sm" disabled={saving} onClick={() => perform(async () => { await respondToProjectChange(request.id, 'resolved', responses[request.id]); })}>Resolve dispute</Button>}<Button size="sm" variant="outline" disabled={saving} onClick={() => perform(async () => { await respondToProjectChange(request.id, 'declined', responses[request.id]); })}>Decline</Button></div></div>}</div>)}
          {!workspaceEnabled && <p className="rounded bg-amber-50 p-3 text-xs text-amber-800">Requests can be raised after both parties accept the latest agreement.</p>}
          <form onSubmit={(e) => { e.preventDefault(); perform(async () => { const terms = { deliverables: changeForm.deliverables, deadline: changeForm.deadline, compensation: changeForm.compensation }; await createProjectChangeRequest(id, user.id, changeForm.respondent_id, changeForm.kind, changeForm.title, changeForm.details, terms); setChangeForm({ ...changeForm, title: '', details: '', deliverables: '', deadline: '', compensation: '' }); }); }} className="grid gap-2 border-t border-card-border pt-3 sm:grid-cols-2">
            <select aria-label="Request recipient" required disabled={!workspaceEnabled} value={changeForm.respondent_id} onChange={(e) => setChangeForm({ ...changeForm, respondent_id: e.target.value })} className="rounded border border-card-border px-2 py-2 text-sm"><option value="">Choose project participant</option>{[...new Set(agreements.flatMap((item) => [item.client_id, item.freelancer_id]).filter((party) => party !== user?.id))].map((party) => <option key={party} value={party}>{workspace.members.find((member) => member.user_id === party)?.profiles?.full_name || party}</option>)}</select>
            <select aria-label="Request type" disabled={!workspaceEnabled} value={changeForm.kind} onChange={(e) => setChangeForm({ ...changeForm, kind: e.target.value })} className="rounded border border-card-border px-2 py-2 text-sm"><option value="scope_change">Scope change</option><option value="dispute">Dispute</option></select>
            <input required minLength="3" maxLength="160" disabled={!workspaceEnabled} value={changeForm.title} onChange={(e) => setChangeForm({ ...changeForm, title: e.target.value })} placeholder="Request title" className="rounded border border-card-border px-2 py-2 text-sm sm:col-span-2" />
            <textarea required minLength="5" maxLength="4000" disabled={!workspaceEnabled} rows="3" value={changeForm.details} onChange={(e) => setChangeForm({ ...changeForm, details: e.target.value })} placeholder="Describe the requested change or dispute" className="rounded border border-card-border px-2 py-2 text-sm sm:col-span-2" />
            {changeForm.kind === 'scope_change' && <><input disabled={!workspaceEnabled} value={changeForm.deliverables} onChange={(e) => setChangeForm({ ...changeForm, deliverables: e.target.value })} placeholder="Suggested deliverables" className="rounded border border-card-border px-2 py-2 text-sm" /><input disabled={!workspaceEnabled} value={changeForm.deadline} onChange={(e) => setChangeForm({ ...changeForm, deadline: e.target.value })} placeholder="Suggested deadline" className="rounded border border-card-border px-2 py-2 text-sm" /><input disabled={!workspaceEnabled} value={changeForm.compensation} onChange={(e) => setChangeForm({ ...changeForm, compensation: e.target.value })} placeholder="Suggested compensation" className="rounded border border-card-border px-2 py-2 text-sm sm:col-span-2" /></>}
            <Button type="submit" disabled={saving || !workspaceEnabled || !changeForm.respondent_id} className="sm:col-span-2"><Plus className="mr-1 h-4 w-4" />Submit request</Button>
          </form>
        </CardBody></Card>

        {workspace.project.status === 'completed' && <Card><CardHeader><h2 className="flex items-center gap-2 font-semibold"><Star className="h-4 w-4" />Collaboration reviews</h2></CardHeader><CardBody className="space-y-4">
          {workspace.members.filter((member) => member.user_id !== user?.id).map((member) => {
            const existing = reviews.find((review) => review.reviewer_id === user?.id && review.reviewee_id === member.user_id);
            const projectSkills = (workspace.project.project_skills || []).map((item) => item.skills).filter(Boolean);
            return <div key={member.user_id} className="rounded-lg border border-card-border p-3"><p className="mb-2 text-sm font-semibold">{member.profiles?.full_name || 'Project member'}</p>{existing ? <p className="text-sm text-teal-800">Your review is recorded. Overall rating: {existing.overall}/5.</p> : <ReviewForm saving={saving} onSubmit={(values) => perform(async () => { await submitProjectReview(id, user.id, member.user_id, values.ratings, values.feedback); })} />}<div className="mt-3 border-t border-card-border pt-3"><p className="mb-2 text-xs font-semibold text-slate-600">Project based skill endorsements</p><div className="flex flex-wrap gap-2">{projectSkills.map((skill) => { const endorsed = endorsements.some((item) => item.project_id === id && item.skill_id === skill.id && item.endorser_id === user.id && item.student_id === member.user_id); return <Button key={skill.id} size="sm" variant={endorsed ? 'secondary' : 'outline'} disabled={saving || endorsed} onClick={() => perform(async () => { await endorseProjectSkill(id, skill.id, user.id, member.user_id); })}>{endorsed ? `Endorsed ${skill.name}` : `Endorse ${skill.name}`}</Button>; })}{projectSkills.length === 0 && <p className="text-xs text-slate-500">No project skills were tagged for this collaboration.</p>}</div><p className="mt-2 text-[11px] text-slate-500">These endorsements record project participant feedback and do not independently certify skill level.</p></div></div>;
          })}
          {reviews.filter((review) => review.reviewee_id === user?.id).map((review) => <p key={review.id} className="text-xs text-slate-600">Received {review.overall}/5 from {review.reviewer?.full_name || 'a collaborator'}.</p>)}
          {workspace.members.length < 2 && <p className="text-sm text-slate-500">Reviews become available to project participants when the project is completed.</p>}
        </CardBody></Card>}
      </div>
      <Card className="h-fit"><CardHeader><h2 className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" />Project members</h2></CardHeader><CardBody className="space-y-3">{workspace.members.map((member) => <div key={member.user_id} className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-brand-indigo">{(member.profiles?.full_name || member.role).slice(0, 1).toUpperCase()}</div><div><p className="text-sm font-medium">{member.profiles?.full_name || 'Member'}</p><p className="text-xs capitalize text-slate-500">{member.role}</p></div></div>)}</CardBody></Card>
    </div>
  </PageContainer>;
}

function ReviewForm({ saving, onSubmit }) {
  const [ratings, setRatings] = useState({ communication: 5, reliability: 5, quality: 5, deadlines: 5, overall: 5 });
  const [feedback, setFeedback] = useState('');
  return <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); onSubmit({ ratings, feedback }); }}>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{Object.entries(ratings).map(([key, value]) => <label key={key} className="text-xs capitalize text-slate-600">{key.replaceAll('_', ' ')}<select value={value} onChange={(event) => setRatings({ ...ratings, [key]: Number(event.target.value) })} className="mt-1 block w-full rounded border border-card-border px-2 py-1.5">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label>)}</div>
    <textarea required minLength="1" maxLength="2000" rows="3" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Share useful, respectful feedback about working together." className="w-full rounded-md border border-card-border px-3 py-2 text-sm" />
    <Button type="submit" disabled={saving || !feedback.trim()}>Submit review</Button>
  </form>;
}

function AgreementVersionPanel({ agreement, userId, saving, terms, setTerms, perform }) {
  const versions = agreement.agreement_versions || agreement.versions || [];
  const version = versions.slice().sort((a, b) => b.version - a.version)[0];
  const isClient = agreement.client_id === userId;
  const active = Boolean(version?.client_accepted_at && version?.freelancer_accepted_at);
  const alreadyAccepted = isClient ? version?.client_accepted_at : version?.freelancer_accepted_at;
  return <Card><CardHeader><div className="flex items-center justify-between"><h2 className="font-semibold">Agreement for {agreement.freelancer_id === userId ? 'your collaboration' : `freelancer ${agreement.freelancer_id.slice(0, 8)}`}</h2><Badge variant={active ? 'teal' : 'amber'}>{active ? 'Accepted by both' : 'Awaiting acceptance'}</Badge></div></CardHeader><CardBody className="space-y-3"><p className="text-sm font-semibold">Version {version?.version}</p><dl className="grid gap-2 sm:grid-cols-2">{Object.entries(version?.terms || {}).map(([key, value]) => <div key={key} className="rounded bg-slate-50 p-2"><dt className="text-xs capitalize text-slate-500">{key.replaceAll('_', ' ')}</dt><dd className="text-sm">{String(value || 'Not specified')}</dd></div>)}</dl>{!active && !alreadyAccepted && <Button disabled={saving} onClick={() => perform(async () => { await acceptAgreementVersion(version.id || version.version, agreement.id, userId); })}>Accept version {version?.version}</Button>}{active && <p className="text-xs text-teal-700">Both sides accepted this version. A new version will need both acceptances again.</p>}<details className="rounded border border-card-border p-3"><summary className="cursor-pointer text-sm font-semibold">Propose a new version</summary><div className="mt-3"><AgreementForm terms={terms} setTerms={setTerms} disabled={saving} onSubmit={() => perform(async () => { await proposeAgreementRevision(agreement.id, terms); })} label="Save new version" /></div></details></CardBody></Card>;
}

function getMilestoneStatuses(current, role) {
  const allowed = role === 'client'
    ? { submitted: ['submitted', 'approved', 'needs_revision'] }
    : { pending: ['pending', 'in_progress'], in_progress: ['in_progress', 'submitted'], needs_revision: ['needs_revision', 'in_progress', 'submitted'] };
  return allowed[current] || [current];
}

function AgreementForm({ terms, setTerms, disabled, onSubmit, label }) {
  const fields = [['deliverables', 'Deliverables'], ['deadline', 'Deadline'], ['compensation', 'Payment or compensation'], ['payment_milestones', 'Payment milestones'], ['revision_limit', 'Revision limit'], ['responsibilities', 'Responsibilities'], ['additional_work_policy', 'Additional work policy']];
  return <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-2">{fields.map(([key, name]) => <label key={key} className="block text-xs font-medium text-slate-600">{name}{key === 'revision_limit' ? <input type="number" min="0" max="50" required value={terms[key]} onChange={(e) => setTerms({ ...terms, [key]: e.target.value })} className="mt-1 w-full rounded-md border border-card-border px-3 py-2 text-sm" /> : <textarea required rows={key === 'deliverables' || key === 'responsibilities' ? 2 : 1} value={terms[key]} onChange={(e) => setTerms({ ...terms, [key]: e.target.value })} className="mt-1 w-full rounded-md border border-card-border px-3 py-2 text-sm" />}</label>)}<Button type="submit" disabled={disabled}>{label}</Button></form>;
}
