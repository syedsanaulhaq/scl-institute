import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const moduleTypeSet = new Set(['assign', 'quiz', 'forum', 'resource', 'url', 'page']);

export async function fetchTeacherPortalData(email) {
    if (!email) {
        return { courses: [], courseRows: [], activities: [], summary: emptySummary() };
    }

    const coursesRes = await axios.get(`${API_URL}/students/my-moodle-courses`, {
        params: { email }
    });

    const courses = coursesRes.data?.data || [];
    const teachingCourses = courses.filter((course) => {
        const role = String(course.role || '').toLowerCase();
        return Boolean(course.hasTeachingRole || role === 'teacher' || role === 'editingteacher' || role === 'noneditingteacher');
    });

    const sectionPayloads = await Promise.all(
        teachingCourses.map(async (course) => {
            const courseId = course.moodle_course_id || course.id;
            try {
                const sectionsRes = await axios.get(`${API_URL}/students/moodle-course/${courseId}/sections`);
                return {
                    course,
                    sections: sectionsRes.data?.data?.sections || []
                };
            } catch {
                return { course, sections: [] };
            }
        })
    );

    const courseRows = sectionPayloads.map(({ course, sections }) => {
        const modules = sections.flatMap((section) => section.modules || []);
        const counts = countModuleTypes(modules);

        return {
            id: course.moodle_course_id || course.id,
            name: course.name || course.course_title || `Course ${course.id}`,
            code: course.code || course.course_code || course.course_shortname || '-',
            category: course.course_type || course.category_name || '',
            hasTeachingRole: Boolean(course.hasTeachingRole || ['teacher', 'editingteacher', 'noneditingteacher'].includes(String(course.role || '').toLowerCase())),
            isStudentEnrolled: Boolean(course.isStudentEnrolled),
            modules,
            moduleCount: modules.length,
            counts
        };
    });

    const activities = [];
    courseRows.forEach((course) => {
        course.modules.forEach((module) => {
            if (moduleTypeSet.has(module.type)) {
                activities.push({
                    id: `${course.id}-${module.id}`,
                    courseId: course.id,
                    courseName: course.name,
                    courseCode: course.code,
                    moduleId: module.id,
                    title: module.name || `${module.type} ${module.id}`,
                    type: module.type
                });
            }
        });
    });

    const summary = {
        totalCourses: courseRows.length,
        teachingCourses: courseRows.filter((c) => c.hasTeachingRole).length,
        moduleCount: courseRows.reduce((acc, c) => acc + c.moduleCount, 0),
        assessmentCount: activities.filter((a) => a.type === 'assign' || a.type === 'quiz').length,
        forumCount: activities.filter((a) => a.type === 'forum').length,
        resourceCount: activities.filter((a) => a.type === 'resource' || a.type === 'url' || a.type === 'page').length
    };

    // Fetch announcements and notifications in parallel
    const [announcementsRes, notificationsRes] = await Promise.allSettled([
        axios.get(`${API_URL}/students/teacher-announcements`, { params: { email } }),
        axios.get(`${API_URL}/students/teacher-notifications`, { params: { email } })
    ]);

    const announcements = announcementsRes.status === 'fulfilled'
        ? (announcementsRes.value.data?.data || [])
        : [];
    const notifications = notificationsRes.status === 'fulfilled'
        ? (notificationsRes.value.data?.data || [])
        : [];

    return { courses: teachingCourses, courseRows, activities, summary, announcements, notifications };
}

function countModuleTypes(modules) {
    const counts = {
        assign: 0,
        quiz: 0,
        forum: 0,
        resource: 0,
        url: 0,
        page: 0
    };

    modules.forEach((module) => {
        const type = String(module.type || '').toLowerCase();
        if (Object.prototype.hasOwnProperty.call(counts, type)) {
            counts[type] += 1;
        }
    });

    return counts;
}

function emptySummary() {
    return {
        totalCourses: 0,
        teachingCourses: 0,
        moduleCount: 0,
        assessmentCount: 0,
        forumCount: 0,
        resourceCount: 0
    };
}
