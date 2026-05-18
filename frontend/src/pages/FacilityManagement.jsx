import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Building2, Plus, Search, RefreshCw, X, Save, Loader2,
    CheckCircle2, AlertCircle, ChevronDown, ChevronRight,
    ClipboardCheck, DoorOpen
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const OWNERSHIP_TYPES = ['Owned', 'Leased', 'Rented', 'Partnership'];
const ROOM_TYPES = ['Classroom', 'Lab', 'Office', 'Meeting Room', 'IT Lab', 'Library', 'Auditorium', 'Other'];

const COMPLIANCE_STATUS_COLORS = {
    compliant:       'bg-green-100 text-green-800',
    non_compliant:   'bg-red-100 text-red-800',
    pending_review:  'bg-yellow-100 text-yellow-800',
    not_applicable:  'bg-gray-100 text-gray-600',
};

const BUILDING_STATUS_COLORS = {
    active:        'bg-green-100 text-green-800',
    inactive:      'bg-gray-100 text-gray-600',
    under_review:  'bg-yellow-100 text-yellow-800',
    decommissioned:'bg-red-100 text-red-800',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const emptyBuilding = () => ({
    building_name: '', location: '', ownership_type: 'Owned',
    year_built: '', purpose: '', total_floors: '', total_area_sqm: '',
    fire_safety_cert_file: '', fire_safety_cert_expiry: '',
    accessibility_compliance: false, accessibility_notes: '', status: 'active'
});

const emptyRoom = () => ({
    room_name: '', room_type: 'Classroom', capacity: '', floor_number: '',
    equipment: '', it_av_setup: '', accessibility_features: '',
    usage_schedule: '', photo_file: ''
});

export default function FacilityManagement() {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [expandedData, setExpandedData] = useState({});
    const [expandedLoading, setExpandedLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showBldForm, setShowBldForm] = useState(false);
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [selectedBld, setSelectedBld] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bldForm, setBldForm] = useState(emptyBuilding());
    const [roomForm, setRoomForm] = useState(emptyRoom());
    const [activeRoomBldId, setActiveRoomBldId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchBuildings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            const res = await axios.get(`${API_URL}/facility-management/buildings`, { params });
            if (res.data?.success) setBuildings(res.data.data || []);
        } catch { showToast('Failed to load buildings.', 'error'); }
        finally { setLoading(false); }
    };

    const fetchBuildingDetail = async (id) => {
        setExpandedLoading(true);
        try {
            const res = await axios.get(`${API_URL}/facility-management/buildings/${id}`);
            if (res.data?.success) setExpandedData(prev => ({ ...prev, [id]: res.data.data }));
        } catch { showToast('Failed to load building detail.', 'error'); }
        finally { setExpandedLoading(false); }
    };

    useEffect(() => { fetchBuildings(); }, []);

    const toggleExpand = (id) => {
        if (expandedId === id) { setExpandedId(null); return; }
        setExpandedId(id);
        if (!expandedData[id]) fetchBuildingDetail(id);
    };

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
    const setB = (k, v) => setBldForm(prev => ({ ...prev, [k]: v }));
    const setR = (k, v) => setRoomForm(prev => ({ ...prev, [k]: v }));

    const openNewBuilding = () => { setBldForm(emptyBuilding()); setSelectedBld(null); setShowBldForm(true); };
    const openEditBuilding = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/facility-management/buildings/${id}`);
            if (res.data?.success) {
                const d = res.data.data;
                setBldForm({ ...d, accessibility_compliance: !!d.accessibility_compliance });
                setSelectedBld(d); setShowBldForm(true);
            }
        } catch { showToast('Failed to load.', 'error'); }
    };

    const saveBuilding = async () => {
        if (!bldForm.building_name) { showToast('Building name is required.', 'error'); return; }
        setSaving(true);
        try {
            if (selectedBld?.id) {
                await axios.put(`${API_URL}/facility-management/buildings/${selectedBld.id}`, bldForm);
            } else {
                await axios.post(`${API_URL}/facility-management/buildings`, bldForm);
            }
            showToast('Building saved.');
            setShowBldForm(false); setSelectedBld(null);
            fetchBuildings();
            if (selectedBld?.id && expandedId === selectedBld.id) fetchBuildingDetail(selectedBld.id);
        } catch { showToast('Failed to save.', 'error'); }
        finally { setSaving(false); }
    };

    const deleteBuilding = async (id) => {
        if (!window.confirm('Delete this building and all its rooms?')) return;
        try { await axios.delete(`${API_URL}/facility-management/buildings/${id}`); showToast('Deleted.'); fetchBuildings(); if (expandedId === id) setExpandedId(null); }
        catch { showToast('Failed to delete.', 'error'); }
    };

    const openNewRoom = (buildingId) => { setRoomForm(emptyRoom()); setSelectedRoom(null); setActiveRoomBldId(buildingId); setShowRoomForm(true); };
    const openEditRoom = (room) => { setRoomForm({ ...room }); setSelectedRoom(room); setActiveRoomBldId(room.building_id); setShowRoomForm(true); };

    const saveRoom = async () => {
        if (!roomForm.room_name) { showToast('Room name is required.', 'error'); return; }
        setSaving(true);
        try {
            if (selectedRoom?.id) await axios.put(`${API_URL}/facility-management/rooms/${selectedRoom.id}`, roomForm);
            else await axios.post(`${API_URL}/facility-management/buildings/${activeRoomBldId}/rooms`, roomForm);
            showToast('Room saved.');
            setShowRoomForm(false); setSelectedRoom(null);
            fetchBuildingDetail(activeRoomBldId);
        } catch { showToast('Failed to save room.', 'error'); }
        finally { setSaving(false); }
    };

    const deleteRoom = async (roomId, buildingId) => {
        if (!window.confirm('Delete this room?')) return;
        try { await axios.delete(`${API_URL}/facility-management/rooms/${roomId}`); showToast('Deleted.'); fetchBuildingDetail(buildingId); }
        catch { showToast('Failed to delete.', 'error'); }
    };

    const updateCompliance = async (compId, status, buildingId) => {
        try {
            await axios.put(`${API_URL}/facility-management/compliance/${compId}`, { status });
            fetchBuildingDetail(buildingId);
        } catch { showToast('Failed to update compliance.', 'error'); }
    };

    const stats = useMemo(() => ({
        total: buildings.length,
        active: buildings.filter(b => b.status === 'active').length,
    }), [buildings]);

    const LabelInputB = ({ label, name, type = 'text', required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <input type={type} value={bldForm[name] || ''} onChange={e => setB(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
    );
    const LabelSelectB = ({ label, name, options }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <select value={bldForm[name] || ''} onChange={e => setB(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="">Select…</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
    const LabelInputR = ({ label, name, type = 'text' }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} value={roomForm[name] || ''} onChange={e => setR(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
    );
    const LabelTextareaR = ({ label, name, rows = 2 }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <textarea rows={rows} value={roomForm[name] || ''} onChange={e => setR(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none" />
        </div>
    );

    return (
        <div className="p-6 max-w-screen-xl mx-auto">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="text-cyan-700" size={24} /> Buildings & Facilities
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Module 32 — Building management, rooms and compliance</p>
                </div>
                <button onClick={openNewBuilding} className="flex items-center gap-2 px-4 py-2 bg-cyan-700 text-white rounded-lg text-sm font-medium hover:bg-cyan-800">
                    <Plus size={16} /> Add Building
                </button>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs font-medium text-gray-600">Total Buildings</p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                    <p className="text-xs font-medium text-gray-600">Active</p>
                </div>
            </div>

            {/* Search */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchBuildings()}
                        placeholder="Search buildings…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <button onClick={fetchBuildings} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw size={16} className="text-gray-500" /></button>
            </div>

            {/* Buildings accordion */}
            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-cyan-600" /></div>
            ) : buildings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-white rounded-xl border border-gray-200">
                    <Building2 size={32} className="mb-2" />
                    <p className="text-sm">No buildings found.</p>
                    <button onClick={openNewBuilding} className="mt-3 px-4 py-2 bg-cyan-700 text-white rounded-lg text-sm hover:bg-cyan-800">Add First Building</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {buildings.map(bld => {
                        const isOpen = expandedId === bld.id;
                        const detail = expandedData[bld.id];
                        return (
                            <div key={bld.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                {/* Building header */}
                                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(bld.id)}>
                                    <div className="flex items-center gap-3">
                                        {isOpen ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronRight size={18} className="text-gray-500" />}
                                        <Building2 size={20} className="text-cyan-700" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{bld.building_name}</p>
                                            <p className="text-xs text-gray-500">{bld.location} • {bld.ownership_type} • {bld.purpose}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${BUILDING_STATUS_COLORS[bld.status] || 'bg-gray-100 text-gray-700'}`}>{bld.status}</span>
                                        <button onClick={e => { e.stopPropagation(); openEditBuilding(bld.id); }}
                                            className="text-xs px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100">Edit</button>
                                        <button onClick={e => { e.stopPropagation(); deleteBuilding(bld.id); }}
                                            className="text-xs px-3 py-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Delete</button>
                                    </div>
                                </div>

                                {/* Expanded content */}
                                {isOpen && (
                                    <div className="border-t border-gray-200">
                                        {expandedLoading && !detail ? (
                                            <div className="flex items-center justify-center h-24"><Loader2 size={20} className="animate-spin text-cyan-600" /></div>
                                        ) : detail ? (
                                            <div className="p-4 space-y-5">
                                                {/* Rooms */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><DoorOpen size={16} /> Rooms ({detail.rooms?.length || 0})</p>
                                                        <button onClick={() => openNewRoom(bld.id)} className="text-xs px-3 py-1.5 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 flex items-center gap-1">
                                                            <Plus size={12} /> Add Room
                                                        </button>
                                                    </div>
                                                    {detail.rooms?.length > 0 ? (
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        {['Room', 'Type', 'Floor', 'Capacity', 'Equipment', 'Actions'].map(h => (
                                                                            <th key={h} className="text-left px-3 py-2 font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {detail.rooms.map(room => (
                                                                        <tr key={room.id} className="hover:bg-gray-50">
                                                                            <td className="px-3 py-2 font-medium text-gray-900">{room.room_name}</td>
                                                                            <td className="px-3 py-2 text-gray-600">{room.room_type}</td>
                                                                            <td className="px-3 py-2 text-gray-600">{room.floor_number ?? '—'}</td>
                                                                            <td className="px-3 py-2 text-gray-600">{room.capacity ?? '—'}</td>
                                                                            <td className="px-3 py-2 text-gray-600 max-w-[180px] truncate">{room.equipment || '—'}</td>
                                                                            <td className="px-3 py-2">
                                                                                <div className="flex gap-1.5">
                                                                                    <button onClick={() => openEditRoom(room)} className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">Edit</button>
                                                                                    <button onClick={() => deleteRoom(room.id, bld.id)} className="px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50">Del</button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic">No rooms added yet.</p>
                                                    )}
                                                </div>

                                                {/* Compliance */}
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-3"><ClipboardCheck size={16} /> Compliance Checklist</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {detail.compliance?.map(c => (
                                                            <div key={c.id} className="border border-gray-200 rounded-lg p-3">
                                                                <p className="text-xs font-medium text-gray-800 mb-2">{c.compliance_type}</p>
                                                                <select value={c.status} onChange={e => updateCompliance(c.id, e.target.value, bld.id)}
                                                                    className={`w-full text-xs rounded px-2 py-1 border border-gray-200 bg-white font-medium ${COMPLIANCE_STATUS_COLORS[c.status] || ''}`}>
                                                                    <option value="compliant">Compliant</option>
                                                                    <option value="non_compliant">Non-Compliant</option>
                                                                    <option value="pending_review">Pending Review</option>
                                                                    <option value="not_applicable">Not Applicable</option>
                                                                </select>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Building Form Modal */}
            {showBldForm && (
                <div className="fixed inset-0 z-40 bg-black/40 flex items-start justify-center pt-8 px-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mb-8">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">{selectedBld ? 'Edit Building' : 'Add New Building'}</h2>
                            <button onClick={() => { setShowBldForm(false); setSelectedBld(null); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <LabelInputB label="Building Name" name="building_name" required />
                                <LabelInputB label="Location / Address" name="location" />
                                <LabelSelectB label="Ownership Type" name="ownership_type" options={OWNERSHIP_TYPES} />
                                <LabelInputB label="Year Built" name="year_built" type="number" />
                                <LabelInputB label="Purpose / Usage" name="purpose" />
                                <LabelInputB label="Total Floors" name="total_floors" type="number" />
                                <LabelInputB label="Total Area (sqm)" name="total_area_sqm" type="number" />
                                <LabelInputB label="Fire Safety Cert (filename)" name="fire_safety_cert_file" />
                                <LabelInputB label="Fire Safety Cert Expiry" name="fire_safety_cert_expiry" type="date" />
                                <LabelSelectB label="Status" name="status" options={['active', 'inactive', 'under_review', 'decommissioned']} />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                <input type="checkbox" checked={!!bldForm.accessibility_compliance} onChange={e => setB('accessibility_compliance', e.target.checked)} className="w-4 h-4 accent-cyan-700" />
                                <span className="text-sm text-gray-700">Accessibility compliant</span>
                            </label>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Accessibility Notes</label>
                                <textarea rows={2} value={bldForm.accessibility_notes || ''} onChange={e => setB('accessibility_notes', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none" />
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={() => { setShowBldForm(false); setSelectedBld(null); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={saveBuilding} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-cyan-700 text-white rounded-lg text-sm font-medium hover:bg-cyan-800 disabled:opacity-60">
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                {saving ? 'Saving…' : 'Save Building'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Room Form Modal */}
            {showRoomForm && (
                <div className="fixed inset-0 z-40 bg-black/40 flex items-start justify-center pt-8 px-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mb-8">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">{selectedRoom ? 'Edit Room' : 'Add Room'}</h2>
                            <button onClick={() => { setShowRoomForm(false); setSelectedRoom(null); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <LabelInputR label="Room Name" name="room_name" />
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Room Type</label>
                                    <select value={roomForm.room_type || ''} onChange={e => setR('room_type', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                        {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <LabelInputR label="Capacity" name="capacity" type="number" />
                                <LabelInputR label="Floor Number" name="floor_number" type="number" />
                            </div>
                            <LabelTextareaR label="Equipment" name="equipment" />
                            <LabelTextareaR label="IT / AV Setup" name="it_av_setup" />
                            <LabelTextareaR label="Accessibility Features" name="accessibility_features" />
                            <LabelTextareaR label="Usage Schedule" name="usage_schedule" />
                            <LabelInputR label="Photo (filename)" name="photo_file" />
                        </div>
                        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={() => { setShowRoomForm(false); setSelectedRoom(null); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={saveRoom} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-cyan-700 text-white rounded-lg text-sm font-medium hover:bg-cyan-800 disabled:opacity-60">
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                {saving ? 'Saving…' : 'Save Room'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
