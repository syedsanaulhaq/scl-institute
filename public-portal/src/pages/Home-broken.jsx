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
    Calendar,
    Clock,
    ArrowRight,
    CheckCircle,
    Globe,
    Target,
    Heart,
    Palette
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

    const theme = themes[selectedTheme];

    const slides = [
        {
            title: "Excellence in Higher Education",
            subtitle: "Empowering minds, building futures",
            description: "Join SCL Institute and embark on a transformative journey of academic excellence and personal growth.",
            image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        },
        {
            title: "World-Class Faculty",
            subtitle: "Learn from industry experts",
            description: "Our distinguished faculty combines academic excellence with real-world experience to provide unparalleled education.",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        },
        {
            title: "Modern Campus & Facilities",
            subtitle: "State-of-the-art learning environment",
            description: "Experience education in our modern, well-equipped campus designed for optimal learning and growth.",
            image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        }
    ];

    const programs = [
        {
            name: "Computer Science Engineering",
            duration: "4 Years",
            type: "B.Tech",
            description: "Comprehensive program covering software development, AI, and emerging technologies."
        },
        {
            name: "Business Administration",
            duration: "2 Years",
            type: "MBA",
            description: "Strategic business education with focus on leadership and management skills."
        },
        {
            name: "Mechanical Engineering",
            duration: "4 Years", 
            type: "B.Tech",
            description: "Innovative engineering program with hands-on laboratory experience."
        },
        {
            name: "Data Science",
            duration: "2 Years",
            type: "M.Sc",
            description: "Advanced analytics and machine learning for data-driven decision making."
        }
    ];

    const stats = [
        { number: "15,000+", label: "Students", icon: Users },
        { number: "500+", label: "Faculty", icon: GraduationCap },
        { number: "50+", label: "Programs", icon: BookOpen },
        { number: "25+", label: "Years", icon: Award }
    ];

    const testimonials = [
        {
            name: "Priya Sharma",
            program: "MBA Graduate",
            text: "SCL Institute provided me with exceptional education and opportunities. The faculty's guidance was invaluable.",
            rating: 5
        },
        {
            name: "Rahul Patel",
            program: "B.Tech Computer Science",
            text: "The practical approach and modern curriculum prepared me perfectly for my career in technology.",
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
            {/* Theme Selector Button */}
            <button
                onClick={onChangeTheme}
                className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-shadow"
                title="Change Theme"
            >
                <Palette className="h-6 w-6 text-gray-600" />
            </button>

            {/* Navigation */}
            <nav className={`fixed w-full z-40 transition-all duration-300 ${
                isScrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'
            }`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${
                                isScrolled 
                                    ? `bg-${theme.primary}` 
                                    : 'bg-white/20 backdrop-blur-md border border-white/30'
                            }`}>
                                <GraduationCap className={`h-8 w-8 ${isScrolled ? 'text-white' : 'text-white'}`} />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                                    SCL Institute
                                </h1>
                                <p className={`text-sm ${isScrolled ? 'text-gray-600' : 'text-white/90'}`}>
                                    Excellence in Education
                                </p>
                            </div>
                        </div>
                        
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#home" className={`font-medium transition-colors ${
                                isScrolled ? `text-gray-700 hover:text-${theme.primary}` : `text-white hover:text-${theme.accent}`
                            }`}>Home</a>
                            <a href="#programs" className={`font-medium transition-colors ${
                                isScrolled ? `text-gray-700 hover:text-${theme.primary}` : `text-white hover:text-${theme.accent}`
                            }`}>Programs</a>
                            <a href="#about" className={`font-medium transition-colors ${
                                isScrolled ? `text-gray-700 hover:text-${theme.primary}` : `text-white hover:text-${theme.accent}`
                            }`}>About</a>
                            <a href="#contact" className={`font-medium transition-colors ${
                                isScrolled ? `text-gray-700 hover:text-${theme.primary}` : `text-white hover:text-${theme.accent}`
                            }`}>Contact</a>
                            <button 
                                onClick={onApplyNow}
                                className={`bg-${theme.accent} text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity`}
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50"></div>
                        </div>
                    ))}
                </div>
                
                <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
                        {slides[currentSlide].title}
                    </h1>
                    <h2 className={`text-2xl md:text-3xl mb-6 text-${theme.accent} font-serif`}>
                        {slides[currentSlide].subtitle}
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                        {slides[currentSlide].description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={onApplyNow}
                            className={`bg-${theme.accent} text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center`}
                        >
                            Apply Now - Free!
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                        <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300">
                            Virtual Tour
                        </button>
                    </div>
                </div>

                {/* Slide indicators */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentSlide ? `bg-${theme.accent} w-8` : 'bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className={`py-20 bg-gradient-to-r ${theme.gradient} text-white`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <stat.icon className={`h-12 w-12 mx-auto mb-4 text-${theme.accent}`} />
                                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                                <div className="text-lg opacity-90">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section id="programs" className={`py-20 ${theme.bgPattern}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Our Academic Programs
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover world-class programs designed to prepare you for success in your chosen field
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {programs.map((program, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`bg-${theme.primary} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                                        {program.type}
                                    </span>
                                    <span className="text-gray-500 text-sm flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {program.duration}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{program.name}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>
                                <button className={`w-full bg-${theme.primary} text-white py-3 rounded-lg font-semibold hover:bg-${theme.secondary} transition-colors flex items-center justify-center`}>
                                    Learn More
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                                Why Choose SCL Institute?
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className={`bg-${theme.primary} p-2 rounded-full`}>
                                        <CheckCircle className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Academic Excellence</h3>
                                        <p className="text-gray-600">Consistently ranked among top institutions with world-class curriculum and faculty.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className={`bg-${theme.primary} p-2 rounded-full`}>
                                        <Globe className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Global Recognition</h3>
                                        <p className="text-gray-600">Internationally accredited programs with global industry partnerships.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className={`bg-${theme.primary} p-2 rounded-full`}>
                                        <Target className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Career Success</h3>
                                        <p className="text-gray-600">95% placement rate with top companies and excellent career support.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Students studying"
                                className="rounded-2xl shadow-xl w-full"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t from-${theme.primary}/20 to-transparent rounded-2xl`}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className={`py-20 ${theme.bgPattern}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            What Our Students Say
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Hear from our successful graduates about their transformative experience at SCL Institute
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className={`h-5 w-5 text-${theme.accent} fill-current`} />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 leading-relaxed italic">
                                    "{testimonial.text}"
                                </p>
                                <div className="flex items-center">
                                    <div className={`w-12 h-12 bg-${theme.primary} rounded-full flex items-center justify-center`}>
                                        <span className="text-white font-bold">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-gray-600 text-sm">{testimonial.program}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Apply Now Section */}
            <section className={`py-20 bg-gradient-to-r ${theme.gradient} text-white`}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Take the first step towards your bright future. Apply now and join thousands of successful graduates.
                    </p>
                    <button 
                        onClick={onApplyNow}
                        className={`bg-${theme.accent} text-white px-12 py-4 rounded-full text-xl font-bold hover:opacity-90 transition-all duration-300 transform hover:scale-105`}
                    >
                        Apply Now - It's Free!
                    </button>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className={`py-20 ${theme.secondary === 'slate-900' ? 'bg-slate-800' : `bg-${theme.secondary}`} text-white`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Get in Touch
                        </h2>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Ready to start your journey with us? Contact our admissions team today
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-bold mb-8">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <MapPin className={`h-6 w-6 text-${theme.accent}`} />
                                    <div>
                                        <p className="font-semibold">Campus Address</p>
                                        <p className="opacity-90">123 Education Street, Knowledge City, State 12345</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Phone className={`h-6 w-6 text-${theme.accent}`} />
                                    <div>
                                        <p className="font-semibold">Phone</p>
                                        <p className="opacity-90">+91 123 456 7890</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Mail className={`h-6 w-6 text-${theme.accent}`} />
                                    <div>
                                        <p className="font-semibold">Email</p>
                                        <p className="opacity-90">admissions@sclinstitute.edu</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="text-lg font-bold mb-4">Follow Us</h4>
                                <div className="flex space-x-4">
                                    <a href="#" className={`bg-${theme.accent} p-3 rounded-full hover:opacity-80 transition-opacity`}>
                                        <Facebook className="h-5 w-5" />
                                    </a>
                                    <a href="#" className={`bg-${theme.accent} p-3 rounded-full hover:opacity-80 transition-opacity`}>
                                        <Twitter className="h-5 w-5" />
                                    </a>
                                    <a href="#" className={`bg-${theme.accent} p-3 rounded-full hover:opacity-80 transition-opacity`}>
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                    <a href="#" className={`bg-${theme.accent} p-3 rounded-full hover:opacity-80 transition-opacity`}>
                                        <Linkedin className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-gray-900">
                            <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">First Name</label>
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-${theme.primary} focus:ring-2 focus:ring-${theme.primary}/20 outline-none`}
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-${theme.primary} focus:ring-2 focus:ring-${theme.primary}/20 outline-none`}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email"
                                        className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-${theme.primary} focus:ring-2 focus:ring-${theme.primary}/20 outline-none`}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Subject</label>
                                    <input
                                        type="text"
                                        className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-${theme.primary} focus:ring-2 focus:ring-${theme.primary}/20 outline-none`}
                                        placeholder="Enter subject"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Message</label>
                                    <textarea
                                        rows="4"
                                        className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-${theme.primary} focus:ring-2 focus:ring-${theme.primary}/20 outline-none resize-none`}
                                        placeholder="Enter your message"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className={`w-full bg-${theme.primary} text-white py-3 rounded-lg font-semibold hover:bg-${theme.secondary} transition-colors`}
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className={`bg-${theme.primary} p-2 rounded-xl`}>
                                    <GraduationCap className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">SCL Institute</h3>
                                    <p className="text-gray-400 text-sm">Excellence in Education</p>
                                </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Empowering students with world-class education and preparing them for global success.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Programs</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Admissions</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Campus Life</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-bold mb-6">Student Services</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Library</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Career Services</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Student Portal</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-bold mb-6">Connect</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">News & Events</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Alumni</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Research</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2026 SCL Institute. All rights reserved. | Privacy Policy | Terms of Service
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);

    const slides = [
        {
            title: "Excellence in Higher Education",
            subtitle: "Empowering minds, building futures",
            description: "Join SCL Institute and embark on a transformative journey of academic excellence and personal growth.",
            image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        },
        {
            title: "World-Class Faculty",
            subtitle: "Learn from industry experts",
            description: "Our distinguished faculty combines academic excellence with real-world experience to provide unparalleled education.",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        },
        {
            title: "Modern Campus & Facilities",
            subtitle: "State-of-the-art learning environment",
            description: "Experience education in our modern, well-equipped campus designed for optimal learning and growth.",
            image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        }
    ];

    const programs = [
        {
            name: "Computer Science Engineering",
            duration: "4 Years",
            type: "B.Tech",
            description: "Comprehensive program covering software development, AI, and emerging technologies."
        },
        {
            name: "Business Administration",
            duration: "2 Years",
            type: "MBA",
            description: "Strategic business education with focus on leadership and management skills."
        },
        {
            name: "Mechanical Engineering",
            duration: "4 Years", 
            type: "B.Tech",
            description: "Innovative engineering program with hands-on laboratory experience."
        },
        {
            name: "Data Science",
            duration: "2 Years",
            type: "M.Sc",
            description: "Advanced analytics and machine learning for data-driven decision making."
        }
    ];

    const stats = [
        { number: "15,000+", label: "Students", icon: Users },
        { number: "500+", label: "Faculty", icon: GraduationCap },
        { number: "50+", label: "Programs", icon: BookOpen },
        { number: "25+", label: "Years", icon: Award }
    ];

    const testimonials = [
        {
            name: "Priya Sharma",
            program: "MBA Graduate",
            text: "SCL Institute provided me with exceptional education and opportunities. The faculty's guidance was invaluable.",
            rating: 5
        },
        {
            name: "Rahul Patel",
            program: "B.Tech Computer Science",
            text: "The practical approach and modern curriculum prepared me perfectly for my career in technology.",
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
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'
            }`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${isScrolled ? `bg-${theme.primary}` : 'bg-white/20 backdrop-blur-md border border-white/30'}`}>
                                <GraduationCap className={`h-8 w-8 ${isScrolled ? 'text-white' : 'text-white'}`} />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                                    SCL Institute
                                </h1>
                                <p className={`text-sm ${isScrolled ? 'text-gray-600' : 'text-white/90'}`}>
                                    Excellence in Education
                                </p>
                            </div>
                        </div>
                        
                        <div className="hidden md:flex items-center space-x-8">
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
                            <button className={`bg-${theme.accent} text-white px-6 py-2 rounded-full font-semibold hover:bg-${theme.secondary} transition-colors`}>
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50"></div>
                        </div>
                    ))}
                </div>
                
                <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
                        {slides[currentSlide].title}
                    </h1>
                    <h2 className="text-2xl md:text-3xl mb-6 text-college-gold font-serif">
                        {slides[currentSlide].subtitle}
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                        {slides[currentSlide].description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-college-gold text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                            Explore Programs
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                        <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300">
                            Virtual Tour
                        </button>
                    </div>
                </div>

                {/* Slide indicators */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentSlide ? 'bg-college-gold w-8' : 'bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-college-navy text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <stat.icon className="h-12 w-12 mx-auto mb-4 text-college-gold" />
                                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                                <div className="text-lg opacity-90">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section id="programs" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Our Academic Programs
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover world-class programs designed to prepare you for success in your chosen field
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {programs.map((program, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="bg-college-blue text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {program.type}
                                    </span>
                                    <span className="text-gray-500 text-sm flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {program.duration}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{program.name}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>
                                <button className="w-full bg-college-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                                    Learn More
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                                Why Choose SCL Institute?
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-college-blue p-2 rounded-full">
                                        <CheckCircle className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Academic Excellence</h3>
                                        <p className="text-gray-600">Consistently ranked among top institutions with world-class curriculum and faculty.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="bg-college-blue p-2 rounded-full">
                                        <Globe className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Global Recognition</h3>
                                        <p className="text-gray-600">Internationally accredited programs with global industry partnerships.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="bg-college-blue p-2 rounded-full">
                                        <Target className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Career Success</h3>
                                        <p className="text-gray-600">95% placement rate with top companies and excellent career support.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Students studying"
                                className="rounded-2xl shadow-xl w-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-college-blue/20 to-transparent rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            What Our Students Say
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Hear from our successful graduates about their transformative experience at SCL Institute
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-college-gold fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 leading-relaxed italic">
                                    "{testimonial.text}"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-college-blue rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-gray-600 text-sm">{testimonial.program}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-college-navy text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Get in Touch
                        </h2>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Ready to start your journey with us? Contact our admissions team today
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-bold mb-8">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <MapPin className="h-6 w-6 text-college-gold" />
                                    <div>
                                        <p className="font-semibold">Campus Address</p>
                                        <p className="opacity-90">123 Education Street, Knowledge City, State 12345</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Phone className="h-6 w-6 text-college-gold" />
                                    <div>
                                        <p className="font-semibold">Phone</p>
                                        <p className="opacity-90">+91 123 456 7890</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Mail className="h-6 w-6 text-college-gold" />
                                    <div>
                                        <p className="font-semibold">Email</p>
                                        <p className="opacity-90">admissions@sclinstitute.edu</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="text-lg font-bold mb-4">Follow Us</h4>
                                <div className="flex space-x-4">
                                    <a href="#" className="bg-college-gold p-3 rounded-full hover:bg-yellow-600 transition-colors">
                                        <Facebook className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="bg-college-gold p-3 rounded-full hover:bg-yellow-600 transition-colors">
                                        <Twitter className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="bg-college-gold p-3 rounded-full hover:bg-yellow-600 transition-colors">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="bg-college-gold p-3 rounded-full hover:bg-yellow-600 transition-colors">
                                        <Linkedin className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-gray-900">
                            <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">First Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-college-blue focus:ring-2 focus:ring-college-blue/20 outline-none"
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-college-blue focus:ring-2 focus:ring-college-blue/20 outline-none"
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-college-blue focus:ring-2 focus:ring-college-blue/20 outline-none"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Subject</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-college-blue focus:ring-2 focus:ring-college-blue/20 outline-none"
                                        placeholder="Enter subject"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Message</label>
                                    <textarea
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-college-blue focus:ring-2 focus:ring-college-blue/20 outline-none resize-none"
                                        placeholder="Enter your message"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-college-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-college-blue p-2 rounded-xl">
                                    <GraduationCap className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">SCL Institute</h3>
                                    <p className="text-gray-400 text-sm">Excellence in Education</p>
                                </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Empowering students with world-class education and preparing them for global success.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Programs</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Admissions</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Campus Life</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-bold mb-6">Student Services</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Library</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Career Services</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Student Portal</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-bold mb-6">Connect</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">News & Events</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Alumni</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Research</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2026 SCL Institute. All rights reserved. | Privacy Policy | Terms of Service
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;