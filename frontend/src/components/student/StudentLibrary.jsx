import { useState, useEffect } from 'react';
import { BookOpen, FileText, Link2, Download, ExternalLink, Search, AlertCircle, Loader, Filter } from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO } from '../../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentLibrary = ({ user }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState('all');

    useEffect(() => {
        fetchLibraryResources();
    }, [user]);

    const fetchLibraryResources = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get student ID from user email
            const appResponse = await axios.get(`${API_URL}/students/applications`);
            
            if (appResponse.data?.success) {
                const apps = appResponse.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user?.email);
                
                if (studentApp) {
                    // Fetch library resources for this student
                    const libResponse = await axios.get(
                        `${API_URL}/students/library/${studentApp.id}`
                    );
                    
                    if (libResponse.data?.success) {
                        setResources(libResponse.data.data || []);
                    }
                } else {
                    setError('Student information not found');
                }
            }
        } catch (err) {
            console.error('Error fetching library resources:', err);
            setError('Failed to load library resources');
        } finally {
            setLoading(false);
        }
    };

    const handleAccessResource = async (resource) => {
        if (!resource?.moodleUrl) {
            return;
        }

        await openMoodleSSO(user?.email, {
            redirectTo: resource.moodleUrl,
            onError: (message) => {
                setError(message || 'Failed to open Moodle resource');
            }
        });
    };

    // Get unique courses from resources
    const courses = [...new Set(resources.map(r => r.category))].sort();
    const types = [...new Set(resources.map(r => r.type))].sort();

    // Filter resources based on search and filters
    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || resource.type === selectedType;
        const matchesCourse = selectedCourse === 'all' || resource.category === selectedCourse;
        
        return matchesSearch && matchesType && matchesCourse;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'ebooks':
                return <BookOpen className="w-5 h-5" />;
            case 'articles':
                return <FileText className="w-5 h-5" />;
            case 'links':
                return <Link2 className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'ebooks':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'articles':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'links':
                return 'bg-green-50 text-green-700 border-green-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getTypeLabel = (type) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const getFormatIcon = (format) => {
        if (format.toLowerCase().includes('pdf')) return '📄';
        if (format.toLowerCase().includes('link')) return '🔗';
        if (format.toLowerCase().includes('video')) return '▶️';
        if (format.toLowerCase().includes('document')) return '📝';
        return '📎';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-600">Loading library resources...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
                <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-red-800 font-semibold">Error</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Library Resources</h1>
                <p className="text-gray-600">
                    Access course materials, documents, and external resources
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search resources by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Filter className="inline w-4 h-4 mr-2" />
                            Resource Type
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            {types.map(type => (
                                <option key={type} value={type}>
                                    {getTypeLabel(type)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Course Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <BookOpen className="inline w-4 h-4 mr-2" />
                            Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Courses</option>
                            {courses.map(course => (
                                <option key={course} value={course}>
                                    {course}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Results Counter */}
                    <div className="flex items-end">
                        <div className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700 font-medium">
                                {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resources List */}
            {filteredResources.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                    <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">No Resources Found</h3>
                    <p className="text-blue-600">
                        {searchTerm || selectedType !== 'all' || selectedCourse !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Library resources will appear here once available'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                        <div
                            key={resource.id}
                            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Header with Type Badge */}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(resource.type)}`}>
                                    {getTypeIcon(resource.type)}
                                    {getTypeLabel(resource.type)}
                                </div>
                                <span className="text-xl">{getFormatIcon(resource.format)}</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {resource.title}
                            </h3>

                            {/* Course Information */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Course:</span> {resource.category}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Code: {resource.course_code}
                                </p>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {resource.description}
                            </p>

                            {/* Format Badge */}
                            <div className="mb-4">
                                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                    {resource.format}
                                </span>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handleAccessResource(resource)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {resource.type === 'articles' ? (
                                    <>
                                        <ExternalLink className="w-4 h-4" />
                                        Open Link
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Access
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Overall Stats */}
            {resources.length > 0 && (
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">
                            {resources.filter(r => r.type === 'ebooks').length}
                        </div>
                        <div className="text-sm text-purple-700 mt-1">E-Books</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                            {resources.filter(r => r.type === 'articles').length}
                        </div>
                        <div className="text-sm text-blue-700 mt-1">Articles & Links</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                            {courses.length}
                        </div>
                        <div className="text-sm text-green-700 mt-1">Courses</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <div className="text-2xl font-bold text-indigo-600">
                            {resources.length}
                        </div>
                        <div className="text-sm text-indigo-700 mt-1">Total Resources</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentLibrary;
