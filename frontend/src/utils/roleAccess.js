const CANONICAL_ROLE_MAP = {
    'super admin': 'manager',
    'lms manager': 'manager',
    'course creator': 'coursecreator',
    'non-editing teacher': 'teacher',
    noneditingteacher: 'teacher',
    'authenticated user': 'user',
    'authenticated user on site home': 'frontpage'
};

const MANAGEMENT_ROLES = new Set(['admin', 'manager', 'coursecreator']);
const TEACHING_ROLES = new Set(['editingteacher', 'teacher']);
const LEARNING_ROLES = new Set(['student']);

function normalizeRole(role) {
    if (!role) {
        return '';
    }

    const normalized = String(role).trim().toLowerCase();
    return CANONICAL_ROLE_MAP[normalized] || normalized;
}

function splitRoles(value) {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    return String(value)
        .split(/[|,;]+/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}

export function getUserRoles(user) {
    if (!user) {
        return [];
    }

    const roleCandidates = [
        ...splitRoles(user.roles),
        ...splitRoles(user.role),
        ...splitRoles(user?.roleContext?.roles),
        ...splitRoles(user?.roleContext?.primaryRole)
    ];

    const normalized = roleCandidates
        .map(normalizeRole)
        .filter(Boolean);

    return [...new Set(normalized)];
}

export function getRoleContext(user) {
    // If backend already provided a context-aware roleContext, use it
    if (user?.roleContext?.systemRoles || user?.roleContext?.courseRoles) {
        return {
            roles: user.roleContext.roles || [],
            primaryRole: user.roleContext.primaryRole || null,
            assignments: user.roleContext.assignments || [],
            systemRoles: user.roleContext.systemRoles || [],
            courseRoles: user.roleContext.courseRoles || {},
            hasSystemManagement: user.roleContext.hasSystemManagement || false,
            hasManagement: user.roleContext.hasManagement || false,
            hasTeaching: user.roleContext.hasTeaching || false,
            hasStudent: user.roleContext.hasStudent || false,
            canAccessManagementPortal: user.roleContext.canAccessManagementPortal || false,
            canAccessStudentPortal: user.roleContext.canAccessStudentPortal || false,
            source: user.roleContext.source || 'local'
        };
    }

    // Fallback to legacy role parsing if backend doesn't provide context
    const roles = getUserRoles(user);

    const hasManagement = roles.some((role) => MANAGEMENT_ROLES.has(role));
    const hasTeaching = roles.some((role) => TEACHING_ROLES.has(role));
    const hasStudent = roles.some((role) => LEARNING_ROLES.has(role));

    return {
        roles,
        primaryRole: roles[0] || null,
        assignments: [],
        systemRoles: [],
        courseRoles: {},
        hasSystemManagement: false,
        hasManagement,
        hasTeaching,
        hasStudent,
        canAccessStudentPortal: hasStudent || hasTeaching,
        canAccessManagementPortal: hasManagement,
        source: 'local'
    };
}
