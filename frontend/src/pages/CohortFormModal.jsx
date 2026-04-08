import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const COURSE_TYPE_OPTIONS_FALLBACK = ['HND', 'Degree', 'Vocational', 'Short Course', 'CPD', 'Professional Qualification'];
const AWARDING_BODY_OPTIONS = ['Pearson', 'City & Guilds', 'In-house', 'NCFE', 'Other'];
const REGULATION_LEVEL_OPTIONS = ['RQF Level 1', 'RQF Level 2', 'RQF Level 3', 'RQF Level 4', 'RQF Level 5', 'RQF Level 6', 'RQF Level 7', 'RQF Level 8', 'Non-accredited'];
const MODE_OF_DELIVERY_OPTIONS = ['Full-time', 'Part-time', 'Online', 'Blended', 'Evening/Weekend'];
const SUBJECT_AREA_OPTIONS = ['Business', 'Engineering', 'IT', 'Creative Arts', 'Health & Social Care', 'Hospitality & Tourism', 'Other'];
const ASSESSMENT_METHOD_OPTIONS = ['Exam', 'Coursework', 'Portfolio', 'Practical', 'Mixed'];
const FUNDING_OPTIONS = ['Self-funded', 'Employer-funded', 'Student Loan', 'Scholarship'];
const YES_NO_OPTIONS = ['Yes', 'No'];

const CohortFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    onFormChange,
    onFillTestData,
    isSubmitting,
    isEditing,
    course,
    programmeTypes = [],
}) => {
    const [availableIntakes, setAvailableIntakes] = useState([]);
    const [loadingIntakes, setLoadingIntakes] = useState(false);
    const [showNewCohortInput, setShowNewCohortInput] = useState(false);

    // Fields that are pre-filled from course master and should be read-only
    const isFromMaster = (field) => {
        if (!course) return false;
        const masterFields = {
            course_type: course.course_type || course.programme_type_name,
            awarding_body_accreditation: course.awarding_body,
            regulation_level: course.qualification_level,
            mode_of_delivery: course.mode_of_delivery,
            subject_area_discipline: course.subject_area_discipline,
        };
        return !!(masterFields[field] && String(masterFields[field]).trim());
    };

    const readOnlyStyle = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 cursor-not-allowed';

    // Use programme types from DB, fall back to hardcoded if empty
    const courseTypeOptions = programmeTypes.length > 0
        ? programmeTypes.map(t => t.name).filter(Boolean)
        : COURSE_TYPE_OPTIONS_FALLBACK;

    useEffect(() => {
        if (!isOpen || !course) return;
        setShowNewCohortInput(false);

        // Fetch existing programme intakes for this programme
        const fetchIntakes = async () => {
            try {
                setLoadingIntakes(true);
                const progType = String(course?.programme_type_name || '').trim();
                const progName = String(course?.program_name || '').trim();
                
                if (!progType || !progName) {
                    setAvailableIntakes([]);
                    return;
                }

                const res = await axios.get(`${API_URL}/students/programme-intakes`, {
                    params: { programme_type_name: progType, program_name: progName }
                });
                
                if (res.data?.success && Array.isArray(res.data.data)) {
                    setAvailableIntakes(res.data.data);
                } else {
                    setAvailableIntakes([]);
                }
            } catch (error) {
                console.warn('Failed to fetch programme intakes:', error.message);
                setAvailableIntakes([]);
            } finally {
                setLoadingIntakes(false);
            }
        };

        fetchIntakes();
    }, [isOpen, course]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {isEditing ? 'Edit Course Cohort' : 'Add Course Cohort'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            For course: <span className="font-semibold">{course?.course_title || '...'}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onFillTestData}
                            type="button"
                            className="px-4 py-2 text-sm font-semibold rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                            Fill Test Data
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Form fields will go here */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Intake / Cohort</label>
                            {loadingIntakes ? (
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span className="text-gray-500">Loading existing intakes...</span>
                                </div>
                            ) : !showNewCohortInput && availableIntakes.length > 0 ? (
                                <div className="space-y-2">
                                    <select
                                        value={String(formData.intake_id || '')}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '__new__') {
                                                setShowNewCohortInput(true);
                                                onFormChange('intake_id', '');
                                                onFormChange('cohort_label', '');
                                            } else {
                                                const selectedIntake = availableIntakes.find(i => String(i.id) === val);
                                                if (selectedIntake) {
                                                    onFormChange('intake_id', selectedIntake.id);
                                                    onFormChange('cohort_label', selectedIntake.intake_label);
                                                }
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="">Select an existing intake</option>
                                        {availableIntakes.map((intake) => (
                                            <option key={intake.id} value={String(intake.id)}>
                                                {intake.intake_label} — {intake.courses?.length || 0} courses ({intake.status})
                                                {intake.moodle_cohort_idnumber ? ` [${intake.moodle_cohort_idnumber}]` : ''}
                                            </option>
                                        ))}
                                        <option value="__new__">+ Create new intake label...</option>
                                    </select>
                                    {formData.intake_id && (
                                        <p className="text-xs text-green-600 font-medium">
                                            Linked to intake: <strong>{formData.cohort_label}</strong>. This course will share the same Moodle cohort as all other courses in this intake.
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Existing intakes for <strong>{course?.programme_type_name} → {course?.program_name}</strong>. Select one or create new.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        value={formData.cohort_label}
                                        onChange={(e) => onFormChange('cohort_label', e.target.value)}
                                        placeholder="e.g. Sep-2025, Jan-2026"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    {availableIntakes.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => { setShowNewCohortInput(false); onFormChange('cohort_label', ''); onFormChange('intake_id', ''); }}
                                            className="text-xs text-scl-purple hover:underline"
                                        >
                                            ← Back to existing intakes
                                        </button>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Enter the intake period, e.g. <strong>Sep-2025</strong>. A new Moodle cohort will be created.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Course Type</label>
                            {isFromMaster('course_type') ? (
                                <input value={formData.course_type} readOnly className={readOnlyStyle} />
                            ) : (
                                <select value={formData.course_type} onChange={(e) => onFormChange('course_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">Select</option>
                                    {courseTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Awarding Body / Accreditation</label>
                            {isFromMaster('awarding_body_accreditation') ? (
                                <input value={formData.awarding_body_accreditation} readOnly className={readOnlyStyle} />
                            ) : (
                                <select value={formData.awarding_body_accreditation} onChange={(e) => onFormChange('awarding_body_accreditation', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">Select</option>
                                    {AWARDING_BODY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Regulation Level</label>
                            {isFromMaster('regulation_level') ? (
                                <input value={formData.regulation_level} readOnly className={readOnlyStyle} />
                            ) : (
                                <select value={formData.regulation_level} onChange={(e) => onFormChange('regulation_level', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">Select</option>
                                    {REGULATION_LEVEL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Mode of Delivery</label>
                            {isFromMaster('mode_of_delivery') ? (
                                <input value={formData.mode_of_delivery} readOnly className={readOnlyStyle} />
                            ) : (
                                <select value={formData.mode_of_delivery} onChange={(e) => onFormChange('mode_of_delivery', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">Select</option>
                                    {MODE_OF_DELIVERY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => onFormChange('start_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">End Date / Duration</label>
                            <input value={formData.end_date_or_duration} onChange={(e) => onFormChange('end_date_or_duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Subject Area / Discipline</label>
                            {isFromMaster('subject_area_discipline') ? (
                                <input value={formData.subject_area_discipline} readOnly className={readOnlyStyle} />
                            ) : (
                                <select value={formData.subject_area_discipline} onChange={(e) => onFormChange('subject_area_discipline', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">Select</option>
                                    {SUBJECT_AREA_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Assessment Methods</label>
                            <select value={formData.assessment_methods} onChange={(e) => onFormChange('assessment_methods', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Select</option>
                                {ASSESSMENT_METHOD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tuition Fee (GBP)</label>
                            <input type="number" value={formData.tuition_fee_gbp} onChange={(e) => onFormChange('tuition_fee_gbp', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Additional Costs</label>
                            <input value={formData.additional_costs} onChange={(e) => onFormChange('additional_costs', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Funding Options</label>
                            <select value={formData.funding_options} onChange={(e) => onFormChange('funding_options', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Select</option>
                                {FUNDING_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Special Equipment Needed</label>
                            <input value={formData.special_equipment_needed} onChange={(e) => onFormChange('special_equipment_needed', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Work Placement / Internship Included</label>
                            <select value={formData.work_placement_included} onChange={(e) => onFormChange('work_placement_included', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Select</option>
                                {YES_NO_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Course Leader / Programme Director</label>
                            <input value={formData.course_leader_programme_director} onChange={(e) => onFormChange('course_leader_programme_director', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Internal Verification Contact</label>
                            <input value={formData.internal_verification_contact} onChange={(e) => onFormChange('internal_verification_contact', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">UKVI Approved Course?</label>
                            <select value={formData.ukvi_approved_course} onChange={(e) => onFormChange('ukvi_approved_course', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Select</option>
                                {YES_NO_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Approval Date</label>
                            <input type="date" value={formData.approval_date} onChange={(e) => onFormChange('approval_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Review Date</label>
                            <input type="date" value={formData.review_date} onChange={(e) => onFormChange('review_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Course Description</label>
                        <textarea value={formData.course_description} onChange={(e) => onFormChange('course_description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Learning Outcomes</label>
                        <textarea value={formData.learning_outcomes} onChange={(e) => onFormChange('learning_outcomes', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Units / Modules Covered</label>
                        <textarea value={formData.units_modules_covered} onChange={(e) => onFormChange('units_modules_covered', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Entry Requirements</label>
                        <textarea value={formData.entry_requirements} onChange={(e) => onFormChange('entry_requirements', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Learning Resources Provided</label>
                        <textarea value={formData.learning_resources_provided} onChange={(e) => onFormChange('learning_resources_provided', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Special Admission Considerations</label>
                        <textarea value={formData.special_admission_considerations} onChange={(e) => onFormChange('special_admission_considerations', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Progression Opportunities</label>
                        <textarea value={formData.progression_opportunities} onChange={(e) => onFormChange('progression_opportunities', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Industry Partnerships</label>
                        <textarea value={formData.industry_partnerships} onChange={(e) => onFormChange('industry_partnerships', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting
                            ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> {isEditing ? 'Updating...' : 'Registering...'}</>
                            : (isEditing ? 'Update Cohort & Sync Moodle' : 'Submit Cohort & Sync Moodle')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CohortFormModal;
