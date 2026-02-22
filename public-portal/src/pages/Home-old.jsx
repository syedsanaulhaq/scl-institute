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
    Calendar
} from 'lucide-react';

const Home = ({ onApplyNow }) => {
    const [moodleCourses, setMoodleCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryScroll, setCategoryScroll] = useState(0);

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
                    const formattedCourses = courseData.map((course, idx) => {
                        const courseImages = ['/product_img-01.jpg', '/product_img-02.jpg', '/product_img-03.jpg', '/product_img-04.jpg', '/product_img-05.jpg', '/product_img-06.jpg', '/product_img-07.jpg', '/product_img-08.jpg'];
                        const formatted = {
                            id: course.id,
                            name: course.name || course.fullname || `Course ${idx + 1}`,
                            code: course.code || course.shortname || `CODE${idx + 1}`,
                            description: course.description || 'Professional program designed for career advancement',
                            icon: '📚',
                            rating: 4.5 + (Math.random() * 0.5),
                            students: Math.floor(Math.random() * 1000) + 100,
                            image: courseImages[idx % courseImages.length]
                        };
                        console.log(`  [${idx}]`, formatted.name);
                        return formatted;
                    });
                    
                    console.log('✅ [FETCH] Formatted', formattedCourses.length, 'courses, setting state...');
                    setMoodleCourses(formattedCourses);
                    console.log('✓ [FETCH] State updated with', formattedCourses.length, 'courses');
                } else {
                    console.warn('⚠️ [FETCH] No valid course array found:', courseData);
                    setMoodleCourses([]);
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

    const filteredCourses = moodleCourses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const courseCategories = [
        { name: 'Web Development', icon: '🌐', count: 12 },
        { name: 'Data Science', icon: '📊', count: 8 },
        { name: 'UI/UX Design', icon: '🎨', count: 6 },
        { name: 'Business', icon: '💼', count: 10 },
        { name: 'Cloud Computing', icon: '☁️', count: 7 }
    ];

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="w-8 h-8 text-green-500" />
                            <span className="text-xl font-bold text-gray-900">Smart<span className="text-green-500">+</span></span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#programs" className="text-gray-600 hover:text-gray-900">Explore</a>
                            <a href="#features" className="text-gray-600 hover:text-gray-900">Programs</a>
                            <a href="#events" className="text-gray-600 hover:text-gray-900">Events</a>
                            <a href="#contact" className="text-gray-600 hover:text-gray-900">Contacts</a>
                        </div>
                        <button 
                            onClick={onApplyNow}
                            className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-green-600"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-500 to-blue-600 py-16 bg-cover bg-center relative" style={{backgroundImage: 'url(/bg_header.jpg)'}}>
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Choose From A Range Of <span className="text-green-300">Online Courses</span>
                        </h1>
                        <p className="text-blue-100 text-lg mb-8">Discover world-class education at your fingertips</p>
                        
                        {/* Search Bar */}
                        <div className="flex max-w-2xl mx-auto bg-white rounded-full shadow-lg overflow-hidden">
                            <input
                                type="text"
                                placeholder="Search for courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 px-6 py-3 outline-none"
                            />
                            <button className="bg-green-500 text-white px-8 py-3 hover:bg-green-600">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Course Categories */}
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
                        {courseCategories.map((cat, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="text-4xl mb-2">{cat.icon}</div>
                                <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{cat.count} courses</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Welcome Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Smart Education</h2>
                            <p className="text-gray-600 mb-4">We provide high-quality online education to learners around the world. Our platform combines interactive learning with expert instruction to help you achieve your goals.</p>
                            <p className="text-gray-600 mb-8">Start your learning journey today and unlock new opportunities for career growth and personal development.</p>
                            <button onClick={onApplyNow} className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600">
                                Get Started
                            </button>
                        </div>
                        <div className="bg-gray-200 rounded-lg h-80 overflow-hidden">
                            <img src="/img_01.jpg" 
                                 alt="Students learning" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Choose Smart Education?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
                                <div className="flex justify-center mb-4 text-green-500">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">Trusted by Over <span className="text-green-300">6000+</span> Students</h2>
                    <p className="text-blue-100 max-w-2xl mx-auto">Our community continues to grow as more students discover the power of quality online education and achieve their learning goals.</p>
                </div>
            </section>

            {/* Courses Section */}
            <section id="programs" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Popular <span className="text-green-500">Courses</span></h2>
                    <p className="text-gray-600 mb-12 max-w-3xl">Explore our comprehensive collection of courses designed to help you master new skills and advance your career.</p>

                    {coursesLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="text-center">
                                <Loader className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
                                <p className="text-gray-600">Loading programs from Moodle...</p>
                            </div>
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredCourses.map((course, idx) => (
                                <div key={idx} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                                    <div className="bg-gray-300 h-40 overflow-hidden">
                                        <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{course.name}</h3>
                                        <div className="flex items-center mb-3">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4" fill="currentColor" />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500 ml-2">({course.students} students)</span>
                                        </div>
                                        <button className="w-full bg-green-500 text-white py-2 rounded text-sm font-semibold hover:bg-green-600">
                                            Explore Course
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
                            <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600">
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
                            <h2 className="text-4xl font-bold text-gray-900 mb-8">What Makes Us <span className="text-green-500">Different?</span></h2>
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
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Upcoming <span className="text-green-500">Events</span></h2>
                    <p className="text-gray-600 mb-12">Join our community events and network with fellow learners</p>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left side - Large featured event */}
                        <div className="bg-gray-200 rounded-lg h-80 overflow-hidden">
                            <img src="/news_img_01.jpg" 
                                 alt="Event" className="w-full h-full object-cover" />
                        </div>
                        
                        {/* Right side - Event list */}
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
                                <li><a href="#features" className="hover:text-white">Programs</a></li>
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
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4" />
                                    <span>+1 (555) 123-4567</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4" />
                                    <span>info@smart.edu</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>123 Education St, City</span>
                                </li>
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
        </div>
    );
};

export default Home;
