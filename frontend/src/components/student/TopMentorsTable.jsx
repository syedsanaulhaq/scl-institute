import React from 'react';
import { ChevronRight } from 'lucide-react';

const TopMentorsTable = () => {
    const mentors = [
        { name: 'Caleb Riv', expertise: 'Web Designer', courses: 110, experience: 12, image: 'https://via.placeholder.com/40' },
        { name: 'Maria Stone', expertise: 'Full Stack Developer', courses: 98, experience: 8, image: 'https://via.placeholder.com/40' },
        { name: 'Samuel Lee', expertise: 'UI/UX Designer', courses: 120, experience: 9, image: 'https://via.placeholder.com/40' },
        { name: 'Nina Patel', expertise: 'Data Scientist', courses: 75, experience: 10, image: 'https://via.placeholder.com/40' },
        { name: 'John Carter', expertise: 'Digital Marketer', courses: 105, experience: 6, image: 'https://via.placeholder.com/40' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Top Mentors</h3>
                <a href="#" className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                </a>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Mentor Name</th>
                            <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Expertise</th>
                            <th className="text-center py-3 px-2 text-xs font-semibold text-gray-600">Courses</th>
                            <th className="text-center py-3 px-2 text-xs font-semibold text-gray-600">Experience</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mentors.map((mentor, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-2">
                                        <img src={mentor.image} alt={mentor.name} className="w-8 h-8 rounded-lg" />
                                        <span className="text-sm font-medium text-gray-900">{mentor.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-2 text-sm text-gray-600">{mentor.expertise}</td>
                                <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-center">{mentor.courses}</td>
                                <td className="py-3 px-2 text-sm text-gray-600 text-center">{mentor.experience} Years</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopMentorsTable;
