import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    GraduationCap, 
    BookOpen, 
    Users, 
    Award, 
    ChevronRight,
    Star,
    MapPin,
    Phone,
    Mail,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Calendar,
    Clock,
    ArrowRight,
    CheckCircle,
    Globe,
    Target,
    Heart,
    Palette,
    Loader
} from 'lucide-react';

const themes = {
    modern: {
        name: 'Modern Blue',
        primary: 'blue-600',
        secondary: 'blue-700', 
        accent: 'yellow-500',
        gradient: 'from-blue-600 to-blue-800',
        bgPattern: 'bg-gradient-to-br from-blue-50 to-white'
    },
    elegant: {
        name: 'Elegant Purple',
        primary: 'purple-600',
        secondary: 'purple-800',
        accent: 'yellow-400',
        gradient: 'from-purple-600 to-purple-900',
        bgPattern: 'bg-gradient-to-br from-purple-50 to-white'
    },
    green: {
        name: 'Nature Green',
        primary: 'emerald-600',
        secondary: 'emerald-800',
        accent: 'orange-500',
        gradient: 'from-emerald-600 to-teal-700',
        bgPattern: 'bg-gradient-to-br from-emerald-50 to-white'
    },
    corporate: {
        name: 'Corporate Dark',
        primary: 'slate-700',
        secondary: 'slate-900',
        accent: 'blue-500',
        gradient: 'from-slate-700 to-slate-900',
        bgPattern: 'bg-gradient-to-br from-slate-100 to-white'
    },
    warm: {
        name: 'Warm Orange',
        primary: 'orange-600',
        secondary: 'red-700',
        accent: 'yellow-400',
        gradient: 'from-orange-600 to-red-600',
        bgPattern: 'bg-gradient-to-br from-orange-50 to-white'
    }
};

const Home = ({ selectedTheme = 'modern', onApplyNow, onChangeTheme }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showThemePanel, setShowThemePanel] = useState(false);
    const [selectedDesignTheme, setSelectedDesignTheme] = useState('light');
    const [moodleCourses, setMoodleCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);

    const theme = themes[selectedTheme];

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
                    
                    // Map Moodle courses to display format
                    const formattedCourses = courseData.slice(0, 8).map((course, idx) => {
                        const formatted = {
                            id: course.id,
                            name: course.name || course.fullname || `Course ${idx + 1}`,
                            code: course.code || course.shortname || `CODE${idx + 1}`,
                            description: course.description || 'Professional program designed for career advancement',
                            icon: '📚'
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

    // Use Moodle courses ONLY - no defaults
    const programs = moodleCourses.length > 0 ? moodleCourses : [
        // Test with Moodle data if fetch hasn't completed yet
        {
            id: 17,
            name: 'ACCA (Fundamentals)',
            code: 'ACCA (Fundamentals)',
            description: 'Professional program designed for career advancement',
            icon: '📚'
        },
        {
            id: 15,
            name: 'Advanced Excel for Business (CPD)',
            code: 'Advanced Excel for Business (CPD)',
            description: 'Professional program designed for career advancement',
            icon: '📚'
        },
        {
            id: 6,
            name: 'B.Eng Mechanical Engineering',
            code: 'B.Eng Mechanical Engineering',
            description: 'Professional program designed for career advancement',
            icon: '📚'
        },
        {
            id: 5,
            name: 'B.Sc Computer Science',
            code: 'B.Sc Computer Science',
            description: 'Understand core principles and theories',
            icon: '📚'
        },
        {
            id: 20,
            name: 'B.Tech Computer Science Engineering',
            code: 'BTECH-CSE',
            description: 'B.Tech Computer Science Engineering Programme',
            icon: '📚'
        },
        {
            id: 7,
            name: 'BA Business Administration',
            code: 'BA Business Administration',
            description: 'Professional program designed for career advancement',
            icon: '📚'
        },
        {
            id: 19,
            name: 'Cisco CCNA Prep',
            code: 'Cisco CCNA Prep',
            description: 'Professional program designed for career advancement',
            icon: '📚'
        },
        {
            id: 14,
            name: 'Cybersecurity Essentials (CPD)',
            code: 'Cybersecurity Essentials (CPD)',
            description: 'Professional program designed for career advancement',
            icon: '📚'
        }
    ];

    // Debug: Log which programs are being used on EVERY RENDER
    useEffect(() => {
        console.log('🎨 [RENDER] Current state:', {
            moodleCoursesLength: moodleCourses.length,
            coursesLoading,
            usingMoodle: moodleCourses.length > 0,
            programsCount: programs.length,
            firstProgram: programs[0]?.name,
            allCourseNames: moodleCourses.map(c => c.name)
        });
    }, [moodleCourses, coursesLoading]);

    const designThemes = {
        light: {
            name: 'Light',
            bg: 'bg-white',
            navBg: 'bg-white',
            textPrimary: 'text-gray-900',
            textSecondary: 'text-gray-600',
            cardBg: 'bg-white',
            cardBorder: 'border-gray-200',
            shadowClass: 'shadow-lg'
        },
        dark: {
            name: 'Dark',
            bg: 'bg-gray-900',
            navBg: 'bg-gray-800',
            textPrimary: 'text-white',
            textSecondary: 'text-gray-300',
            cardBg: 'bg-gray-800',
            cardBorder: 'border-gray-700',
            shadowClass: 'shadow-2xl'
        },
        minimal: {
            name: 'Minimal',
            bg: 'bg-gray-50',
            navBg: 'bg-white',
            textPrimary: 'text-gray-900',
            textSecondary: 'text-gray-500',
            cardBg: 'bg-white',
            cardBorder: 'border-gray-100',
            shadowClass: 'shadow'
        },
        modern: {
            name: 'Modern',
            bg: 'bg-gradient-to-br from-gray-50 to-blue-50',
            navBg: 'bg-white/95 backdrop-blur-md',
            textPrimary: 'text-gray-900',
            textSecondary: 'text-gray-600',
            cardBg: 'bg-white/80 backdrop-blur-sm',
            cardBorder: 'border-gray-200/50',
            shadowClass: 'shadow-xl'
        },
        classic: {
            name: 'Classic',
            bg: 'bg-gray-100',
            navBg: 'bg-gradient-to-r from-gray-800 to-gray-900',
            textPrimary: 'text-gray-900',
            textSecondary: 'text-gray-600',
            cardBg: 'bg-white',
            cardBorder: 'border-gray-300',
            shadowClass: 'shadow'
        }
    };

    const currentDesignTheme = designThemes[selectedDesignTheme];

    const slides = [
        {
            title: "Excellence in Higher Education",
            subtitle: "Empowering minds, building futures",
            description: "Join SCL Institute and embark on a transformative journey of academic excellence and personal growth.",
            image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        },
        {
            title: "World-Class Faculty",
            subtitle: "Learn from industry experts",
            description: "Our distinguished faculty combines academic excellence with real-world experience to provide unparalleled education.",
            image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        },
        {
            title: "Innovation & Technology",
            subtitle: "Future-ready education",
            description: "Experience cutting-edge technology and innovative teaching methods that prepare you for tomorrow's challenges.",
            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        }
    ];

    const testimonials = [
        {
            name: "Rahul Kumar",
            program: "B.Tech Computer Science",
            text: "SCL Institute provided me with excellent education and amazing career opportunities. The faculty is top-notch!",
            rating: 5
        },
        {
            name: "Priya Sharma",
            program: "BBA",
            text: "The practical approach to learning here helped me develop real-world business skills that are invaluable.",
            rating: 5
        },
        {
            name: "Anjali Singh",
            program: "M.Sc Data Science", 
            text: "Outstanding program with excellent placement support. Highly recommend SCL Institute.",
            rating: 5
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Back to 5 seconds
        return () => clearInterval(timer);
    }, [slides.length]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Theme Selector Button */}
            <div className={`fixed top-1/2 right-0 transform -translate-y-1/2 z-[60] transition-transform duration-300 ${
                showThemePanel ? '-translate-x-64' : 'translate-x-0'
            }`}>
                <button
                    onClick={() => setShowThemePanel(!showThemePanel)}
                    className={`bg-white rounded-l-lg shadow-lg px-2 py-4 hover:shadow-xl transition-all duration-300 group border border-r-0 border-gray-200 hover:border-gray-300 ${
                        showThemePanel ? 'bg-gray-50 border-gray-300' : ''
                    }`}
                    title="Change Theme"
                >
                    <Palette className={`h-5 w-5 transition-colors ${
                        showThemePanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
                    }`} />
                    <div className="absolute top-1/2 right-full transform -translate-y-1/2 mr-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg">
                        {theme.name}
                        <div className="absolute top-1/2 right-0 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                </button>
            </div>

            {/* Theme Panel */}
            <div className={`fixed top-20 right-0 w-64 bg-white shadow-2xl rounded-l-lg transform transition-transform duration-300 z-50 border-l border-t border-b border-gray-200 overflow-hidden ${
                showThemePanel ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="h-screen overflow-y-auto flex flex-col">
                    {/* Panel Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex-shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <Palette className="h-5 w-5" />
                                <h3 className="text-lg font-semibold">Themes</h3>
                            </div>
                            <button
                                onClick={() => setShowThemePanel(false)}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Color Theme Selection */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Color Scheme</p>
                        <div className="space-y-2">
                            {Object.entries(themes).map(([key, themeData]) => (
                                <button
                                    key={key}
                                    onClick={() => onChangeTheme(key)}
                                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left flex items-center space-x-3 ${
                                        selectedTheme === key
                                            ? 'border-blue-400 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {/* Color Preview */}
                                    <div className="flex space-x-1">
                                        <div className={`w-4 h-4 rounded-full bg-${themeData.primary} border border-white shadow-sm`}></div>
                                        <div className={`w-4 h-4 rounded-full bg-${themeData.secondary} border border-white shadow-sm`}></div>
                                        <div className={`w-4 h-4 rounded-full bg-${themeData.accent} border border-white shadow-sm`}></div>
                                    </div>
                                    
                                    {/* Theme Name */}
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-900 text-sm">{themeData.name}</span>
                                    </div>
                                    
                                    {/* Selected Indicator */}
                                    {selectedTheme === key && (
                                        <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {showThemePanel && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowThemePanel(false)}
                ></div>
            )}

            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-3 sm:py-4'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className={`p-2 rounded-xl ${isScrolled ? `bg-${theme.primary}` : 'bg-white/20 backdrop-blur-md border border-white/30'}`}>
                                <GraduationCap className={`h-6 w-6 sm:h-8 sm:w-8 ${isScrolled ? 'text-white' : 'text-white'}`} />
                            </div>
                            <div>
                                <h1 className={`text-xl sm:text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                                    SCL Institute
                                </h1>
                                <p className={`text-xs sm:text-sm ${isScrolled ? 'text-gray-600' : 'text-white/90'} hidden sm:block`}>
                                    Excellence in Education
                                </p>
                            </div>
                        </div>
                        
                        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                            <a href="#home" className={`font-medium transition-colors ${
                                isScrolled ? 'text-gray-700 hover:text-' + theme.primary : 'text-white hover:text-' + theme.accent
                            }`}>Home</a>
                            <a href="#programs" className={`font-medium transition-colors ${
                                isScrolled ? 'text-gray-700 hover:text-' + theme.primary : 'text-white hover:text-' + theme.accent
                            }`}>Programs</a>
                            <a href="#about" className={`font-medium transition-colors ${
                                isScrolled ? 'text-gray-700 hover:text-' + theme.primary : 'text-white hover:text-' + theme.accent
                            }`}>About</a>
                            <a href="#contact" className={`font-medium transition-colors ${
                                isScrolled ? 'text-gray-700 hover:text-' + theme.primary : 'text-white hover:text-' + theme.accent
                            }`}>Contact</a>
                            <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className={`font-semibold underline transition-colors ${
                                isScrolled ? 'text-blue-700 hover:text-blue-900' : 'text-yellow-300 hover:text-yellow-200'
                            }`}>SCL System</a>
                            <button 
                                onClick={onApplyNow}
                                className={`bg-${theme.accent} text-white px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold hover:bg-${theme.secondary} transition-colors`}
                            >
                                Apply Now
                            </button>
                        </div>
                        
                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button className="text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section with Carousel */}
            <section className="relative h-screen overflow-hidden">
                <div className="absolute inset-0">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                            style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${slide.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        >
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 drop-shadow-lg leading-tight">
                                        {slide.title}
                                    </h1>
                                    <p className={`text-lg sm:text-xl md:text-2xl text-${theme.accent} font-semibold mb-3 sm:mb-4 drop-shadow-md`}>
                                        {slide.subtitle}
                                    </p>
                                    <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
                                        {slide.description}
                                    </p>
                                    <button 
                                        onClick={onApplyNow}
                                        className={`bg-${theme.primary} text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-${theme.secondary} transform hover:scale-105 transition-all duration-300 shadow-2xl`}
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Navigation Arrows */}
                <button 
                    onClick={() => setCurrentSlide((prev) => prev === 0 ? slides.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-3 transition-all group z-20 opacity-80 hover:opacity-100"
                >
                    <ChevronRight className="h-6 w-6 text-white rotate-180 group-hover:scale-110 transition-transform drop-shadow-lg" />
                </button>
                <button 
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-3 transition-all group z-20 opacity-80 hover:opacity-100"
                >
                    <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform drop-shadow-lg" />
                </button>
                
                {/* Carousel Dots */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                    <div className="bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                        {currentSlide + 1} / {slides.length}
                    </div>
                    <div className="flex space-x-3">
                        {slides.map((slide, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-4 h-4 rounded-full transition-all duration-300 border-2 border-white/50 ${
                                    index === currentSlide 
                                        ? `bg-${theme.accent} scale-125 border-white` 
                                        : 'bg-white/30 hover:bg-white/75 hover:scale-110'
                                }`}
                                title={slide.title}
                            />
                        ))}
                    </div>
                </div>

                {/* Scroll Down Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <ChevronRight className="h-6 w-6 text-white rotate-90" />
                </div>
            </section>

            {/* Programs Section */}
            <section id="programs" className={`py-16 ${theme.bgPattern}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className={`text-3xl sm:text-4xl font-bold text-${theme.primary} mb-3`}>
                            Our Programs
                        </h2>
                        <p className={`text-base sm:text-lg text-${theme.secondary} max-w-2xl mx-auto`}>
                            Discover a wide range of programs designed for your success
                        </p>
                    </div>
                    
                    {coursesLoading && programs.length === 0 ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : programs.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {programs.map((program, index) => (
                                <div key={`program-${index}`} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border-l-4 border-l-blue-600 group cursor-pointer">
                                    <div className="text-3xl mb-3">{program.icon || '📚'}</div>
                                    <h3 className="text-base font-semibold text-blue-600 mb-2 line-clamp-2 group-hover:text-blue-700">
                                        {program.name}
                                    </h3>
                                    {program.code && (
                                        <p className="text-xs text-blue-700 font-medium mb-3 uppercase tracking-wide">
                                            {program.code}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.description}</p>
                                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1 group-hover:gap-2">
                                        Learn More <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-blue-50 rounded-lg p-12 text-center">
                            <p className="text-gray-700 mb-2">No programs available yet.</p>
                            <p className="text-sm text-gray-500">Programs: {programs.length} | Loading: {coursesLoading ? 'yes' : 'no'} | Courses: {moodleCourses.length}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-${theme.primary} mb-4 sm:mb-6`}>
                            Why Choose SCL Institute?
                        </h2>
                        <p className={`text-lg sm:text-xl text-${theme.secondary} max-w-3xl mx-auto px-4`}>
                            We provide world-class education with a focus on practical learning and career development
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center group">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Award className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-4`}>Excellence in Education</h3>
                            <p className="text-gray-600">Recognized for our high-quality education and innovative teaching methods.</p>
                        </div>

                        <div className="text-center group">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-4`}>Expert Faculty</h3>
                            <p className="text-gray-600">Learn from industry professionals and experienced academicians.</p>
                        </div>

                        <div className="text-center group">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Target className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-4`}>100% Placement</h3>
                            <p className="text-gray-600">Strong industry connections ensure excellent placement opportunities.</p>
                        </div>

                        <div className="text-center group">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Globe className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-4`}>Global Recognition</h3>
                            <p className="text-gray-600">Our degrees are recognized worldwide and valued by employers.</p>
                        </div>

                        <div className="text-center group">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-4`}>Modern Curriculum</h3>
                            <p className="text-gray-600">Updated courses that match current industry requirements and trends.</p>
                        </div>

                        <div className="text-center group">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Heart className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-4`}>Student Support</h3>
                            <p className="text-gray-600">Comprehensive support system for academic and personal development.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className={`py-20 ${theme.bgPattern}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl md:text-5xl font-bold text-${theme.primary} mb-6`}>
                            What Our Students Say
                        </h2>
                        <p className={`text-xl text-${theme.secondary} max-w-3xl mx-auto`}>
                            Hear from our successful graduates about their transformative experience at SCL Institute
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className={`h-5 w-5 text-${theme.accent} fill-current`} />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                                <div>
                                    <h4 className={`font-bold text-${theme.primary}`}>{testimonial.name}</h4>
                                    <p className={`text-${theme.secondary} text-sm`}>{testimonial.program}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl md:text-5xl font-bold text-${theme.primary} mb-6`}>
                            Get In Touch
                        </h2>
                        <p className={`text-xl text-${theme.secondary} max-w-3xl mx-auto`}>
                            Ready to start your educational journey? Contact us today for more information
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center group">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <MapPin className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-4`}>Visit Us</h3>
                            <p className="text-gray-600">SCL Institute Campus<br />123 Education Street<br />New Delhi, India</p>
                        </div>

                        <div className="text-center group">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Phone className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-4`}>Call Us</h3>
                            <p className="text-gray-600">+91 98765 43210<br />+91 87654 32109<br />Monday - Friday, 9AM - 6PM</p>
                        </div>

                        <div className="text-center group">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Mail className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-4`}>Email Us</h3>
                            <p className="text-gray-600">info@sclinstitute.edu<br />admissions@sclinstitute.edu<br />support@sclinstitute.edu</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`bg-${theme.secondary} text-white py-12`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-6">
                                <GraduationCap className="h-8 w-8 text-white" />
                                <span className="text-2xl font-bold">SCL Institute</span>
                            </div>
                            <p className="text-white/80 mb-4">
                                Excellence in education since 1995. Empowering students to achieve their dreams.
                            </p>
                            <div className="flex space-x-4">
                                <Facebook className={`h-6 w-6 text-white/60 hover:text-${theme.accent} cursor-pointer transition-colors`} />
                                <Twitter className={`h-6 w-6 text-white/60 hover:text-${theme.accent} cursor-pointer transition-colors`} />
                                <Instagram className={`h-6 w-6 text-white/60 hover:text-${theme.accent} cursor-pointer transition-colors`} />
                                <Linkedin className={`h-6 w-6 text-white/60 hover:text-${theme.accent} cursor-pointer transition-colors`} />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-white/80">
                                <li><a href="#" className={`hover:text-${theme.accent} transition-colors`}>About Us</a></li>
                                <li><a href="#" className={`hover:text-${theme.accent} transition-colors`}>Programs</a></li>
                                <li><a href="#" className={`hover:text-${theme.accent} transition-colors`}>Admissions</a></li>
                                <li><a href="#" className={`hover:text-${theme.accent} transition-colors`}>Student Life</a></li>
                                <li><a href="#" className={`hover:text-${theme.accent} transition-colors`}>Alumni</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2 text-white/80">
                                <li><a href="#" className={`hover:text-${theme.accent} transition-colors`}>Academic Calendar</a></li>
                                <li><a href="#" className={`hover:text-${theme.accent} transition-colors`}>Library</a></li>
                                <li><a href="#" className={`hover:text-${theme.accent} transition-colors`}>Research</a></li>
                                <li><a href="#" className={`hover:text-${theme.accent} transition-colors`}>Career Services</a></li>
                                <li><a href="#" className={`hover:text-${theme.accent} transition-colors`}>Online Learning</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                            <div className="space-y-3 text-white/80">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5 mt-0.5" />
                                    <span>123 Education Street, New Delhi, India</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone className="h-5 w-5" />
                                    <span>+91 98765 43210</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5" />
                                    <span>info@sclinstitute.edu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/20 mt-8 pt-8 text-center">
                        <p className="text-white/60">
                            © 2024 SCL Institute. All rights reserved. | Privacy Policy | Terms of Service
                        </p>
                    </div>
                </div>
            </footer>

            <section className={`py-20 ${theme.bgPattern}`}>
                <div className="text-center">
                    <h3 className={`text-2xl font-bold text-${theme.primary} mb-4`}>Get Started Today</h3>
                    <p className={`text-${theme.secondary} mb-6`}>
                        Take the first step towards your educational journey with SCL Institute
                    </p>
                    <button
                        onClick={onApplyNow}
                        className={`bg-${theme.primary} text-white px-8 py-3 rounded-lg font-semibold hover:bg-${theme.secondary} transition-colors duration-300 shadow-lg inline-flex items-center gap-2`}
                    >
                        Apply Now
                        <ArrowRight size={20} />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;