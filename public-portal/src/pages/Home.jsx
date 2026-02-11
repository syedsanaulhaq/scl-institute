import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search,
    Star,
    ArrowRight,
    Loader,
    BookOpen,
    Award,
    Users,
    Zap,
    Globe,
    CheckCircle,
    MapPin,
    Phone,
    Mail,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Calendar,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';

const Home = ({ onApplyNow }) => {
    const [moodleCourses, setMoodleCourses] = useState([]);
    const [courseCategories, setCourseCategories] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryScroll, setCategoryScroll] = useState(0);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [expandedModule, setExpandedModule] = useState(null);

    // Fetch courses from Moodle
    useEffect(() => {
        const fetchCourses = async () => {
            setCoursesLoading(true);
            console.log('🔄 [FETCH] Starting course fetch...');
            
            try {
                console.log('📡 [FETCH] Attempting API call to /api/notifications/courses/public');
                const response = await axios.get('/api/notifications/courses/public', {
                    timeout: 10000
                });
                
                console.log('✅ [FETCH] API response received:', response.status, response.data);
                
                const courseData = response.data?.courses;
                console.log('📊 [FETCH] Course data type:', typeof courseData, 'is Array:', Array.isArray(courseData), 'length:', courseData?.length);
                
                if (Array.isArray(courseData) && courseData.length > 0) {
                    console.log('📚 [FETCH] Processing', courseData.length, 'courses');
                    
                    // Map Moodle courses to display format with rating and image
                    const courseImages = ['/product_img-01.jpg', '/product_img-02.jpg', '/product_img-03.jpg', '/product_img-04.jpg', '/product_img-05.jpg', '/product_img-06.jpg', '/product_img-07.jpg', '/product_img-08.jpg'];
                    const teachers = ['Dr. Sarah Johnson', 'Prof. Ahmed Hassan', 'Dr. Emily Walker', 'Prof. Michael Chen', 'Dr. Lisa Anderson', 'Prof. James Wilson', 'Dr. Priya Patel', 'Prof. David Brown'];
                    
                    const contentActivities = [
                        {
                            'Module 1: Introduction': ['Video Lecture - Course Overview', 'Reading: Introduction to Concepts', 'Quiz: Knowledge Check'],
                            'Module 2: Fundamentals': ['Video Lecture - Core Principles', 'Interactive Lab', 'Practice Exercises'],
                            'Module 3: Advanced Concepts': ['Deep Dive Video', 'Case Study Analysis', 'Discussion Forum'],
                            'Module 4: Practical Applications': ['Real World Examples', 'Project Assignment', 'Code Review'],
                            'Module 5: Final Project': ['Capstone Project Brief', 'Mentoring Sessions', 'Final Assessment']
                        },
                        {
                            'Week 1: Getting Started': ['Welcome Video', 'Course Materials PDF', 'Resource Links'],
                            'Week 2: Core Concepts': ['Live Webinar', 'Homework Assignment', 'Study Guide'],
                            'Week 3: Deep Dive': ['Expert Interview', 'Advanced Topics', 'Q&A Session'],
                            'Week 4: Case Studies': ['Industry Examples', 'Group Discussion', 'Analysis Worksheet'],
                            'Week 5: Capstone': ['Final Project Guidelines', 'Peer Review', 'Submission Portal']
                        },
                        {
                            'Lesson 1: Basics': ['Introduction Video', 'Core Concepts', 'Simple Quiz'],
                            'Lesson 2: Intermediate': ['Tutorial Video', 'Practical Exercises', 'Feedback'],
                            'Lesson 3: Advanced': ['Advanced Techniques', 'Complex Problems', 'Challenge Tasks'],
                            'Lesson 4: Expert': ['Expert Tips', 'Real Examples', 'Advanced Quiz'],
                            'Lesson 5: Mastery': ['Master Project', 'Peer Teaching', 'Certification']
                        },
                        {
                            'Topic 1: Foundation': ['Foundation Concepts', 'Basic Resources', 'Starter Quiz'],
                            'Topic 2: Building Blocks': ['Core Components', 'Assembly Exercises', 'Progress Check'],
                            'Topic 3: Complex Topics': ['Complexity explained', 'Advanced Examples', 'Expert Panel'],
                            'Topic 4: Real World': ['Industry Application', 'Live Projects', 'Mentoring'],
                            'Topic 5: Conclusion': ['Summary Materials', 'Career Paths', 'Final Exam']
                        },
                        {
                            'Chapter 1: Start Here': ['Chapter Overview', 'Key Concepts', 'Chapter Quiz'],
                            'Chapter 2: Progress': ['Reading Materials', 'Reflection Activity', 'Discussion'],
                            'Chapter 3: Challenges': ['Challenge Problems', 'Solution Guide', 'Peer Review'],
                            'Chapter 4: Solutions': ['Solutions Explained', 'Best Practices', 'Case Analysis'],
                            'Chapter 5: Summary': ['Summary Review', 'Key Takeaways', 'Final Assessment']
                        }
                    ];
                    
                    const activityTemplates = [
                        ['Module 1: Introduction', 'Module 2: Fundamentals', 'Module 3: Advanced Concepts', 'Module 4: Practical Applications', 'Module 5: Final Project'],
                        ['Week 1: Getting Started', 'Week 2: Core Concepts', 'Week 3: Deep Dive', 'Week 4: Case Studies', 'Week 5: Capstone'],
                        ['Lesson 1: Basics', 'Lesson 2: Intermediate', 'Lesson 3: Advanced', 'Lesson 4: Expert', 'Lesson 5: Mastery'],
                        ['Topic 1: Foundation', 'Topic 2: Building Blocks', 'Topic 3: Complex Topics', 'Topic 4: Real World', 'Topic 5: Conclusion'],
                        ['Chapter 1: Start Here', 'Chapter 2: Progress', 'Chapter 3: Challenges', 'Chapter 4: Solutions', 'Chapter 5: Summary']
                    ];
                    const formattedCourses = courseData.map((course, idx) => {
                        const contentTemplate = activityTemplates[idx % activityTemplates.length];
                        const activitiesMap = contentActivities[idx % contentActivities.length];
                        const contentWithActivities = contentTemplate.map(item => ({
                            title: item,
                            activities: activitiesMap[item] || ['Video Lecture', 'Quiz', 'Assignment']
                        }));
                        
                        const formatted = {
                            id: course.id,
                            name: course.name || course.fullname || `Course ${idx + 1}`,
                            code: course.code || course.shortname || `CODE${idx + 1}`,
                            description: course.description || 'Professional program designed for career advancement',
                            category: course.category || course.categoryname || 'General',
                            icon: '📚',
                            rating: 4.5 + (Math.random() * 0.5),
                            students: Math.floor(Math.random() * 1000) + 100,
                            totalStudents: Math.floor(Math.random() * 5000) + 500,
                            teacher: teachers[idx % teachers.length],
                            price: course.price || ((idx + 1) * 29.99),
                            image: courseImages[idx % courseImages.length],
                            content: contentWithActivities
                        };
                        console.log(`  [${idx}]`, formatted.name, '- Category:', formatted.category, '- Teacher:', formatted.teacher, '- Price: $', formatted.price);
                        return formatted;
                    });
                    
                    // Extract unique categories from courses
                    const uniqueCategories = [...new Set(formattedCourses.map(c => c.category))];
                    const categoryMap = uniqueCategories.map(cat => ({
                        name: cat,
                        icon: '📚',
                        count: formattedCourses.filter(c => c.category === cat).length
                    }));
                    
                    console.log('✅ [FETCH] Found', uniqueCategories.length, 'unique categories:', uniqueCategories);
                    console.log('✅ [FETCH] Formatted', formattedCourses.length, 'courses, setting state...');
                    setMoodleCourses(formattedCourses);
                    setCourseCategories(categoryMap);
                    console.log('✓ [FETCH] State updated with', formattedCourses.length, 'courses and', categoryMap.length, 'categories');
                } else {
                    console.warn('⚠️ [FETCH] No valid course array found:', courseData);
                    setMoodleCourses([]);
                    setCourseCategories([]);
                }
            } catch (err) {
                console.error('❌ [FETCH] Error:', err.message);
                if (err.response) {
                    console.error('  Status:', err.response.status);
                    console.error('  Data:', err.response.data);
                }
                setMoodleCourses([]);
            } finally {
                console.log('🏁 [FETCH] Setting coursesLoading to false');
                setCoursesLoading(false);
            }
        };
        
        fetchCourses();
    }, []);

    const filteredCourses = moodleCourses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const features = [
        { icon: <BookOpen className="w-8 h-8" />, title: 'Cloud Library', desc: 'Access thousands of resources anytime, anywhere' },
        { icon: <Award className="w-8 h-8" />, title: 'Certifications', desc: 'Industry-recognized certificates upon completion' },
        { icon: <Users className="w-8 h-8" />, title: 'Video Lessons', desc: 'Learn from expert instructors with high-quality content' },
        { icon: <Zap className="w-8 h-8" />, title: 'Train Your Brain', desc: 'Interactive exercises and quizzes to boost learning' },
        { icon: <Globe className="w-8 h-8" />, title: 'Master the Skills', desc: 'Practical skills that matter in the real world' },
        { icon: <CheckCircle className="w-8 h-8" />, title: 'Graduate the Best', desc: 'Join our network of successful graduates' }
    ];

    const events = [
        { date: '12', month: 'Jan', title: 'Carddle Results Conference', desc: 'Join us for the annual results conference' },
        { date: '15', month: 'Jan', title: 'Boost Your Networking Skills', desc: 'Learn networking from industry experts' },
        { date: '18', month: 'Jan', title: 'Campus Tour 2027', desc: 'Visit our campus and meet our team' }
    ];

    const scrollCategories = (direction) => {
        if (direction === 'left') {
            setCategoryScroll(Math.max(0, categoryScroll - 100));
        } else {
            setCategoryScroll(Math.min(courseCategories.length * 140 - 700, categoryScroll + 100));
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Top Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-2.5 px-4 shadow-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
                    <div className="flex space-x-4">
                        <a href="#" className="hover:text-teal-100 transition"><Facebook className="w-4 h-4" /></a>
                        <a href="#" className="hover:text-teal-100 transition"><Twitter className="w-4 h-4" /></a>
                        <a href="#" className="hover:text-teal-100 transition"><Instagram className="w-4 h-4" /></a>
                        <a href="#" className="hover:text-teal-100 transition"><Linkedin className="w-4 h-4" /></a>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 hover:text-teal-100 transition">
                            <Mail className="w-4 h-4" />
                            <span>info@sclinstitute.edu</span>
                        </div>
                        <div className="flex items-center space-x-2 hover:text-teal-100 transition">
                            <Phone className="w-4 h-4" />
                            <span>+44 201 234 5678</span>
                        </div>
                        <select className="bg-transparent border-b border-teal-300 focus:outline-none hover:text-teal-100 transition text-white cursor-pointer">
                            <option className="text-gray-900">Eng</option>
                            <option className="text-gray-900">Esp</option>
                            <option className="text-gray-900">Fra</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-gray-900">SCL</span>
                                <span className="text-xs uppercase tracking-wider text-teal-600 block font-semibold">Institute</span>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-1">
                            <a href="#" className="px-3 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded font-medium transition">Home</a>
                            <a href="#events" className="px-3 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded transition">Events</a>
                            <a href="#" className="px-3 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded transition">Pages</a>
                            <a href="#" className="px-3 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded transition">News</a>
                            <a href="#programs" className="px-3 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded transition">Courses</a>
                            <a href="#contact" className="px-3 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded transition">Contacts</a>
                            <button className="ml-4 p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 bg-cover bg-center overflow-hidden" style={{backgroundImage: 'url(/bg_header.jpg)'}}>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/40 to-teal-500/35"></div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-light text-white mb-5 leading-tight">
                            Choose From A Range Of <span className="font-semibold">Online Courses</span>
                        </h1>
                        
                        {/* Search Bar */}
                        <div className="flex max-w-2xl mx-auto bg-white rounded-full shadow-xl overflow-hidden mb-10 hover:shadow-2xl transition-shadow">
                            <input
                                type="text"
                                placeholder="Search for courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 px-6 py-3 outline-none text-base"
                            />
                            <button className="bg-green-500 text-white px-8 py-3 hover:bg-green-600 transition font-semibold">
                                SEARCH
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Welcome Section */}
            <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-light text-gray-900 mb-4">Welcome to <span className="font-bold text-teal-600">SCL Institute</span></h2>
                            <p className="text-gray-600 mb-4 text-base leading-relaxed">We provide high-quality online education to learners around the world. Our platform combines interactive learning with expert instruction to help you achieve your goals.</p>
                            <p className="text-gray-600 mb-8 text-base leading-relaxed">Start your learning journey today and unlock new opportunities for career growth and personal development.</p>
                            <div className="mb-6">
                                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Director, SCL Institute</p>
                                <p className="text-xl font-semibold text-gray-900">Dr. Hassan Khan</p>
                            </div>
                            <button onClick={onApplyNow} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform">
                                Apply Now
                            </button>
                        </div>
                        <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl h-72 overflow-hidden shadow-lg">
                            <img src="/img_01.jpg" 
                                 alt="Students learning" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="group bg-white p-6 rounded-lg text-center hover:shadow-lg transition-all">
                                <div className="flex justify-center mb-3 text-green-500 group-hover:text-green-600 transition text-4xl">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="bg-cover bg-center py-12 relative" style={{backgroundImage: 'url(/parallax_01.jpg)'}}>
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl font-light text-white mb-2">Trusted by Over <span className="font-bold text-green-400">6000+</span> Students</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-sm">Our community continues to grow as more students discover the power of quality online education and achieve their learning goals.</p>
                </div>
            </section>

            {/* Courses Section */}
            <section id="programs" className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-light text-gray-900 mb-2">Our Popular <span className="font-bold text-green-500">Courses</span></h2>
                    <p className="text-gray-600 mb-8 max-w-3xl text-sm">Explore our comprehensive collection of courses designed to help you master new skills and advance your career.</p>

                    {/* Category Filter Buttons */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <button 
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                selectedCategory === null 
                                    ? 'bg-green-500 text-white shadow-md' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            All Courses
                        </button>
                        {courseCategories.map((cat, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                                    selectedCategory === cat.name 
                                        ? 'bg-green-500 text-white shadow-md' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {coursesLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="text-center">
                                <Loader className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
                                <p className="text-gray-600">Loading programs from Moodle...</p>
                            </div>
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredCourses.map((course, idx) => (
                                <div key={idx} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow">
                                    <div className="bg-gray-300 h-32 overflow-hidden">
                                        <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2">{course.name}</h3>
                                        <p className="text-xs text-gray-700 mb-2">by <span className="font-semibold">{course.teacher}</span></p>
                                        <div className="flex items-center mb-2">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3" fill="currentColor" />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500 ml-1">({course.students})</span>
                                        </div>
                                        <div className="text-xs text-gray-600 mb-2">
                                            <p>📚 {course.totalStudents} enrolled</p>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-green-600">${course.price.toFixed(2)}</span>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSelectedCourse(course);
                                                setShowModal(true);
                                            }}
                                            className="w-full bg-green-500 text-white py-1.5 rounded text-xs font-semibold hover:bg-green-600">
                                            Explore
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No courses found matching your search.</p>
                        </div>
                    )}

                    {filteredCourses.length > 0 && (
                        <div className="text-center mt-12">
                            <button className="bg-green-500 text-white px-8 py-3 rounded font-semibold hover:bg-green-600">
                                View All Courses
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* What Makes Us Different */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-gray-300 rounded-lg h-80 overflow-hidden">
                            <img src="/img_02.jpg" 
                                 alt="Difference" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-light text-gray-900 mb-8">What Makes Us <span className="font-bold text-green-500">Different?</span></h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Expert Curriculum</h3>
                                        <p className="text-gray-600 text-sm">Designed by industry professionals</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Career Support</h3>
                                        <p className="text-gray-600 text-sm">Job placement assistance included</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Hands-on Experience</h3>
                                        <p className="text-gray-600 text-sm">Real-world projects and case studies</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section id="events" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-light text-gray-900 mb-4">News & <span className="font-bold">Events</span></h2>
                    <p className="text-gray-600 mb-12">Join our community events and network with fellow learners</p>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gray-200 rounded-lg h-80 overflow-hidden">
                            <img src="/news_img_01.jpg" 
                                 alt="Event" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="space-y-6">
                            {events.map((event, idx) => (
                                <div key={idx} className="flex items-start border-l-4 border-green-500 pl-6">
                                    <div className="flex-shrink-0 text-center">
                                        <div className="text-2xl font-bold text-green-500">{event.date}</div>
                                        <div className="text-sm text-gray-500">{event.month}</div>
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                        <p className="text-gray-600 text-sm">{event.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                                <BookOpen className="w-6 h-6 text-green-500" />
                                <span>Smart<span className="text-green-500">+</span></span>
                            </h3>
                            <p className="text-gray-400 text-sm">Empowering learners worldwide with quality education.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Explore</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#programs" className="hover:text-white">Courses</a></li>
                                <li><a href="#" className="hover:text-white">Programs</a></li>
                                <li><a href="#events" className="hover:text-white">Events</a></li>
                                <li><a href="#" className="hover:text-white">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Admissions</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white">Apply Now</a></li>
                                <li><a href="#" className="hover:text-white">Requirements</a></li>
                                <li><a href="#" className="hover:text-white">FAQs</a></li>
                                <li><a href="#" className="hover:text-white">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Research</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white">Publications</a></li>
                                <li><a href="#" className="hover:text-white">Journals</a></li>
                                <li><a href="#" className="hover:text-white">Collaborations</a></li>
                                <li><a href="#" className="hover:text-white">Partners</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 flex items-center justify-between">
                        <p className="text-gray-400 text-sm">&copy; 2026 Smart Education. All rights reserved.</p>
                        <div className="flex space-x-4">
                            <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                            <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                            <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                            <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                        </div>
                    </div>
                </div>
            </footer>

            {/* Course Detail Modal */}
            {showModal && selectedCourse && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        {/* Modal Header with Image */}
                        <div className="relative h-80 bg-gradient-to-br from-teal-600 via-teal-500 to-green-600 overflow-hidden flex flex-col justify-end">
                            <div className="absolute inset-0 opacity-30">
                                <div className="w-full h-full" style={{backgroundImage: `url(${selectedCourse.image})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 bg-white hover:bg-gray-100 p-2.5 rounded-full transition shadow-lg z-10"
                            >
                                <X className="w-6 h-6 text-gray-900" />
                            </button>
                            
                            <div className="relative z-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-8 py-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-snug">{selectedCourse.name}</h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 shadow-lg"></div>
                                    <p className="text-white/90 text-sm font-medium">{selectedCourse.teacher}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                    <p className="text-gray-700 text-xs font-semibold uppercase tracking-wider mb-1">Price</p>
                                    <p className="text-2xl font-bold text-green-600">${selectedCourse.price.toFixed(2)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                    <p className="text-gray-700 text-xs font-semibold uppercase tracking-wider mb-1">Enrolled</p>
                                    <p className="text-2xl font-bold text-blue-600">{selectedCourse.totalStudents.toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                                    <p className="text-gray-700 text-xs font-semibold uppercase tracking-wider mb-1">Rating</p>
                                    <p className="text-2xl font-bold text-yellow-600">★ {selectedCourse.rating.toFixed(1)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                    <p className="text-gray-700 text-xs font-semibold uppercase tracking-wider mb-1">Category</p>
                                    <p className="text-sm font-bold text-purple-600">{selectedCourse.category}</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-8"></div>

                            {/* Description */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-teal-600" />
                                    About This Course
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-sm">{selectedCourse.description}</p>
                            </div>

                            {/* Course Content/Activities */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-teal-600" />
                                    Course Content ({selectedCourse.content?.length || 0} modules)
                                </h3>
                                <div className="space-y-2">
                                    {selectedCourse.content && selectedCourse.content.map((item, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                                            {/* Module Header */}
                                            <button 
                                                onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                                                className="w-full flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-teal-50 hover:to-teal-100 transition cursor-pointer border-b border-gray-200 hover:border-teal-300"
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                                                <span className="text-gray-800 font-medium text-sm flex-1 text-left">{item.title}</span>
                                                <div className={`flex-shrink-0 transition-transform ${expandedModule === idx ? 'rotate-90' : ''}`}>
                                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                                </div>
                                            </button>
                                            
                                            {/* Activities Section - Collapsible */}
                                            {expandedModule === idx && (
                                                <div className="bg-white p-4 space-y-2">
                                                    {item.activities && item.activities.map((activity, actIdx) => (
                                                        <div key={actIdx} className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-green-50 rounded hover:from-teal-100 hover:to-green-100 transition cursor-pointer border border-teal-200">
                                                            <div className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0"></div>
                                                            <span className="text-gray-700 text-sm">{activity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 p-6 flex gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold transition"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition"
                            >
                                Enroll Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
