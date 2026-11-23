/**
 * NexusFlow — Role-Based Access Control (RBAC) & Permission Engine
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 3 Deliverable — Security Governance & Multi-Tier Authorization
 * Organization: Infotact Solutions
 */

const ROLE_PERMISSIONS = {
  admin: [
    '*', // wildcard access to all operations
  ],
  operator: [
    'device:read',
    'device:write',
    'telemetry:read',
    'telemetry:ingest',
    'telemetry:export',
    'rule:read',
    'rule:create',
    'rule:update',
    'rule:execute',
    'alert:read',
    'alert:acknowledge',
    'alert:resolve',
    'webhook:read',
    'webhook:test',
    'escalation:read',
    'escalation:acknowledge',
    'escalation:resolve',
    'log:read',
  ],
  auditor: [
    'device:read',
    'telemetry:read',
    'telemetry:export',
    'rule:read',
    'alert:read',
    'log:read',
    'escalation:read',
    'webhook:read',
    'audit:read',
  ],
  viewer: [
    'device:read',
    'telemetry:read',
    'alert:read',
    'rule:read',
  ],
};

class RbacService {
  constructor() {
    this.userRoles = new Map([
      ['usr_admin_01', 'admin'],
      ['usr_operator_01', 'operator'],
      ['usr_auditor_01', 'auditor'],
      ['usr_viewer_01', 'viewer'],
    ]);
  }

  /**
   * Check if a given role has a specific permission
   * @param {string} role 
   * @param {string} permission 
   * @returns {boolean}
   */
  hasPermission(role, permission) {
    if (!role || !permission) return false;
    const permissions = ROLE_PERMISSIONS[role.toLowerCase()];
    if (!permissions) return false;
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }

  /**
   * Get all permissions granted to a role
   * @param {string} role 
   * @returns {string[]}
   */
  getRolePermissions(role) {
    if (!role) return [];
    return ROLE_PERMISSIONS[role.toLowerCase()] || [];
  }

  /**
   * Retrieve role for a user ID
   * @param {string} userId 
   * @returns {string}
   */
  getUserRole(userId) {
    return this.userRoles.get(userId) || 'viewer';
  }

  /**
   * Assign a role to a user
   * @param {string} userId 
   * @param {string} role 
   */
  assignRole(userId, role) {
    if (!ROLE_PERMISSIONS[role.toLowerCase()]) {
      throw new Error(`Invalid role: ${role}. Valid roles are: ${Object.keys(ROLE_PERMISSIONS).join(', ')}`);
    }
    this.userRoles.set(userId, role.toLowerCase());
  }

  /**
   * Express middleware to enforce a required permission
   * Checks req.user.role or fallback header x-user-role
   * @param {string} permission 
   */
  requirePermission(permission) {
    return (req, res, next) => {
      const role = (req.user && req.user.role) || req.headers['x-user-role'] || 'viewer';
      if (!this.hasPermission(role, permission)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. Role '${role}' lacks required permission: '${permission}'.`,
          requiredPermission: permission,
          userRole: role,
        });
      }
      next();
    };
  }

  /**
   * Express middleware to enforce one of the allowed roles
   * @param {string[]} allowedRoles 
   */
  requireRole(allowedRoles = []) {
    return (req, res, next) => {
      const role = (req.user && req.user.role) || req.headers['x-user-role'] || 'viewer';
      const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
      if (role === 'admin' || normalizedAllowed.includes(role.toLowerCase())) {
        return next();
      }
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Role '${role}' is not authorized. Allowed roles: ${allowedRoles.join(', ')}.`,
      });
    };
  }
}

const rbacService = new RbacService();

module.exports = rbacService;
module.exports.RbacService = RbacService;
module.exports.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
