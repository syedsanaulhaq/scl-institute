import React from 'react';
import { Star, Eye, ChevronRight } from 'lucide-react';

const TopCoursesGrid = () => {
    const courses = [
        {
            title: 'Mastering CSS Pseudo-classes: From Basics to Advanced Techniques',
            category: 'UX Design',
            instructor: 'By Richardino Gueva',
            views: 2189,
            rating: 4.2,
            image: 'https://via.placeholder.com/150x100?text=UX+Design'
        },
        {
            title: 'Responsive Web Design: Creating Seamless Experiences Across Devices',
            category: 'Web Development',
            instructor: 'By Jane Smith',
            views: 1875,
            rating: 3.8,
            image: 'https://via.placeholder.com/150x100?text=Web+Dev'
        },
        {
            title: 'Mastering Light: Advanced Photography Techniques for Stunning Images',
            category: 'Photography',
            instructor: 'By Emily Williams',
            views: 3542,
            rating: 4.5,
            image: 'https://via.placeholder.com/150x100?text=Photography'
        },
        {
            title: 'SEO Strategies: Boosting Your Website\'s Traffic and Visibility',
            category: 'Digital Marketing',
            instructor: 'By Michael Jordan',
            views: 5420,
            rating: 4.3,
            image: 'https://via.placeholder.com/150x100?text=Marketing'
        },
    ];

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className="w-3.5 h-3.5"
                        fill={i < Math.floor(rating) ? '#FCD34D' : '#E5E7EB'}
                        stroke={i < Math.floor(rating) ? '#F59E0B' : '#D1D5DB'}
                    />
                ))}
                <span className="text-xs font-semibold text-gray-700 ml-1">({rating})</span>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Top Courses</h3>
                <a href="#" className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {courses.map((course, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer">
                        <img src={course.image} alt={course.title} className="w-full h-24 object-cover bg-gray-100" />
                        <div className="p-3">
                            <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">{course.category}</span>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{course.title}</p>
                            <p className="text-xs text-gray-600 mb-2">{course.instructor}</p>
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-gray-600">{course.views.toLocaleString()} Views</span>
                            </div>
                            {renderStars(course.rating)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopCoursesGrid;
