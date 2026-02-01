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
    Palette
} from 'lucide-react';

const Design2 = ({ selectedTheme = 'modern', onApplyNow, onChangeTheme }) => {
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

    const programs = [
        {
            name: 'Computer Science',
            duration: '4 Years',
            type: 'B.Tech',
            icon: '💻',
            description: 'Advanced computing and software development'
        },
        {
            name: 'Business Administration',
            duration: '2 Years',
            type: 'MBA',
            icon: '📊',
            description: 'Business management and leadership'
        },
        {
            name: 'Mechanical Engineering',
            duration: '4 Years',
            type: 'B.Tech',
            icon: '⚙️',
            description: 'Mechanical design and manufacturing'
        },
        {
            name: 'Data Science',
            duration: '6 Months',
            type: 'Certificate',
            icon: '📈',
            description: 'Data analysis and machine learning'
        }
    ];

    const testimonials = [
        {
            name: 'Rajesh Kumar',
            program: 'B.Tech CSE',
            text: 'Outstanding faculty and practical approach to learning.',
            rating: 5
        },
        {
            name: 'Priya Sharma',
            program: 'MBA',
            text: 'Amazing experience with excellent mentorship.',
            rating: 5
        },
        {
            name: 'Amit Patel',
            program: 'B.Tech Mechanical',
            text: 'Great placement support and industry connections.',
            rating: 4
        }
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation - Minimal */}
            <nav className={`fixed w-full z-50 transition-all ${
                isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <GraduationCap className={`h-6 w-6 ${isScrolled ? `text-${theme.primary}` : 'text-gray-900'}`} />
                        <span className="text-lg font-semibold text-gray-900">SCL</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-6">
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Home</a>
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Programs</a>
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a>
                        <a href="http://localhost:3000" className="text-sm font-semibold text-blue-700 hover:text-blue-900 underline">SCL System</a>
                        <button onClick={onApplyNow} className={`bg-${theme.primary} text-white px-5 py-2 rounded text-sm font-medium hover:opacity-90`}>
                            Apply
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero - Split Layout */}
            <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-20 px-6 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-5xl font-light text-gray-900 mb-6 leading-tight">
                        Transform Your Future with Quality Education
                    </h1>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        Discover our world-class programs designed to prepare you for tomorrow's opportunities. Learn from industry experts and build skills that matter.
                    </p>
                    <button onClick={onApplyNow} className={`bg-${theme.primary} text-white px-8 py-3 rounded-sm font-medium flex items-center space-x-2 hover:opacity-90`}>
                        <span>Get Started</span>
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
                <div className="h-96 bg-gray-100 rounded-lg"></div>
            </section>

            {/* Programs - Clean Grid */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <h2 className="text-4xl font-light text-gray-900 mb-12 text-center">Our Programs</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {programs.map((prog, idx) => (
                        <div key={idx} className="border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-shadow">
                            <div className="text-3xl mb-4">{prog.icon}</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{prog.name}</h3>
                            <p className="text-sm text-gray-600 mb-4">{prog.description}</p>
                            <div className="flex gap-2">
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{prog.type}</span>
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{prog.duration}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Choose - Features */}
            <section className="bg-gray-50 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-light text-gray-900 mb-12 text-center">Why Choose Us</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { title: "Expert Faculty", desc: "Learn from industry professionals" },
                            { title: "Modern Curriculum", desc: "Updated courses matching industry" },
                            { title: "Global Reach", desc: "Recognized worldwide" },
                            { title: "100% Placement", desc: "Strong career support" },
                            { title: "Innovation Focus", desc: "Cutting-edge technology" },
                            { title: "Student Support", desc: "Comprehensive guidance" }
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className={`h-12 w-12 bg-${theme.primary} rounded-full mb-4`}></div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <h2 className="text-4xl font-light text-gray-900 mb-12 text-center">Success Stories</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((test, idx) => (
                        <div key={idx} className="border border-gray-200 p-6 rounded-lg">
                            <div className="flex gap-1 mb-4">
                                {[...Array(test.rating)].map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 text-${theme.accent} fill-current`} />
                                ))}
                            </div>
                            <p className="text-gray-600 mb-4 text-sm italic">"{test.text}"</p>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{test.name}</p>
                                <p className="text-gray-600 text-xs">{test.program}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className={`bg-${theme.primary} text-white py-20 text-center`}>
                <h2 className="text-4xl font-light mb-4">Ready to Join?</h2>
                <p className="text-lg mb-8 opacity-90">Apply today and start your journey</p>
                <button onClick={onApplyNow} className="bg-white text-gray-900 px-8 py-3 rounded font-semibold hover:shadow-lg">
                    Apply Now
                </button>
            </section>

            {/* Contact */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <h2 className="text-4xl font-light text-gray-900 mb-12 text-center">Get In Touch</h2>
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="text-center">
                        <MapPin className={`h-6 w-6 text-${theme.primary} mx-auto mb-4`} />
                        <h3 className="font-semibold text-gray-900 mb-2">Visit</h3>
                        <p className="text-gray-600 text-sm">123 Education Street, New Delhi</p>
                    </div>
                    <div className="text-center">
                        <Phone className={`h-6 w-6 text-${theme.primary} mx-auto mb-4`} />
                        <h3 className="font-semibold text-gray-900 mb-2">Call</h3>
                        <p className="text-gray-600 text-sm">+91 98765 43210</p>
                    </div>
                    <div className="text-center">
                        <Mail className={`h-6 w-6 text-${theme.primary} mx-auto mb-4`} />
                        <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                        <p className="text-gray-600 text-sm">info@sclinstitute.edu</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <GraduationCap className="h-6 w-6" />
                                <span className="font-bold">SCL Institute</span>
                            </div>
                            <p className="text-gray-400 text-sm">Excellence in education</p>
                            <div className="flex space-x-3 mt-4">
                                <Facebook className="h-5 w-5 cursor-pointer hover:opacity-80" />
                                <Twitter className="h-5 w-5 cursor-pointer hover:opacity-80" />
                                <Instagram className="h-5 w-5 cursor-pointer hover:opacity-80" />
                                <Linkedin className="h-5 w-5 cursor-pointer hover:opacity-80" />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Links</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white">About</a></li>
                                <li><a href="#" className="hover:text-white">Programs</a></li>
                                <li><a href="#" className="hover:text-white">Admissions</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Resources</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white">Library</a></li>
                                <li><a href="#" className="hover:text-white">Career</a></li>
                                <li><a href="#" className="hover:text-white">Learning</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Contact</h4>
                            <p className="text-gray-400 text-sm">123 Education Street</p>
                            <p className="text-gray-400 text-sm">+91 98765 43210</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
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

export default Design2;
