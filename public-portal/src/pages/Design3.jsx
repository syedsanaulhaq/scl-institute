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

const Design3 = ({ selectedTheme = 'corporate', onApplyNow, onChangeTheme }) => {
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

    const theme = themes[selectedTheme] || themes.corporate;

    const programs = [
        {
            name: 'Computer Science Engineering',
            duration: '4 Years',
            type: 'B.Tech',
            description: 'Advanced computing, AI, and software development'
        },
        {
            name: 'Data Science & Analytics',
            duration: '2 Years',
            type: 'M.Tech',
            description: 'Machine learning and big data analytics'
        },
        {
            name: 'Business Management',
            duration: '2 Years',
            type: 'MBA',
            description: 'Strategic management and leadership'
        },
        {
            name: 'Cloud Computing',
            duration: '6 Months',
            type: 'Certificate',
            description: 'AWS, Azure, and cloud infrastructure'
        }
    ];

    const testimonials = [
        {
            name: 'Rajesh Kumar',
            program: 'B.Tech CSE',
            text: 'The curriculum is industry-aligned and the faculty expertise is exceptional.',
            rating: 5
        },
        {
            name: 'Priya Sharma',
            program: 'MBA',
            text: 'Professional environment with focus on practical business skills.',
            rating: 5
        },
        {
            name: 'Amit Patel',
            program: 'M.Tech Data Science',
            text: 'Comprehensive program with strong industry placements.',
            rating: 5
        }
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation - Corporate */}
            <nav className={`fixed w-full z-50 transition-all ${
                isScrolled ? `bg-${theme.secondary} shadow-lg` : `bg-${theme.primary}`
            }`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <GraduationCap className="h-7 w-7 text-white" />
                        <span className="text-xl font-bold text-white">SCL Institute</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#" className="text-white hover:opacity-80 font-medium">Home</a>
                        <a href="#" className="text-white hover:opacity-80 font-medium">Programs</a>
                        <a href="#" className="text-white hover:opacity-80 font-medium">About</a>
                        <a href="#" className="text-white hover:opacity-80 font-medium">Contact</a>
                        <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:text-yellow-200 font-semibold underline">SCL System</a>
                        <button onClick={onApplyNow} className={`bg-${theme.accent} text-white px-6 py-2 rounded font-semibold hover:opacity-90`}>
                            Apply Now
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Corporate */}
            <section className={`bg-${theme.primary} text-white pt-24 pb-20 px-6`}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl font-bold mb-6 leading-tight">Excellence in Professional Education</h1>
                            <p className="text-lg opacity-90 mb-8 leading-relaxed">
                                Prepare for global leadership with our world-class programs designed for professional growth and career advancement.
                            </p>
                            <button onClick={onApplyNow} className={`bg-${theme.accent} text-white px-8 py-3 rounded font-semibold hover:opacity-90 flex items-center space-x-2`}>
                                <span>Apply Today</span>
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                        <div className={`bg-${theme.secondary} rounded-lg h-96 flex items-center justify-center`}>
                            <Award className="h-32 w-32 opacity-30" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl font-bold text-${theme.primary} mb-4`}>Our Programs</h2>
                        <p className="text-gray-600 text-lg">Comprehensive programs for every career goal</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {programs.map((prog, idx) => (
                            <div key={idx} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                <h3 className={`text-lg font-bold text-${theme.primary} mb-2`}>{prog.name}</h3>
                                <p className="text-gray-600 text-sm mb-4">{prog.description}</p>
                                <div className="flex justify-between items-center text-sm text-gray-700">
                                    <span className="font-semibold">{prog.type}</span>
                                    <span>{prog.duration}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl font-bold text-${theme.primary} mb-4`}>Why Choose SCL Institute?</h2>
                        <p className="text-gray-600 text-lg">Setting standards in professional education</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { icon: CheckCircle, title: "Accredited Programs", desc: "Recognized globally for quality" },
                            { icon: Users, title: "Expert Faculty", desc: "Industry leaders and scholars" },
                            { icon: Target, title: "Career Focused", desc: "100% placement support" },
                            { icon: Globe, title: "Global Network", desc: "International partnerships" },
                            { icon: BookOpen, title: "Modern Curriculum", desc: "Industry-aligned courses" },
                            { icon: Heart, title: "Student Success", desc: "Comprehensive support system" }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className={`bg-${theme.accent} text-white h-16 w-16 rounded-full mx-auto mb-6 flex items-center justify-center`}>
                                    <item.icon className="h-8 w-8" />
                                </div>
                                <h3 className={`text-lg font-bold text-${theme.primary} mb-3`}>{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl font-bold text-${theme.primary} mb-4`}>Alumni Success Stories</h2>
                        <p className="text-gray-600 text-lg">Hear from our successful graduates</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((test, idx) => (
                            <div key={idx} className="bg-white border border-gray-300 rounded-lg p-8">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(test.rating)].map((_, i) => (
                                        <Star key={i} className={`h-5 w-5 text-${theme.accent} fill-current`} />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic font-light">"{test.text}"</p>
                                <div className="border-t border-gray-200 pt-4">
                                    <p className={`font-bold text-${theme.primary}`}>{test.name}</p>
                                    <p className="text-gray-600 text-sm">{test.program}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={`bg-${theme.secondary} text-white py-20 text-center`}>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold mb-4">Ready to Advance Your Career?</h2>
                    <p className="text-lg opacity-90 mb-8">Join thousands of successful professionals</p>
                    <button onClick={onApplyNow} className={`bg-${theme.accent} text-white px-10 py-3 rounded font-semibold hover:opacity-90`}>
                        Start Your Application
                    </button>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl font-bold text-${theme.primary} mb-4`}>Contact Information</h2>
                        <p className="text-gray-600 text-lg">Get in touch with our admissions team</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className={`bg-${theme.accent} text-white h-12 w-12 rounded-full mx-auto mb-6 flex items-center justify-center`}>
                                <MapPin className="h-6 w-6" />
                            </div>
                            <h3 className={`font-bold text-${theme.primary} mb-2`}>Address</h3>
                            <p className="text-gray-600">123 Education Street<br/>New Delhi, India</p>
                        </div>
                        <div className="text-center">
                            <div className={`bg-${theme.accent} text-white h-12 w-12 rounded-full mx-auto mb-6 flex items-center justify-center`}>
                                <Phone className="h-6 w-6" />
                            </div>
                            <h3 className={`font-bold text-${theme.primary} mb-2`}>Phone</h3>
                            <p className="text-gray-600">+91 98765 43210</p>
                        </div>
                        <div className="text-center">
                            <div className={`bg-${theme.accent} text-white h-12 w-12 rounded-full mx-auto mb-6 flex items-center justify-center`}>
                                <Mail className="h-6 w-6" />
                            </div>
                            <h3 className={`font-bold text-${theme.primary} mb-2`}>Email</h3>
                            <p className="text-gray-600">info@sclinstitute.edu</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`bg-${theme.secondary} text-white py-16`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <GraduationCap className="h-8 w-8" />
                                <span className="text-xl font-bold">SCL Institute</span>
                            </div>
                            <p className="text-white/80 text-sm mb-6">Excellence in professional education</p>
                            <div className="flex space-x-3">
                                <Facebook className="h-6 w-6 cursor-pointer hover:opacity-80" />
                                <Twitter className="h-6 w-6 cursor-pointer hover:opacity-80" />
                                <Instagram className="h-6 w-6 cursor-pointer hover:opacity-80" />
                                <Linkedin className="h-6 w-6 cursor-pointer hover:opacity-80" />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                            <ul className="space-y-3 text-white/80 text-sm">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Programs</a></li>
                                <li><a href="#" className="hover:text-white">Admissions</a></li>
                                <li><a href="#" className="hover:text-white">Faculty</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-6">Resources</h4>
                            <ul className="space-y-3 text-white/80 text-sm">
                                <li><a href="#" className="hover:text-white">Library</a></li>
                                <li><a href="#" className="hover:text-white">Career Services</a></li>
                                <li><a href="#" className="hover:text-white">Alumni</a></li>
                                <li><a href="#" className="hover:text-white">News</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-6">Legal</h4>
                            <ul className="space-y-3 text-white/80 text-sm">
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white">Disclaimer</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/20 pt-8 text-center text-white/60">
                        <p>© 2024 SCL Institute. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Right Side Theme Panel */}
            <div className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-40 transition-transform ${showThemePanel ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="bg-white shadow-2xl rounded-l-lg p-6 w-64">
                    <h3 className="text-lg font-bold mb-6 text-gray-900">Choose Theme</h3>
                    <div className="space-y-3">
                        {Object.entries(themes).map(([key, t]) => (
                            <button
                                key={key}
                                onClick={() => onChangeTheme(key)}
                                className={`w-full px-4 py-3 rounded transition-all text-sm font-medium ${
                                    selectedTheme === key
                                        ? `bg-${t.primary} text-white`
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {showThemePanel && (
                <div className="fixed inset-0 bg-black/50 z-20" onClick={() => setShowThemePanel(false)}></div>
            )}

            {/* Right Side Toggle Button */}
            <button
                onClick={() => setShowThemePanel(!showThemePanel)}
                className={`fixed right-0 top-2/3 transform -translate-y-1/2 bg-${theme.primary} text-white px-2 py-4 rounded-l shadow-lg hover:shadow-xl z-30 transition-all`}
            >
                <Palette className="h-5 w-5" />
            </button>
        </div>
    );
};

export default Design3;
