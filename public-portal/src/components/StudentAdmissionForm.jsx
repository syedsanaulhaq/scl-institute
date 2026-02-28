import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Calendar, User, GraduationCap, FileText, Shield, CheckCircle, AlertCircle, Download, X, FileUp, ChevronDown, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

const StudentAdmissionForm = ({ onSubmitSuccess, isEditMode = false }) => {
  const navigate = useNavigate();
  const { id: applicationId } = useParams();
  const [activeSection, setActiveSection] = useState(1);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreviewData, setCsvPreviewData] = useState([]);
  const [importStatus, setImportStatus] = useState({ type: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingApplication, setIsLoadingApplication] = useState(isEditMode);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    middleNames: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    email: '',
    contactNumber: '',
    addressLine1: '',
    addressLine2: '',
    townCity: '',
    postcode: '',
    countryOfResidence: '',
    
    // Course Selection
    courseTitle: '',
    courseCode: '',
    courseType: '',
    modeOfStudy: '',
    intakeStartDate: '',
    entryRoute: '',
    
    // Academic Background
    highestQualification: '',
    institutionName: '',
    yearCompleted: '',
    workExperience: '',
    englishProficiency: '',
    englishScore: '',
    
    // Documents
    uploadedDocuments: {},
    
    // Support Needs
    hasDisabilities: '',
    disabilityDetails: '',
    
    // Consents
    consentGdpr: false,
    consentDataSharing: false,
    consentMarketing: false,
    declarationTruth: false,
    digitalSignature: '',
    declarationDate: ''
  });

  const sections = [
    { id: 1, title: 'Personal Information', icon: User, color: 'bg-blue-500' },
    { id: 2, title: 'Course Selection', icon: GraduationCap, color: 'bg-purple-500' },
    { id: 3, title: 'Academic Background', icon: FileText, color: 'bg-green-500' },
    { id: 4, title: 'Document Upload', icon: Upload, color: 'bg-orange-500' },
    { id: 5, title: 'Consents & Declaration', icon: Shield, color: 'bg-red-500' }
  ];

  const countries = ['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'India', 'Pakistan', 'Bangladesh', 'China', 'Japan'];

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('🔄 Fetching courses from API:', `${API_URL}/students/courses`);
        setLoadingCourses(true);
        const response = await axios.get(`${API_URL}/students/courses`);
        console.log('✅ API Response:', response.data);
        if (response.data.success) {
          setCourses(response.data.data);
          console.log('✅ Courses loaded:', response.data.data.length, 'courses');
        } else {
          console.error('❌ Failed to fetch courses:', response.data.message);
          // Fallback to empty array
          setCourses([]);
        }
      } catch (error) {
        console.error('❌ Error fetching courses:', error);
        // Fallback to empty array
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Load existing application data when in edit mode
  useEffect(() => {
    if (!isEditMode || !applicationId) {
      setIsLoadingApplication(false);
      return;
    }

    const loadApplicationData = async () => {
      try {
        setIsLoadingApplication(true);
        console.log('📥 Loading application data for ID:', applicationId);
        const response = await axios.get(`${API_URL}/students/applications/${applicationId}`);
        
        if (response.data?.success && response.data?.data?.application) {
          const app = response.data.data.application;
          console.log('✅ Application loaded:', app);
          
          // Populate form with existing data
          // Format dates from ISO format to yyyy-MM-dd for input fields
          setFormData(prev => ({
            ...prev,
            firstName: app.first_name || '',
            middleNames: app.middle_names || '',
            lastName: app.last_name || '',
            dateOfBirth: formatDateForInput(app.date_of_birth),
            gender: app.gender || '',
            nationality: app.nationality || '',
            email: app.email || '',
            contactNumber: app.contact_number || '',
            addressLine1: app.address_line1 || '',
            addressLine2: app.address_line2 || '',
            townCity: app.town_city || '',
            postcode: app.postcode || '',
            countryOfResidence: app.country_of_residence || '',
            courseTitle: app.course_title || '',
            courseCode: app.course_code || '',
            courseType: app.course_type || '',
            modeOfStudy: app.mode_of_study || '',
            intakeStartDate: formatDateForInput(app.intake_start_date),
            entryRoute: app.entry_route || '',
            highestQualification: app.highest_qualification || '',
            institutionName: app.institution_name || '',
            yearCompleted: app.year_completed || '',
            workExperience: app.relevant_work_experience || '',
            englishProficiency: app.english_proficiency || '',
            englishScore: app.english_score || '',
            hasDisabilities: app.has_disabilities_support_needs ? 'yes' : 'no',
            disabilityDetails: app.disability_support_details || '',
            consentGdpr: app.consent_gdpr || false,
            consentDataSharing: app.consent_data_sharing || false,
            consentMarketing: app.consent_marketing || false,
            declarationTruth: app.declaration_truth || false,
            digitalSignature: app.digital_signature || '',
            declarationDate: formatDateForInput(app.declaration_date)
          }));
        } else {
          setSubmitStatus({ type: 'error', message: 'Failed to load application data' });
        }
      } catch (error) {
        console.error('❌ Error loading application:', error);
        setSubmitStatus({ type: 'error', message: 'Error loading application data' });
      } finally {
        setIsLoadingApplication(false);
      }
    };

    loadApplicationData();
  }, [isEditMode, applicationId]);

  const documentTypes = [
    'Passport / ID',
    'Academic Certificates', 
    'Academic Transcripts',
    'English Language Certificate',
    'CV / Resume',
    'Work Reference',
    'Proof of Address',
    'Visa / Immigration Document'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-fill course code when course is selected
    if (field === 'courseTitle') {
      const selectedCourse = courses.find(course => course.course_title === value);
      if (selectedCourse) {
        setFormData(prev => ({
          ...prev,
          courseCode: selectedCourse.course_code,
          courseType: selectedCourse.course_type
        }));
      }
    }
  };

  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const renderPersonalInformation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name(s)</label>
          <input
            type="text"
            value={formData.middleNames}
            onChange={(e) => handleInputChange('middleNames', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter middle names"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
          <select
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select nationality</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
          <input
            type="tel"
            value={formData.contactNumber}
            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter contact number"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
          <input
            type="text"
            value={formData.addressLine1}
            onChange={(e) => handleInputChange('addressLine1', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Street address, building number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) => handleInputChange('addressLine2', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Apartment, suite, unit, etc."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Town/City *</label>
            <input
              type="text"
              value={formData.townCity}
              onChange={(e) => handleInputChange('townCity', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Town or city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postcode *</label>
            <input
              type="text"
              value={formData.postcode}
              onChange={(e) => handleInputChange('postcode', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Postal code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country of Residence *</label>
            <select
              value={formData.countryOfResidence}
              onChange={(e) => handleInputChange('countryOfResidence', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourseSelection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title * {courses.length > 0 && `(${courses.length} available)`}
          </label>
          <select
            value={formData.courseTitle}
            onChange={(e) => handleInputChange('courseTitle', e.target.value)}
            disabled={loadingCourses}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingCourses ? 'Loading courses...' : `Select a course ${courses.length > 0 ? `(${courses.length} available)` : '(No courses found)'}`}
            </option>
            {courses.map(course => (
              <option key={course.course_code} value={course.course_title}>
                {course.course_title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
          <input
            type="text"
            value={formData.courseCode}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            placeholder="Auto-filled"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
          <input
            type="text"
            value={formData.courseType}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            placeholder="Auto-filled"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Study *</label>
          <select
            value={formData.modeOfStudy}
            onChange={(e) => handleInputChange('modeOfStudy', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select mode</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Online">Online</option>
            <option value="Blended">Blended</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Intake / Start Date *</label>
          <input
            type="date"
            value={formData.intakeStartDate}
            onChange={(e) => handleInputChange('intakeStartDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Entry Route *</label>
          <select
            value={formData.entryRoute}
            onChange={(e) => handleInputChange('entryRoute', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select entry route</option>
            <option value="Standard">Standard</option>
            <option value="RPL">RPL (Recognition of Prior Learning)</option>
            <option value="Mature Student">Mature Student</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAcademicBackground = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Highest Qualification Achieved *</label>
          <select
            value={formData.highestQualification}
            onChange={(e) => handleInputChange('highestQualification', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select qualification</option>
            <option value="GCSE">GCSE</option>
            <option value="A-Level">A-Level</option>
            <option value="Level 3 Diploma">Level 3 Diploma</option>
            <option value="HND">HND</option>
            <option value="Degree">Degree</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name *</label>
          <input
            type="text"
            value={formData.institutionName}
            onChange={(e) => handleInputChange('institutionName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Name of institution"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Year Completed *</label>
        <input
          type="date"
          value={formData.yearCompleted}
          onChange={(e) => handleInputChange('yearCompleted', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Relevant Work Experience</label>
        <textarea
          rows="4"
          value={formData.workExperience}
          onChange={(e) => handleInputChange('workExperience', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Describe your relevant work experience..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">English Language Proficiency *</label>
          <select
            value={formData.englishProficiency}
            onChange={(e) => handleInputChange('englishProficiency', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select proficiency test</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEFL">TOEFL</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Score Achieved</label>
          <input
            type="number"
            step="0.1"
            value={formData.englishScore}
            onChange={(e) => handleInputChange('englishScore', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter score"
          />
        </div>
      </div>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map((docType, index) => (
          <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-400 transition-colors">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">{docType}</h3>
              <p className="text-xs text-gray-600 mb-4">PDF, JPG, PNG up to 10MB</p>
              <button 
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Choose File
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Document Upload Requirements</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• All documents must be clear and readable</li>
              <li>• Academic certificates should be official or certified copies</li>
              <li>• File formats: PDF, JPG, PNG only</li>
              <li>• Maximum file size: 10MB per document</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConsentsDeclaration = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Support Needs Assessment</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you have any disabilities or learning support needs?
          </label>
          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="yes"
                checked={formData.hasDisabilities === 'yes'}
                onChange={(e) => handleInputChange('hasDisabilities', e.target.value)}
                className="form-radio h-4 w-4 text-red-600"
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label className="inline-flex items-center ml-6">
              <input
                type="radio"
                value="no"
                checked={formData.hasDisabilities === 'no'}
                onChange={(e) => handleInputChange('hasDisabilities', e.target.value)}
                className="form-radio h-4 w-4 text-red-600"
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>

        {formData.hasDisabilities === 'yes' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Please specify</label>
            <textarea
              rows="3"
              value={formData.disabilityDetails}
              onChange={(e) => handleInputChange('disabilityDetails', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Please describe your support needs..."
            />
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Protection & Consents</h3>
        
        <div className="space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.consentGdpr}
              onChange={(e) => handleInputChange('consentGdpr', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>I consent to process personal data (UK GDPR)</strong> - Required for processing your application
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.consentDataSharing}
              onChange={(e) => handleInputChange('consentDataSharing', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>I consent to share data with awarding bodies</strong> - Required for course certification
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.consentMarketing}
              onChange={(e) => handleInputChange('consentMarketing', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              I consent to receive marketing information - Optional
            </span>
          </label>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Declaration</h3>
        
        <label className="flex items-start mb-4">
          <input
            type="checkbox"
            checked={formData.declarationTruth}
            onChange={(e) => handleInputChange('declarationTruth', e.target.checked)}
            className="h-4 w-4 text-green-600 border-gray-300 rounded mt-1"
          />
          <span className="ml-3 text-sm text-gray-700">
            <strong>I declare that the information provided is true and complete</strong> - Required
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Digital Signature / Full Name *</label>
            <input
              type="text"
              value={formData.digitalSignature}
              onChange={(e) => handleInputChange('digitalSignature', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Type your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Declaration</label>
            <input
              type="date"
              value={formData.declarationDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleInputChange('declarationDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (activeSection) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.contactNumber;
      case 2:
        return formData.courseTitle && formData.modeOfStudy && formData.intakeStartDate;
      case 3:
        return formData.highestQualification && formData.institutionName;
      case 4:
        return true; // Documents are optional for now
      case 5:
        return formData.consentGdpr && formData.consentDataSharing && formData.declarationTruth && formData.digitalSignature;
      default:
        return false;
    }
  };

  const normalizeCourseType = (courseType) => {
    const allowed = ['HND', 'Degree', 'Vocational', 'Short Course', 'CPD'];
    if (allowed.includes(courseType)) return courseType;

    const value = (courseType || '').toLowerCase();
    if (value.includes('hnd')) return 'HND';
    if (value.includes('vocational')) return 'Vocational';
    if (value.includes('short')) return 'Short Course';
    if (value.includes('degree') || value.includes('bachelor') || value.includes('master')) return 'Degree';
    if (value.includes('professional') || value.includes('qualification')) return 'CPD';
    return 'CPD';
  };

  const handleSubmitApplication = async () => {
    if (!canProceed()) {
      setSubmitStatus({ type: 'error', message: 'Please complete all required fields before submitting.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: 'loading', message: isEditMode ? 'Updating application...' : 'Submitting application...' });

      // Create FormData for file uploads (supports both create and update)
      const formDataWithFiles = new FormData();
      
      // Add all form fields
      formDataWithFiles.append('first_name', formData.firstName);
      formDataWithFiles.append('middle_names', formData.middleNames);
      formDataWithFiles.append('last_name', formData.lastName);
      formDataWithFiles.append('date_of_birth', formData.dateOfBirth);
      formDataWithFiles.append('gender', formData.gender);
      formDataWithFiles.append('nationality', formData.nationality);
      formDataWithFiles.append('email', formData.email);
      formDataWithFiles.append('contact_number', formData.contactNumber);
      formDataWithFiles.append('address_line1', formData.addressLine1);
      formDataWithFiles.append('address_line2', formData.addressLine2);
      formDataWithFiles.append('town_city', formData.townCity);
      formDataWithFiles.append('postcode', formData.postcode);
      formDataWithFiles.append('country_of_residence', formData.countryOfResidence);

      // Course Selection
      formDataWithFiles.append('course_title', formData.courseTitle);
      formDataWithFiles.append('course_code', formData.courseCode);
      formDataWithFiles.append('course_type', normalizeCourseType(formData.courseType));
      formDataWithFiles.append('mode_of_study', formData.modeOfStudy);
      formDataWithFiles.append('intake_start_date', formData.intakeStartDate);
      formDataWithFiles.append('entry_route', formData.entryRoute);

      // Academic Background
      formDataWithFiles.append('highest_qualification', formData.highestQualification);
      formDataWithFiles.append('institution_name', formData.institutionName);
      formDataWithFiles.append('year_completed', formData.yearCompleted);
      formDataWithFiles.append('relevant_work_experience', formData.workExperience);
      formDataWithFiles.append('english_proficiency', formData.englishProficiency);
      formDataWithFiles.append('english_score', formData.englishScore);

      // Support Requirements
      formDataWithFiles.append('has_disabilities_support_needs', formData.hasDisabilities === 'yes');
      formDataWithFiles.append('disability_support_details', formData.disabilityDetails);

      // Consents & Declaration
      formDataWithFiles.append('consent_gdpr', formData.consentGdpr);
      formDataWithFiles.append('consent_data_sharing', formData.consentDataSharing);
      formDataWithFiles.append('consent_marketing', formData.consentMarketing);
      formDataWithFiles.append('declaration_truth', formData.declarationTruth);
      formDataWithFiles.append('digital_signature', formData.digitalSignature);
      formDataWithFiles.append('declaration_date', formData.declarationDate || new Date().toISOString().split('T')[0]);

      // Use PUT for edit mode, POST for create
      const response = isEditMode 
        ? await axios.put(`${API_URL}/students/applications/${applicationId}`, formDataWithFiles, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : await axios.post(`${API_URL}/students/applications`, formDataWithFiles, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

      if (response.data?.success) {
        const reference = response.data?.data?.application_reference || response.data?.application_reference || 'N/A';
        const appId = response.data?.data?.application_id || applicationId;
        const successMsg = isEditMode ? 'Application updated successfully' : 'Application submitted successfully';
        setSubmitStatus({
          type: 'success',
          message: `${successMsg}. Reference: ${reference}`
        });
        if (onSubmitSuccess) {
          onSubmitSuccess(reference);
        }
        // If in admin mode, redirect to applications list
        if (isEditMode && navigate) {
          setTimeout(() => {
            navigate(`/applications?highlight=${reference || appId}`);
          }, 1000);
        }
      } else {
        setSubmitStatus({
          type: 'error',
          message: response.data?.message || 'Submission failed. Please try again.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error?.response?.data?.message || 'Submission failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Template and Import Functions
  const generateCSVTemplate = () => {
    const csvHeaders = [
      'Full Name',
      'Email',
      'Phone Number', 
      'Date of Birth',
      'Nationality',
      'Gender',
      'Marital Status',
      'Current Address',
      'City',
      'Country',
      'Emergency Contact Name',
      'Emergency Contact Relation',
      'Emergency Contact Phone',
      'Course Applied',
      'Study Mode',
      'Previous Education',
      'Previous Institution',
      'Previous GPA',
      'English Proficiency',
      'Work Experience'
    ];
    
    const csvContent = csvHeaders.join(',') + '\n' +
      'John Doe,john.doe@email.com,+971-50-123-4567,1995-05-15,UAE,Male,Single,"123 Sheikh Zayed Road Dubai",Dubai,UAE,Jane Doe,Mother,+971-50-987-6543,Computer Science,Full-time,High School Diploma,Dubai International School,3.8,IELTS 7.0,"Internship at Tech Company (6 months)"';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_admission_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      
      // Parse CSV for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const previewLines = lines.slice(1, 6); // Show first 5 rows
        
        const preview = previewLines.map(line => {
          const values = line.split(',');
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
          });
          return row;
        }).filter(row => row['Full Name']); // Filter out empty rows
        
        setCsvPreviewData(preview);
        setImportStatus({ type: 'success', message: `File loaded successfully. Found ${preview.length} student records.` });
      };
      reader.readAsText(file);
    } else {
      setImportStatus({ type: 'error', message: 'Please upload a valid CSV file.' });
    }
  };

  const processBulkImport = () => {
    if (!csvFile) {
      setImportStatus({ type: 'error', message: 'Please select a CSV file first.' });
      return;
    }
    
    // Simulate processing
    setImportStatus({ type: 'loading', message: 'Processing bulk import...' });
    
    setTimeout(() => {
      setImportStatus({ type: 'success', message: `Successfully imported ${csvPreviewData.length} student applications!` });
      
      // Reset states after 3 seconds
      setTimeout(() => {
        setCsvModalOpen(false);
        setCsvFile(null);
        setCsvPreviewData([]);
        setImportStatus({ type: '', message: '' });
      }, 3000);
    }, 2000);
  };

  // Fill sample data for testing
  const fillSampleData = () => {
    const today = new Date().toISOString().split('T')[0];
    const firstCourse = courses.length > 0 ? courses[0] : null;
    
    setFormData({
      // Personal Information
      firstName: 'Mohammed',
      middleNames: 'Ahmed',
      lastName: 'Hassan',
      dateOfBirth: '1998-05-15',
      gender: 'Male',
      nationality: 'Nigeria',
      email: 'mohammed.hassan@example.com',
      contactNumber: '+234-803-555-0123',
      addressLine1: '123 Lagos Street',
      addressLine2: 'Flat 4B',
      townCity: 'Lagos',
      postcode: '100001',
      countryOfResidence: 'Nigeria',
      
      // Course Selection
      courseTitle: firstCourse?.course_title || '',
      courseCode: firstCourse?.course_code || '',
      courseType: firstCourse?.course_type || '',
      modeOfStudy: 'Full-time',
      intakeStartDate: today,
      entryRoute: 'Standard',
      
      // Academic Background
      highestQualification: 'A-Level',
      institutionName: 'Lagos International College',
      yearCompleted: '2020-06-30',
      workExperience: '2 years in IT support at Tech Solutions Ltd',
      englishProficiency: 'IELTS',
      englishScore: '6.5',
      
      // Documents
      uploadedDocuments: {},
      
      // Support Needs
      hasDisabilities: 'no',
      disabilityDetails: '',
      
      // Consents
      consentGdpr: true,
      consentDataSharing: true,
      consentMarketing: false,
      declarationTruth: true,
      digitalSignature: 'Mohammed Ahmed Hassan',
      declarationDate: today
    });
    
    // If we have courses, auto-expand to first section
    setActiveSection(1);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Student Admission Application</h1>
          <p className="text-gray-600 mt-1 text-sm">Complete all sections to submit your application</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fillSampleData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
          >
            <User className="w-4 h-4 mr-2" />
            Fill Sample Data
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Progress:</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-scl-purple h-2 rounded-full transition-all duration-300"
                style={{ width: `${(activeSection / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900">{activeSection}/5</span>
          </div>
        </div>
      </div>

      {submitStatus.message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            submitStatus.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : submitStatus.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      {/* Accordion Form Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="space-y-0">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const Icon = section.icon;
            
            return (
              <div key={section.id} className="border-b border-gray-200 last:border-b-0">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                    isActive 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${section.color} bg-opacity-10`}>
                      <Icon className={`h-5 w-5 ${section.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {section.id === 1 && "Please provide your personal information"}
                        {section.id === 2 && "Select your course and study preferences"}
                        {section.id === 3 && "Tell us about your academic background"}
                        {section.id === 4 && "Upload your supporting documents"}
                        {section.id === 5 && "Review and confirm your application"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {section.id}/5
                    </span>
                    {isActive ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {/* Section Content */}
                {isActive && (
                  <div className="p-6 pt-0 border-t border-gray-100">
                    {section.id === 1 && renderPersonalInformation()}
                    {section.id === 2 && renderCourseSelection()}
                    {section.id === 3 && renderAcademicBackground()}
                    {section.id === 4 && renderDocumentUpload()}
                    {section.id === 5 && renderConsentsDeclaration()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button - Always Visible */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmitApplication}
              disabled={!canProceed() || isSubmitting || isLoadingApplication}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {isLoadingApplication 
                ? 'Loading...' 
                : isSubmitting 
                  ? (isEditMode ? 'Updating...' : 'Submitting...') 
                  : (isEditMode ? 'Update Application' : 'Submit Application')
              }
            </button>
          </div>
        </div>
      </div>
      
      {/* CSV Import Modal */}

    </div>
  );
};

export default StudentAdmissionForm;