import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    HelpCircle, MessageSquare, FileText, Scale, Accessibility,
    Shield, RefreshCw, ChevronDown, ChevronUp, CheckCircle,
    Clock, AlertCircle, XCircle, User, Mail, Calendar
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const TABS = [
    { id: 'requests',     label: 'Support Requests',    icon: HelpCircle },
    { id: 'feedback',     label: 'Feedback',             icon: MessageSquare },
    { id: 'complaints',   label: 'Complaints & Appeals', icon: Scale },
    { id: 'disability',   label: 'Disability',           icon: Accessibility },
    { id: 'safeguarding', label: 'Safeguarding',         icon: Shield },
];

const STATUS_COLORS = {
    open:        'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved:    'bg-green-100 text-green-800',
    closed:      'bg-gray-100 text-gray-700',
    submitted:   'bg-yellow-100 text-yellow-800',
    under_review:'bg-blue-100 text-blue-800',
    rejected:    'bg-red-100 text-red-800',
    approved:    'bg-green-100 text-green-800',
    pending:     'bg-yellow-100 text-yellow-800',
    low:         'bg-gray-100 text-gray-700',
    medium:      'bg-orange-100 text-orange-800',
    high:        'bg-red-100 text-red-800',
    critical:    'bg-red-200 text-red-900 font-bold',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function Badge({ value }) {
    const cls = STATUS_COLORS[value] || 'bg-gray-100 text-gray-700';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>{value?.replace(/_/g, ' ') || '—'}</span>;
}

function ExpandRow({ label, children }) {
    return (
        <div className="mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
            <div className="text-sm text-slate-800">{children}</div>
        </div>
    );
}

// ── Support Requests Tab ─────────────────────────────────────────────────────
function SupportRequestsTab() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [updating, setUpdating] = useState(null);
    const [replyDraft, setReplyDraft] = useState({});

    const fetch = async () => {
        setLoading(true);
        try {
            const p = statusFilter !== 'all' ? { status: statusFilter } : {};
            const r = await axios.get(`${API_URL}/support/admin/requests`, { params: p });
            setItems(r.data.requests || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetch(); }, [statusFilter]);

    const updateStatus = async (id, status) => {
        setUpdating(id);
        try {
            const admin_reply = (replyDraft[id] ?? '').trim();
            await axios.put(`${API_URL}/support/admin/requests/${id}`, { status, admin_reply });
            setItems(prev => prev.map(i => i.id === id ? { ...i, status, admin_reply } : i));
        } catch (e) { console.error(e); }
        setUpdating(null);
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
                <button onClick={fetch} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
                <span className="text-sm text-slate-500 ml-auto">{items.length} request(s)</span>
            </div>

            {loading ? <p className="text-center py-10 text-slate-400">Loading…</p> :
             items.length === 0 ? <p className="text-center py-10 text-slate-400">No support requests found.</p> : (
                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <button className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-slate-50 transition"
                                onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                                <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-slate-800 truncate">{item.subject}</p>
                                    <p className="text-xs text-slate-500">{item.student_name || item.student_email} · {fmt(item.created_at)}</p>
                                </div>
                                <Badge value={item.type} />
                                <Badge value={item.status} />
                                {expanded === item.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>
                            {expanded === item.id && (
                                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <ExpandRow label="Student"><span className="flex items-center gap-1"><User className="w-3 h-3" />{item.student_name}</span></ExpandRow>
                                        <ExpandRow label="Email"><span className="flex items-center gap-1"><Mail className="w-3 h-3" />{item.student_email}</span></ExpandRow>
                                        <ExpandRow label="Type"><Badge value={item.type} /></ExpandRow>
                                        <ExpandRow label="Submitted"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmt(item.created_at)}</span></ExpandRow>
                                        <ExpandRow label="Description"><p className="whitespace-pre-wrap">{item.description}</p></ExpandRow>
                                        <ExpandRow label="Reply">
                                            <p className="whitespace-pre-wrap">{item.admin_reply || 'No reply yet.'}</p>
                                        </ExpandRow>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-xs text-slate-500 mb-1 block">Reply to Student</label>
                                        <textarea
                                            rows={3}
                                            value={replyDraft[item.id] ?? item.admin_reply ?? ''}
                                            onChange={(e) => setReplyDraft((p) => ({ ...p, [item.id]: e.target.value }))}
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-indigo-300 outline-none"
                                            placeholder="Write a reply that the student can see..."
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500">Update Status:</span>
                                        {['open','in_progress','resolved','closed'].map(s => (
                                            <button key={s} disabled={item.status === s || updating === item.id}
                                                onClick={() => updateStatus(item.id, s)}
                                                className={`text-xs px-3 py-1 rounded-full border transition ${item.status === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 hover:border-indigo-400 hover:text-indigo-600'}`}>
                                                {s.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Feedback Tab ─────────────────────────────────────────────────────────────
function FeedbackTab() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/support/admin/feedback`)
            .then(r => setItems(r.data.feedback || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

    return loading ? <p className="text-center py-10 text-slate-400">Loading…</p> :
        items.length === 0 ? <p className="text-center py-10 text-slate-400">No feedback submitted yet.</p> : (
        <div className="space-y-2">
            {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <button className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-slate-50 transition"
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                        <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800 truncate">{item.feedback_type} — {item.module_code || 'General'}</p>
                            <p className="text-xs text-slate-500">{item.student_name || item.student_email} · {fmt(item.submitted_at)}</p>
                        </div>
                        <span className="text-yellow-500 text-sm">{stars(item.rating || 0)}</span>
                        <Badge value={item.feedback_type} />
                        {expanded === item.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {expanded === item.id && (
                        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ExpandRow label="Student">{item.student_name} ({item.student_email})</ExpandRow>
                            <ExpandRow label="Rating"><span className="text-yellow-500">{stars(item.rating || 0)} ({item.rating}/5)</span></ExpandRow>
                            <ExpandRow label="Module">{item.module_code || '—'}</ExpandRow>
                            <ExpandRow label="Submitted">{fmt(item.submitted_at)}</ExpandRow>
                            <ExpandRow label="Comments"><p className="whitespace-pre-wrap col-span-2">{item.comments || '—'}</p></ExpandRow>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Complaints Tab ───────────────────────────────────────────────────────────
function ComplaintsTab() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [updating, setUpdating] = useState(null);
    const [decisionNote, setDecisionNote] = useState({});

    const fetch = async () => {
        setLoading(true);
        try {
            const p = statusFilter !== 'all' ? { status: statusFilter } : {};
            const r = await axios.get(`${API_URL}/support/admin/complaints`, { params: p });
            setItems(r.data.complaints || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetch(); }, [statusFilter]);

    const updateStatus = async (id, status) => {
        setUpdating(id);
        try {
            await axios.put(`${API_URL}/support/admin/complaints/${id}`, {
                status,
                decision: status === 'resolved' ? 'upheld' : status === 'rejected' ? 'not_upheld' : null,
                decision_notes: decisionNote[id] || null
            });
            setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
        } catch (e) { console.error(e); }
        setUpdating(null);
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
                    <option value="all">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button onClick={fetch} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
                <span className="text-sm text-slate-500 ml-auto">{items.length} case(s)</span>
            </div>

            {loading ? <p className="text-center py-10 text-slate-400">Loading…</p> :
             items.length === 0 ? <p className="text-center py-10 text-slate-400">No complaints found.</p> : (
                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <button className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-slate-50 transition"
                                onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                                <Scale className="w-4 h-4 text-rose-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-slate-800 truncate">{item.case_number} — {item.category}</p>
                                    <p className="text-xs text-slate-500">{item.student_name || item.student_email} · {fmt(item.created_at)}</p>
                                </div>
                                <Badge value={item.type} />
                                <Badge value={item.priority} />
                                <Badge value={item.status} />
                                {expanded === item.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>
                            {expanded === item.id && (
                                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <ExpandRow label="Student">{item.student_name} ({item.student_email})</ExpandRow>
                                        <ExpandRow label="Case Number">{item.case_number}</ExpandRow>
                                        <ExpandRow label="Type"><Badge value={item.type} /></ExpandRow>
                                        <ExpandRow label="Priority"><Badge value={item.priority} /></ExpandRow>
                                        <ExpandRow label="Description"><p className="whitespace-pre-wrap">{item.description}</p></ExpandRow>
                                        {item.decision_notes && <ExpandRow label="Admin Notes">{item.decision_notes}</ExpandRow>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-xs text-slate-500 mb-1 block">Decision Notes (optional)</label>
                                        <textarea rows={2} value={decisionNote[item.id] || ''} onChange={e => setDecisionNote(p => ({...p, [item.id]: e.target.value}))}
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-indigo-300 outline-none" />
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-xs text-slate-500">Update Status:</span>
                                        {['submitted','under_review','resolved','rejected'].map(s => (
                                            <button key={s} disabled={item.status === s || updating === item.id}
                                                onClick={() => updateStatus(item.id, s)}
                                                className={`text-xs px-3 py-1 rounded-full border transition ${item.status === s ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-300 hover:border-rose-400 hover:text-rose-600'}`}>
                                                {s.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Disability Tab ───────────────────────────────────────────────────────────
function DisabilityTab() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/support/admin/disability`)
            .then(r => setItems(r.data.requests || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const updateStatus = async (id, status) => {
        setUpdating(id);
        try {
            await axios.put(`${API_URL}/support/admin/disability/${id}`, { status });
            setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
        } catch (e) { console.error(e); }
        setUpdating(null);
    };

    return loading ? <p className="text-center py-10 text-slate-400">Loading…</p> :
        items.length === 0 ? <p className="text-center py-10 text-slate-400">No disability requests found.</p> : (
        <div className="space-y-2">
            {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <button className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-slate-50 transition"
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                        <Accessibility className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800 truncate">{item.request_type}</p>
                            <p className="text-xs text-slate-500">{item.student_name || item.student_email} · {fmt(item.created_at)}</p>
                        </div>
                        <Badge value={item.status || 'pending'} />
                        {expanded === item.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {expanded === item.id && (
                        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <ExpandRow label="Student">{item.student_name} ({item.student_email})</ExpandRow>
                                <ExpandRow label="Request Type">{item.request_type}</ExpandRow>
                                <ExpandRow label="Submitted">{fmt(item.created_at)}</ExpandRow>
                                <ExpandRow label="Description"><p className="whitespace-pre-wrap">{item.description}</p></ExpandRow>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-slate-500">Update Status:</span>
                                {['pending','under_review','approved','rejected'].map(s => (
                                    <button key={s} disabled={item.status === s || updating === item.id}
                                        onClick={() => updateStatus(item.id, s)}
                                        className={`text-xs px-3 py-1 rounded-full border transition ${item.status === s ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-300 hover:border-purple-400 hover:text-purple-600'}`}>
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Safeguarding Tab ─────────────────────────────────────────────────────────
function SafeguardingTab() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/support/admin/safeguarding`)
            .then(r => setItems(r.data.reports || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return loading ? <p className="text-center py-10 text-slate-400">Loading…</p> :
        items.length === 0 ? <p className="text-center py-10 text-slate-400">No safeguarding reports found.</p> : (
        <div className="space-y-2">
            {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                    <button className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-red-50 transition"
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                        <Shield className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800 truncate">{item.report_type}</p>
                            <p className="text-xs text-slate-500">{item.student_name || item.student_email} · {fmt(item.created_at)}</p>
                        </div>
                        <Badge value={item.severity} />
                        <Badge value={item.status || 'open'} />
                        {expanded === item.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {expanded === item.id && (
                        <div className="border-t border-red-100 px-5 py-4 bg-red-50">
                            <div className="flex items-start gap-2 mb-3 p-3 bg-red-100 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700 font-medium">Safeguarding reports are confidential. Handle in line with SCL safeguarding policy.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ExpandRow label="Student">{item.student_name} ({item.student_email})</ExpandRow>
                                <ExpandRow label="Report Type">{item.report_type}</ExpandRow>
                                <ExpandRow label="Severity"><Badge value={item.severity} /></ExpandRow>
                                <ExpandRow label="Reported">{fmt(item.created_at)}</ExpandRow>
                                <ExpandRow label="Description"><p className="whitespace-pre-wrap">{item.description}</p></ExpandRow>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
const AdminSupportRequests = () => {
    const [activeTab, setActiveTab] = useState('requests');

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Student Support Inbox</h1>
                <p className="text-sm text-slate-500 mt-0.5">View and manage all student support requests, feedback, complaints and reports.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition -mb-px ${
                                isActive
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}>
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'requests'     && <SupportRequestsTab />}
                {activeTab === 'feedback'     && <FeedbackTab />}
                {activeTab === 'complaints'   && <ComplaintsTab />}
                {activeTab === 'disability'   && <DisabilityTab />}
                {activeTab === 'safeguarding' && <SafeguardingTab />}
            </div>
        </div>
    );
};

export default AdminSupportRequests;
