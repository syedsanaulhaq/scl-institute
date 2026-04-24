import React from 'react';
import { LayoutGrid, Code2, Palette, Database, Smartphone, TrendingUp, Camera, Brain, Shield } from 'lucide-react';

const TopCategoriesCard = () => {
    const categories = [
        { name: 'UI / UX Design', icon: Palette, color: '#E0E7FF', courses: '10,000+', price: '$199.99', bgColor: 'bg-indigo-50' },
        { name: 'UI/UX Design & Development', icon: LayoutGrid, color: '#E0E7FF', courses: '25,000+', price: '$299.99', bgColor: 'bg-indigo-50' },
        { name: 'Full Stack Web Development', icon: Code2, color: '#DCE7F7', courses: '18,500+', price: '$249.99', bgColor: 'bg-blue-50' },
        { name: 'Database Management & SQL', icon: Database, color: '#F0D9F7', courses: '22,000+', price: '$199.99', bgColor: 'bg-purple-50' },
        { name: 'Mobile App Development', icon: Smartphone, color: '#FED7AA', courses: '15,000+', price: '$249.99', bgColor: 'bg-amber-50' },
        { name: 'Digital Marketing & SEO', icon: TrendingUp, color: '#DBEAFE', courses: '12,500+', price: '$179.99', bgColor: 'bg-blue-50' },
        { name: 'Photography & Video Editing', icon: Camera, color: '#F5D3D0', courses: '8,500+', price: '$159.99', bgColor: 'bg-rose-50' },
        { name: 'Artificial Intelligence & Machine Learning', icon: Brain, color: '#E7D4F5', courses: '20,000+', price: '$299.99', bgColor: 'bg-purple-50' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Top Categories</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.5 1.5H9.5V3H8V1.5H4V3H2.5V1.5H1.5V9H3V19H17V9H19V1.5H18V3H16.5V1.5H15.5V3H14V1.5H10.5V3H9V1.5Z" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat, idx) => {
                    const IconComponent = cat.icon;
                    return (
                        <div key={idx} className={`${cat.bgColor} rounded-lg p-4 border border-gray-100 hover:shadow-md transition`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2.5 bg-white rounded-lg">
                                    <IconComponent className="w-5 h-5" style={{ color: '#3B82F6' }} />
                                </div>
                                <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded">{cat.courses}</span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 mb-1">{cat.name}</h4>
                            <p className="text-lg font-bold text-blue-600">{cat.price}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopCategoriesCard;
