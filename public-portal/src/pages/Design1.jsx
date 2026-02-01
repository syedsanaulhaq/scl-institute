import { useState, useEffect } from 'react';
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
    ArrowRight,
    Target,
    Heart,
    Globe,
    Palette,
    CheckCircle
} from 'lucide-react';

const Design1 = ({ selectedTheme = 'modern', onApplyNow, onChangeTheme }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showThemePanel, setShowThemePanel] = useState(false);

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

    const theme = themes[selectedTheme] || themes.modern;

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

    const programs = [
        {
            name: "Computer Science Engineering",
            duration: "4 Years",
            type: "B.Tech",
            description: "Advanced computing, AI, and software development",
            icon: "💻"
        },
        {
            name: "Business Administration",
            duration: "3 Years",
            type: "BBA",
            description: "Leadership, management, and entrepreneurship",
            icon: "📊"
        },
        {
            name: "Data Science",
            duration: "2 Years",
            type: "M.Sc",
            description: "Analytics, machine learning, and big data",
            icon: "📈"
        },
        {
            name: "Digital Marketing",
            duration: "1 Year",
            type: "Diploma",
            description: "SEO, social media, and online strategies",
            icon: "📱"
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
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Theme Selector */}
            <div className={`fixed top-2/3 right-0 transform -translate-y-1/2 z-30 transition-transform duration-300 ${
                showThemePanel ? '-translate-x-64' : 'translate-x-0'
            }`}>
                <button
                    onClick={() => setShowThemePanel(!showThemePanel)}
                    className={`bg-white rounded-l-lg shadow-lg px-2 py-4 hover:shadow-xl transition-all duration-300 group border border-r-0 border-gray-100 hover:border-blue-200 ${
                        showThemePanel ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    title="Change Theme"
                >
                    <Palette className={`h-5 w-5 transition-colors ${
                        showThemePanel ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
                    }`} />
                </button>
            </div>

            {/* Theme Panel */}
            <div className={`fixed top-20 right-0 w-64 bg-white shadow-2xl rounded-l-lg transform transition-transform duration-300 z-30 border-l border-t border-b border-gray-200 overflow-hidden ${
                showThemePanel ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="h-screen overflow-y-auto flex flex-col">
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
                                    <div className="flex space-x-1">
                                        <div className={`w-4 h-4 rounded-full bg-${themeData.primary} border border-white shadow-sm`}></div>
                                        <div className={`w-4 h-4 rounded-full bg-${themeData.secondary} border border-white shadow-sm`}></div>
                                        <div className={`w-4 h-4 rounded-full bg-${themeData.accent} border border-white shadow-sm`}></div>
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-900 text-sm">{themeData.name}</span>
                                    </div>
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
                    className="fixed inset-0 bg-black/50 z-20"
                    onClick={() => setShowThemePanel(false)}
                ></div>
            )}

            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'
            }`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${isScrolled ? `bg-${theme.primary}` : 'bg-white/20'}`}>
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                                    SCL Institute
                                </h1>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#home" className={`font-medium ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Home</a>
                            <a href="#programs" className={`font-medium ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Programs</a>
                            <a href="#about" className={`font-medium ${isScrolled ? 'text-gray-700' : 'text-white'}`}>About</a>
                            <a
                                href="http://localhost:3000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`font-medium ${isScrolled ? 'text-blue-700' : 'text-yellow-300'} hover:underline`}
                            >
                                SCL System
                            </a>
                            <button onClick={onApplyNow} className={`bg-${theme.accent} text-white px-6 py-2 rounded-full font-semibold`}>
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Carousel */}
            <section className="relative h-screen overflow-hidden group">
                <div className="absolute inset-0">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-white max-w-4xl mx-auto px-6">
                                    <h1 className="text-6xl font-bold mb-6">{slide.title}</h1>
                                    <p className={`text-2xl text-${theme.accent} font-semibold mb-4`}>{slide.subtitle}</p>
                                    <p className="text-xl mb-8">{slide.description}</p>
                                    <button onClick={onApplyNow} className={`bg-${theme.primary} text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-lg`}>
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button 
                    onClick={() => setCurrentSlide((prev) => prev === 0 ? slides.length - 1 : prev - 1)}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <ChevronRight className="h-6 w-6 text-white rotate-180" />
                </button>
                <button 
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </button>
                
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-4 h-4 rounded-full transition-all border-2 border-white/50 ${
                                index === currentSlide ? `bg-${theme.accent} scale-125 border-white` : 'bg-white/30'
                            }`}
                        />
                    ))}
                </div>
            </section>

            {/* Programs */}
            <section id="programs" className={`py-20 ${theme.bgPattern}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className={`text-5xl font-bold text-${theme.primary} mb-4`}>Our Programs</h2>
                        <p className={`text-lg text-${theme.secondary}`}>Discover world-class programs designed for success</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {programs.map((prog, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
                                <div className="text-4xl mb-4">{prog.icon}</div>
                                <h3 className={`text-xl font-bold text-${theme.primary} mb-2`}>{prog.name}</h3>
                                <div className="flex gap-2 mb-4">
                                    <span className={`bg-${theme.accent} text-white px-3 py-1 rounded-full text-sm`}>{prog.type}</span>
                                    <span className={`text-${theme.secondary}`}>{prog.duration}</span>
                                </div>
                                <p className="text-gray-600 mb-4">{prog.description}</p>
                                <button className={`text-${theme.primary} font-semibold flex items-center gap-2 hover:gap-4`}>
                                    Learn More <ArrowRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section id="about" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className={`text-5xl font-bold text-${theme.primary} mb-4`}>Why Choose SCL Institute?</h2>
                        <p className={`text-lg text-${theme.secondary}`}>World-class education with practical learning</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Award, title: "Excellence", desc: "Recognized for quality education and innovation" },
                            { icon: Users, title: "Expert Faculty", desc: "Learn from industry professionals" },
                            { icon: Target, title: "100% Placement", desc: "Strong industry connections" },
                            { icon: Globe, title: "Global Recognition", desc: "Degrees valued worldwide" },
                            { icon: BookOpen, title: "Modern Curriculum", desc: "Updated courses matching industry needs" },
                            { icon: Heart, title: "Student Support", desc: "Comprehensive support system" }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center group">
                                <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <item.icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className={`text-xl font-bold text-${theme.primary} mb-3`}>{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className={`py-20 ${theme.bgPattern}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className={`text-5xl font-bold text-${theme.primary} mb-4`}>Student Success Stories</h2>
                        <p className={`text-lg text-${theme.secondary}`}>Hear from our successful graduates</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((test, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(test.rating)].map((_, i) => (
                                        <Star key={i} className={`h-5 w-5 text-${theme.accent} fill-current`} />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">"{test.text}"</p>
                                <div>
                                    <h4 className={`font-bold text-${theme.primary}`}>{test.name}</h4>
                                    <p className={`text-${theme.secondary} text-sm`}>{test.program}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className={`text-5xl font-bold text-${theme.primary} mb-4`}>Get In Touch</h2>
                        <p className={`text-lg text-${theme.secondary}`}>Contact us for more information</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center`}>
                                <MapPin className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-2`}>Visit Us</h3>
                            <p className="text-gray-600">123 Education Street, New Delhi, India</p>
                        </div>
                        <div className="text-center">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center`}>
                                <Phone className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-2`}>Call Us</h3>
                            <p className="text-gray-600">+91 98765 43210</p>
                        </div>
                        <div className="text-center">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center`}>
                                <Mail className="h-8 w-8 text-white" />
                            </div>
                            <h3 className={`text-xl font-bold text-${theme.primary} mb-2`}>Email Us</h3>
                            <p className="text-gray-600">info@sclinstitute.edu</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`bg-${theme.secondary} text-white py-12`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <GraduationCap className="h-8 w-8" />
                                <span className="text-2xl font-bold">SCL Institute</span>
                            </div>
                            <p className="text-white/80">Excellence in education since 1995</p>
                            <div className="flex space-x-3 mt-4">
                                <Facebook className="h-6 w-6 cursor-pointer hover:opacity-80" />
                                <Twitter className="h-6 w-6 cursor-pointer hover:opacity-80" />
                                <Instagram className="h-6 w-6 cursor-pointer hover:opacity-80" />
                                <Linkedin className="h-6 w-6 cursor-pointer hover:opacity-80" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-white/80">
                                <li><a href="#" className="hover:text-white">About</a></li>
                                <li><a href="#" className="hover:text-white">Programs</a></li>
                                <li><a href="#" className="hover:text-white">Admissions</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Resources</h3>
                            <ul className="space-y-2 text-white/80">
                                <li><a href="#" className="hover:text-white">Library</a></li>
                                <li><a href="#" className="hover:text-white">Career Services</a></li>
                                <li><a href="#" className="hover:text-white">Online Learning</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Contact</h3>
                            <p className="text-white/80 text-sm">123 Education Street</p>
                            <p className="text-white/80 text-sm">+91 98765 43210</p>
                            <p className="text-white/80 text-sm">info@sclinstitute.edu</p>
                        </div>
                    </div>
                    <div className="border-t border-white/20 pt-8 text-center text-white/60">
                        <p>© 2024 SCL Institute. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Design1;
