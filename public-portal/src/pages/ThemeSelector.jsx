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
        bgPattern: 'bg-gradient-to-br from-blue-50 to-white',
        description: 'Professional and trustworthy with blue tones'
    },
    elegant: {
        name: 'Elegant Purple',
        primary: 'purple-600',
        secondary: 'purple-800',
        accent: 'yellow-400',
        gradient: 'from-purple-600 to-purple-900',
        bgPattern: 'bg-gradient-to-br from-purple-50 to-white',
        description: 'Sophisticated and premium with purple shades'
    },
    green: {
        name: 'Nature Green',
        primary: 'emerald-600',
        secondary: 'emerald-800',
        accent: 'orange-500',
        gradient: 'from-emerald-600 to-teal-700',
        bgPattern: 'bg-gradient-to-br from-emerald-50 to-white',
        description: 'Fresh and eco-friendly with green colors'
    },
    corporate: {
        name: 'Corporate Dark',
        primary: 'slate-700',
        secondary: 'slate-900',
        accent: 'blue-500',
        gradient: 'from-slate-700 to-slate-900',
        bgPattern: 'bg-gradient-to-br from-slate-100 to-white',
        description: 'Professional and sleek with dark tones'
    },
    warm: {
        name: 'Warm Orange',
        primary: 'orange-600',
        secondary: 'red-700',
        accent: 'yellow-400',
        gradient: 'from-orange-600 to-red-600',
        bgPattern: 'bg-gradient-to-br from-orange-50 to-white',
        description: 'Energetic and vibrant with warm colors'
    }
};

const ThemeSelector = ({ onThemeSelect }) => {
    const [hoveredTheme, setHoveredTheme] = useState(null);

    const handleThemeSelect = (themeKey) => {
        onThemeSelect(themeKey);
    };

    // Sample component to preview theme
    const PreviewCard = ({ theme, themeKey, isHovered }) => (
        <div 
            className={`relative rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 ${
                isHovered ? 'scale-105 shadow-2xl' : ''
            }`}
            onMouseEnter={() => setHoveredTheme(themeKey)}
            onMouseLeave={() => setHoveredTheme(null)}
            onClick={() => handleThemeSelect(themeKey)}
        >
            <div className={`${theme.bgPattern} p-6 h-64`}>
                {/* Mini Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg bg-${theme.primary}`}>
                            <GraduationCap className="h-4 w-4 text-white" />
                        </div>
                        <span className={`font-bold text-${theme.primary}`}>SCL Institute</span>
                    </div>
                    <button className={`bg-${theme.accent} text-white px-3 py-1 rounded text-xs`}>
                        Apply
                    </button>
                </div>

                {/* Mini Hero */}
                <div className="text-center">
                    <h3 className={`text-lg font-bold text-${theme.primary} mb-2`}>
                        Excellence in Education
                    </h3>
                    <p className={`text-sm text-${theme.secondary} mb-3`}>
                        Empowering minds, building futures
                    </p>
                    <button className={`bg-${theme.primary} text-white px-4 py-2 rounded-lg text-xs hover:bg-${theme.secondary} transition-colors`}>
                        Learn More
                    </button>
                </div>

                {/* Mini Features */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {[Award, Users, Target].map((Icon, index) => (
                        <div key={index} className="text-center">
                            <div className={`bg-gradient-to-r ${theme.gradient} p-2 rounded-full w-8 h-8 mx-auto flex items-center justify-center`}>
                                <Icon className="h-3 w-3 text-white" />
                            </div>
                            <span className={`text-xs text-${theme.secondary} mt-1 block`}>
                                {['Excellence', 'Expert Faculty', 'Placement'][index]}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Selection Indicator */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="bg-white rounded-full p-3">
                            <CheckCircle className={`h-8 w-8 text-${theme.primary}`} />
                        </div>
                    </div>
                )}
            </div>

            {/* Theme Info */}
            <div className="bg-white p-4 border-t-4 border-t-blue-600">
                <h4 className={`font-bold text-${theme.primary} mb-2`}>{theme.name}</h4>
                <p className="text-gray-600 text-sm mb-3">{theme.description}</p>
                <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                        <div className={`w-3 h-3 rounded-full bg-${theme.primary}`}></div>
                        <div className={`w-3 h-3 rounded-full bg-${theme.secondary}`}></div>
                        <div className={`w-3 h-3 rounded-full bg-${theme.accent}`}></div>
                    </div>
                    <ArrowRight className={`h-4 w-4 text-${theme.primary}`} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-6">
                        <Palette className="h-12 w-12 text-blue-600 mr-4" />
                        <h1 className="text-4xl font-bold text-gray-900">Choose Your Theme</h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Select a theme that reflects your college's personality. Each theme provides a unique visual experience
                        while maintaining professional standards and user-friendly design.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {Object.entries(themes).map(([key, theme]) => (
                        <PreviewCard 
                            key={key} 
                            theme={theme} 
                            themeKey={key}
                            isHovered={hoveredTheme === key}
                        />
                    ))}
                </div>

                <div className="text-center">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help Choosing?</h3>
                        <p className="text-gray-600 mb-6">
                            Each theme is carefully designed to create the right atmosphere for your educational institution.
                            You can always change the theme later from the admin settings.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 text-left">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">💡 Tip</h4>
                                <p className="text-blue-800 text-sm">
                                    Hover over each theme preview to see how it looks in action
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">🎨 Customizable</h4>
                                <p className="text-green-800 text-sm">
                                    All themes work perfectly with your application form and content
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeSelector;