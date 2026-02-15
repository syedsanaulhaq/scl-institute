import { useState, useEffect } from 'react';
import { BookOpen, Search, Download, ExternalLink, BookMarked, FileText, Video, Headphones } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentLibrary = ({ user }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);

    const categories = [
        { id: 'all', name: 'All Resources', icon: BookOpen },
        { id: 'ebooks', name: 'E-Books', icon: BookMarked },
        { id: 'articles', name: 'Articles & Papers', icon: FileText },
        { id: 'videos', name: 'Video Tutorials', icon: Video },
        { id: 'audio', name: 'Audio Resources', icon: Headphones }
    ];

    // Sample library resources - in production, these would come from a database or Moodle
    const libraryResources = [
        {
            id: 1,
            title: 'Introduction to Computer Science',
            type: 'ebooks',
            category: 'Computer Science',
            author: 'Various Authors',
            description: 'Comprehensive introduction to programming and computer science fundamentals',
            format: 'PDF',
            size: '12.5 MB',
            available: true
        },
        {
            id: 2,
            title: 'Business Management Essentials',
            type: 'ebooks',
            category: 'Business',
            author: 'Dr. Sarah Johnson',
            description: 'Core principles and practices of modern business management',
            format: 'PDF',
            size: '8.3 MB',
            available: true
        },
        {
            id: 3,
            title: 'Data Structures and Algorithms',
            type: 'articles',
            category: 'Computer Science',
            author: 'IEEE Computer Society',
            description: 'Research papers on advanced data structures and algorithmic approaches',
            format: 'PDF Collection',
            size: '45 MB',
            available: true
        },
        {
            id: 4,
            title: 'Web Development Tutorial Series',
            type: 'videos',
            category: 'Programming',
            author: 'SCL Institute',
            description: 'Video lectures covering HTML, CSS, JavaScript, and modern frameworks',
            format: 'MP4',
            size: '2.1 GB',
            available: true
        },
        {
            id: 5,
            title: 'Academic Writing Guide',
            type: 'ebooks',
            category: 'Study Skills',
            author: 'Academic Press',
            description: 'Complete guide to academic writing, citations, and research methodology',
            format: 'PDF',
            size: '5.8 MB',
            available: true
        }
    ];

    const filteredResources = libraryResources.filter(resource => {
        const matchesCategory = selectedCategory === 'all' || resource.type === selectedCategory;
        const matchesSearch = searchQuery === '' || 
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAccessResource = async (resource) => {
        try {
            // Redirect to Moodle files/library area with SSO
            const ssoPayload = { 
                email: user?.email,
                redirect_to: '/my/' // Redirect to user's dashboard where they can access their course files
            };
            
            const response = await axios.post(`${API_URL}/sso/generate`, ssoPayload);
            if (response.data?.success && response.data?.redirectUrl) {
                window.open(response.data.redirectUrl, '_blank');
            } else {
                // Fallback to direct Moodle link
                window.open('http://system.sclsandbox.xyz:9090/my/', '_blank');
            }
        } catch (err) {
            console.error('SSO Error:', err);
            window.open('http://system.sclsandbox.xyz:9090/my/', '_blank');
        }
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'ebooks':
                return <BookMarked className="w-6 h-6 text-blue-600" />;
            case 'articles':
                return <FileText className="w-6 h-6 text-green-600" />;
            case 'videos':
                return <Video className="w-6 h-6 text-purple-600" />;
            case 'audio':
                return <Headphones className="w-6 h-6 text-yellow-600" />;
            default:
                return <BookOpen className="w-6 h-6 text-gray-600" />;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Library Resources</h1>
                <p className="text-gray-600">Access e-books, academic papers, video tutorials, and other learning materials</p>
            </div>

            {/* Search and Moodle Link */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search resources by title, category, or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={() => window.open('http://system.sclsandbox.xyz:9090', '_blank')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
                >
                    <ExternalLink className="w-5 h-5" />
                    Open Full Library in Moodle
                </button>
            </div>

            {/* Category Filters */}
            <div className="mb-8 flex flex-wrap gap-3">
                {categories.map(category => {
                    const Icon = category.icon;
                    return (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                                selectedCategory === category.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {category.name}
                        </button>
                    );
                })}
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No resources found matching your search</p>
                    </div>
                ) : (
                    filteredResources.map(resource => (
                        <div key={resource.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                            <div className="flex items-start gap-4 mb-4">
                                {getResourceIcon(resource.type)}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
                                    <p className="text-sm text-gray-600">{resource.category}</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{resource.description}</p>

                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                                <span>By {resource.author}</span>
                                <span>{resource.format}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{resource.size}</span>
                                <button
                                    onClick={() => handleAccessResource(resource)}
                                    className={`px-4 py-2 rounded text-sm font-medium transition flex items-center gap-2 ${
                                        resource.available
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    }`}
                                    disabled={!resource.available}
                                >
                                    {resource.available ? (
                                        <>
                                            <ExternalLink className="w-4 h-4" />
                                            Access
                                        </>
                                    ) : (
                                        'Unavailable'
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Library Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Library Access Information</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                    <li>• All library resources are available 24/7 through Moodle course materials</li>
                    <li>• Click "Access" to open Moodle and browse your course files and resources</li>
                    <li>• Use your student credentials to access external databases and journals</li>
                    <li>• Request new resources or materials through the Support Hub</li>
                    <li>• Download limits and copyright policies apply to all materials</li>
                    <li>• For research assistance, contact the library team via support</li>
                </ul>
            </div>
        </div>
    );
};

export default StudentLibrary;
