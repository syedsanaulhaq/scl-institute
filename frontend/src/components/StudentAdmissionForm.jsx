import React, { useState } from 'react';
import { Upload, Calendar, User, GraduationCap, FileText, Shield, CheckCircle, AlertCircle, Download, X, FileUp } from 'lucide-react';

const StudentAdmissionForm = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreviewData, setCsvPreviewData] = useState([]);
  const [importStatus, setImportStatus] = useState({ type: '', message: '' });
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

  const courses = [
    { code: 'BUS101', title: 'Business Administration HND', type: 'HND' },
    { code: 'IT201', title: 'Information Technology Degree', type: 'Degree' },
    { code: 'ACC301', title: 'Accounting and Finance HND', type: 'HND' },
    { code: 'ENG401', title: 'English Language Course', type: 'Short Course' },
    { code: 'PROJ501', title: 'Project Management CPD', type: 'CPD' }
  ];

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
      const selectedCourse = courses.find(course => course.title === value);
      if (selectedCourse) {
        setFormData(prev => ({
          ...prev,
          courseCode: selectedCourse.code,
          courseType: selectedCourse.type
        }));
      }
    }
  };

  const nextSection = () => {
    if (currentSection < 5) setCurrentSection(currentSection + 1);
  };

  const prevSection = () => {
    if (currentSection > 1) setCurrentSection(currentSection - 1);
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
          <select
            value={formData.courseTitle}
            onChange={(e) => handleInputChange('courseTitle', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.code} value={course.title}>{course.title}</option>
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

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 1: return renderPersonalInformation();
      case 2: return renderCourseSelection();
      case 3: return renderAcademicBackground();
      case 4: return renderDocumentUpload();
      case 5: return renderConsentsDeclaration();
      default: return renderPersonalInformation();
    }
  };

  const canProceed = () => {
    switch (currentSection) {
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
            onClick={() => setCsvModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Bulk Import CSV
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Progress:</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-scl-purple h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentSection / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900">{currentSection}/5</span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Horizontal Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0">
            {sections.map((section) => {
              const isActive = currentSection === section.id;
              const isCompleted = currentSection > section.id;
              const Icon = section.icon;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`flex-1 flex items-center justify-center p-4 text-sm font-medium transition-all relative ${
                    isActive 
                      ? 'text-scl-purple bg-purple-50 border-b-2 border-scl-purple'
                      : isCompleted
                      ? 'text-green-600 bg-green-50 hover:bg-green-100'
                      : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${
                      isActive ? 'bg-scl-purple/10' : isCompleted ? 'bg-green-100' : 'bg-gray-200'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Icon className={`h-4 w-4 ${
                          isActive ? 'text-scl-purple' : 'text-gray-400'
                        }`} />
                      )}
                    </div>
                    <span className="hidden lg:block">{section.title}</span>
                    <span className="lg:hidden">{section.id}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {sections[currentSection - 1].title}
            </h2>
            <p className="text-gray-600 text-sm">
              {currentSection === 1 && "Please provide your personal information"}
              {currentSection === 2 && "Select your course and study preferences"}
              {currentSection === 3 && "Tell us about your academic background"}
              {currentSection === 4 && "Upload your supporting documents"}
              {currentSection === 5 && "Review and confirm your application"}
            </p>
          </div>

          {renderCurrentSection()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={prevSection}
              disabled={currentSection === 1}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Save Draft
              </button>
              
              {currentSection < 5 ? (
                <button
                  onClick={nextSection}
                  disabled={!canProceed()}
                  className="px-6 py-3 bg-scl-purple text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Next Section
                </button>
              ) : (
                <button
                  disabled={!canProceed()}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* CSV Import Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Bulk Import Student Applications</h2>
              <button
                onClick={() => setCsvModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Import Instructions</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="mb-2"><strong>Step 1:</strong> Download the CSV template below with the correct format</p>
                      <p className="mb-2"><strong>Step 2:</strong> Fill in your student data following the template structure</p>
                      <p><strong>Step 3:</strong> Upload your completed CSV file for bulk import</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Template Download */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-gray-900">CSV Template</h4>
                  <button
                    onClick={generateCSVTemplate}
                    className="flex items-center px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </button>
                </div>
                <p className="text-sm text-gray-600">Download the template CSV file with sample data and correct column headers.</p>
              </div>
              
              {/* File Upload */}
              <div className="mb-6">
                <h4 className="text-base font-semibold text-gray-900 mb-3">Upload CSV File</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                    id="csvUpload"
                  />
                  <label
                    htmlFor="csvUpload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FileUp className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">Upload CSV File</p>
                    <p className="text-sm text-gray-600">Click to browse or drag and drop your CSV file here</p>
                  </label>
                </div>
                
                {csvFile && (
                  <div className="mt-4 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-green-800">{csvFile.name}</span>
                  </div>
                )}
              </div>
              
              {/* Status Messages */}
              {importStatus.message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  importStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                  importStatus.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                  'bg-yellow-50 border border-yellow-200 text-yellow-800'
                }`}>
                  <p className="text-sm font-medium">{importStatus.message}</p>
                </div>
              )}
              
              {/* Preview Data */}
              {csvPreviewData.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Preview ({csvPreviewData.length} records)</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-900">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-900">Email</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-900">Course</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-900">Nationality</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {csvPreviewData.map((row, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-gray-900">{row['Full Name']}</td>
                            <td className="px-3 py-2 text-gray-600">{row['Email']}</td>
                            <td className="px-3 py-2 text-gray-900">{row['Course Applied']}</td>
                            <td className="px-3 py-2 text-gray-600">{row['Nationality']}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
              <button
                onClick={() => setCsvModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processBulkImport}
                disabled={!csvFile || importStatus.type === 'loading'}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {importStatus.type === 'loading' ? 'Processing...' : 'Import Students'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAdmissionForm;