import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Helper: abbreviate to 3 uppercase letters
const abbreviateProgrammeType = (name) => {
  const clean = String(name || '').replace(/[^a-zA-Z]/g, '');
  return clean.slice(0, 3).toUpperCase() || 'CRS';
};

// Helper: extract first number from string
const extractNumber = (str) => {
  const match = String(str || '').match(/\d+/);
  return match ? match[0] : '1';
};

const CourseMasterDetail = () => {
  const navigate = useNavigate();
  const [hierarchy, setHierarchy] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  
  const [formData, setFormData] = useState({
    course_title: '',
    course_code: '',
    awarding_body: '',
    version: '1.0'
  });
  
  const [modal, setModal] = useState(null);
  const [modalInput, setModalInput] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchHierarchy = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/students/moodle/category-hierarchy`);
      setHierarchy(res.data?.data);
    } catch (error) {
      console.error('Failed to load hierarchy:', error);
    }
  }, []);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  // Derive available options from selections
  const types = useMemo(() => hierarchy?.programme_types || [], [hierarchy]);
  
  const programs = useMemo(() => {
    const type = types.find(t => t.id === selectedTypeId);
    return type?.programs || [];
  }, [types, selectedTypeId]);

  const years = useMemo(() => {
    const program = programs.find(p => p.id === selectedProgramId);
    return program?.years || [];
  }, [programs, selectedProgramId]);

  const semesters = useMemo(() => {
    const year = years.find(y => y.id === selectedYearId);
    return year?.semesters || [];
  }, [years, selectedYearId]);

  // Auto-generate course code when full hierarchy is selected
  useEffect(() => {
    if (!selectedTypeId || !selectedProgramId || !selectedYearId || !selectedSemesterId) return;

    const selectedType = types.find(t => t.id === selectedTypeId);
    const selectedYear = years.find(y => y.id === selectedYearId);
    const selectedSemester = semesters.find(s => s.id === selectedSemesterId);

    if (!selectedType || !selectedYear || !selectedSemester) return;

    const typeCode = abbreviateProgrammeType(selectedType.name);
    const yearNum = extractNumber(selectedYear.name);
    const semNum = extractNumber(selectedSemester.name);
    const codePrefix = `${typeCode}-001-Y${yearNum}-S${semNum}-C`;

    // Fetch next counter from backend
    const selectedProgram = programs.find(p => p.id === selectedProgramId);
    axios.get(`${API_URL}/accreditations/next-course-counter`, {
      params: {
        programme_type_name: selectedType.name,
        program_name: selectedProgram?.name || '',
        academic_year: selectedYear.name,
        semester_name: selectedSemester.name,
        code_prefix: codePrefix
      }
    }).then(res => {
      const counter = res.data?.counter || 1;
      setFormData(prev => ({
        ...prev,
        course_code: `${codePrefix}${counter}`
      }));
    }).catch(() => {
      setFormData(prev => ({
        ...prev,
        course_code: `${codePrefix}1`
      }));
    });
  }, [selectedTypeId, selectedProgramId, selectedYearId, selectedSemesterId, types, programs, years, semesters]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCategory = async () => {
    if (!modalInput.trim()) {
      alert('Please enter a name');
      return;
    }

    setModalLoading(true);
    try {
      let parentId = null;
      let level = modal;

      if (modal === 'program' && !selectedTypeId) {
        alert('Select a Type first');
        setModalLoading(false);
        return;
      }
      if (modal === 'year' && !selectedProgramId) {
        alert('Select a Course first');
        setModalLoading(false);
        return;
      }
      if (modal === 'semester' && !selectedYearId) {
        alert('Select a Year first');
        setModalLoading(false);
        return;
      }

      if (modal === 'type') {
        level = 'programme_type';
      } else if (modal === 'program') {
        parentId = selectedTypeId;
        level = 'program';
      } else if (modal === 'year') {
        parentId = selectedProgramId;
        level = 'year';
      } else if (modal === 'semester') {
        parentId = selectedYearId;
        level = 'semester';
      }

      const payload = {
        name: modalInput.trim(),
        level,
        parent_category_id: parentId
      };

      // Generate explicit_code for all levels
      if (modal === 'type') {
        payload.explicit_code = abbreviateProgrammeType(modalInput.trim());
      } else if (modal === 'program') {
        // Backend auto-increments: HND-001, HND-002, HND-003...
        // No explicit_code needed — backend queries siblings and picks next number.
      } else if (modal === 'year') {
        const selectedType = types.find(t => t.id === selectedTypeId);
        const selectedProgram = programs.find(p => p.id === selectedProgramId);
        const typeCode = abbreviateProgrammeType(selectedType?.name || '');
        const cleanProgName = (selectedProgram?.name || '').replace(/^(HND|HNC|BSc|BA|MSc|MA|Degree|Foundation)\s+(in|of)\s+/i, '');
        const progCode = cleanProgName.split(/\s+/).map(w => (w[0] || '').toUpperCase()).join('').replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'CRS';
        const yearNum = extractNumber(modalInput.trim());
        payload.explicit_code = `${typeCode}-${progCode}-Y${yearNum}`;
      } else if (modal === 'semester') {
        const selectedType = types.find(t => t.id === selectedTypeId);
        const selectedProgram = programs.find(p => p.id === selectedProgramId);
        const selectedYear = years.find(y => y.id === selectedYearId);
        const typeCode = abbreviateProgrammeType(selectedType?.name || '');
        const cleanProgName = (selectedProgram?.name || '').replace(/^(HND|HNC|BSc|BA|MSc|MA|Degree|Foundation)\s+(in|of)\s+/i, '');
        const progCode = cleanProgName.split(/\s+/).map(w => (w[0] || '').toUpperCase()).join('').replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'CRS';
        const yearNum = extractNumber(selectedYear?.name || '');
        const semNum = extractNumber(modalInput.trim());
        payload.explicit_code = `${typeCode}-${progCode}-Y${yearNum}-S${semNum}`;
      }

      const createRes = await axios.post(`${API_URL}/students/moodle/create-level-category`, payload);
      const newId = Number(
        createRes.data?.data?.programme_type_category_id ||
        createRes.data?.data?.program_category_id ||
        createRes.data?.data?.year_category_id ||
        createRes.data?.data?.semester_category_id ||
        0
      );

      const capturedModal = modal;
      setModalInput('');
      setModal(null);
      await fetchHierarchy();

      // Auto-select the newly created item so the user doesn't have to pick it manually
      if (newId > 0) {
        if (capturedModal === 'type') setSelectedTypeId(newId);
        else if (capturedModal === 'program') setSelectedProgramId(newId);
        else if (capturedModal === 'year') setSelectedYearId(newId);
        else if (capturedModal === 'semester') setSelectedSemesterId(newId);
      }
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!formData.course_title.trim()) {
      alert('Course title is required');
      return;
    }
    
    const selectedType = types.find(t => t.id === selectedTypeId);
    const selectedProgram = programs.find(p => p.id === selectedProgramId);
    const selectedYear = years.find(y => y.id === selectedYearId);
    const selectedSemester = semesters.find(s => s.id === selectedSemesterId);

    if (!selectedType || !selectedProgram || !selectedYear || !selectedSemester) {
      alert('Please select all hierarchy levels');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        course_title: formData.course_title,
        course_code: formData.course_code,
        programme_type_name: selectedType.name,
        program_name: selectedProgram.name,
        academic_year: selectedYear.name,
        semester_name: selectedSemester.name,
        awarding_body: formData.awarding_body,
        version: formData.version,
        programme_type_category_id: selectedTypeId,
        program_category_id: selectedProgramId,
        year_category_id: selectedYearId,
        semester_category_id: selectedSemesterId
      };

      // Step 1: Sync to Moodle (create course in Moodle under the correct category)
      try {
        const syncRes = await axios.post(`${API_URL}/students/moodle/sync-master-course`, payload);
        if (syncRes.data?.data?.resolved_category_ids) {
          // Use resolved IDs from Moodle sync
          const resolved = syncRes.data.data.resolved_category_ids;
          payload.programme_type_category_id = resolved.programme_type_category_id || payload.programme_type_category_id;
          payload.program_category_id = resolved.program_category_id || payload.program_category_id;
          payload.year_category_id = resolved.year_category_id || payload.year_category_id;
          payload.semester_category_id = resolved.semester_category_id || payload.semester_category_id;
        }
      } catch (syncErr) {
        console.warn('Moodle sync failed, saving to SCL only:', syncErr.message);
      }

      // Step 2: Save to SCL database
      await axios.post(`${API_URL}/accreditations/master-courses`, payload);
      alert('Course saved successfully!');
      navigate('/course-lifecycle');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/course-lifecycle')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lifecycle
          </button>
          <h1 className="text-2xl font-bold text-gray-900">New Subject</h1>
          <p className="text-sm text-gray-600">Select the hierarchy position: Course Type {'>'} Course {'>'} Year {'>'} Semester {'>'} Subject</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {/* Hierarchy Selection */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
            <p className="text-sm font-semibold text-gray-800">Course Type {'>'} Course {'>'} Year {'>'} Semester {'>'} Subject</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">Course Type</label>
                  <button
                    type="button"
                    onClick={() => { setModal('type'); setModalInput(''); }}
                    className="w-6 h-6 bg-blue-600 text-white rounded-full hover:bg-purple-700 flex items-center justify-center text-sm font-bold"
                    title="Add new Course Type"
                  >+</button>
                </div>
                <select
                  value={selectedTypeId || ''}
                  onChange={(e) => {
                    setSelectedTypeId(e.target.value ? Number(e.target.value) : null);
                    setSelectedProgramId(null);
                    setSelectedYearId(null);
                    setSelectedSemesterId(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {/* Program */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">Course</label>
                  <button
                    type="button"
                    onClick={() => { setModal('program'); setModalInput(''); }}
                    disabled={!selectedTypeId}
                    className="w-6 h-6 bg-blue-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold"
                    title="Add new Course"
                  >+</button>
                </div>
                <select
                  value={selectedProgramId || ''}
                  onChange={(e) => {
                    setSelectedProgramId(e.target.value ? Number(e.target.value) : null);
                    setSelectedYearId(null);
                    setSelectedSemesterId(null);
                  }}
                  disabled={!selectedTypeId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="">Select Course</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {!selectedTypeId && <p className="text-xs text-gray-500 mt-1">Choose Course Type first</p>}
              </div>

              {/* Year */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">Year</label>
                  <button
                    type="button"
                    onClick={() => { setModal('year'); setModalInput(''); }}
                    disabled={!selectedProgramId}
                    className="w-6 h-6 bg-blue-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold"
                    title="Add new Year"
                  >+</button>
                </div>
                <select
                  value={selectedYearId || ''}
                  onChange={(e) => {
                    setSelectedYearId(e.target.value ? Number(e.target.value) : null);
                    setSelectedSemesterId(null);
                  }}
                  disabled={!selectedProgramId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="">Select Year</option>
                  {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
                {!selectedProgramId && <p className="text-xs text-gray-500 mt-1">Choose Course first</p>}
              </div>

              {/* Semester */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">Semester</label>
                  <button
                    type="button"
                    onClick={() => { setModal('semester'); setModalInput(''); }}
                    disabled={!selectedYearId}
                    className="w-6 h-6 bg-blue-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold"
                    title="Add new Semester"
                  >+</button>
                </div>
                <select
                  value={selectedSemesterId || ''}
                  onChange={(e) => setSelectedSemesterId(e.target.value ? Number(e.target.value) : null)}
                  disabled={!selectedYearId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="">Select Semester</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {!selectedYearId && <p className="text-xs text-gray-500 mt-1">Choose Year first</p>}
              </div>
            </div>
          </div>

          {/* Course Details - only show if full hierarchy selected */}
          {selectedSemesterId && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Title *</label>
                  <input
                    type="text"
                    value={formData.course_title}
                    onChange={(e) => handleChange('course_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Enter subject title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={formData.course_code}
                    onChange={(e) => handleChange('course_code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="e.g., HND-BUS-Y1-S1-C1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Awarding Body</label>
                  <input
                    type="text"
                    value={formData.awarding_body}
                    onChange={(e) => handleChange('awarding_body', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Enter awarding body"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => handleChange('version', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="e.g., 1.0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => navigate('/course-lifecycle')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveCourse}
            disabled={saving || !selectedSemesterId || !formData.course_title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Subject'}
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Add New {modal === 'type' ? 'Course Type' : modal === 'program' ? 'Course' : modal === 'year' ? 'Year' : 'Semester'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">Creates new category in hierarchy</p>
            <input
              type="text"
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCategory();
              }}
              autoFocus
              placeholder={`Enter ${modal === 'type' ? 'Course Type' : modal === 'program' ? 'Course' : modal === 'year' ? 'Year' : 'Semester'} name`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  setModalInput('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={modalLoading || !modalInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modalLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseMasterDetail;

