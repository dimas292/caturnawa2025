export type UserRole = 'admin' | 'judge' | 'participant';

export function hasRole(userRole: string, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

export function requireRole(userRole: string, requiredRole: UserRole): void {
  if (!hasRole(userRole, requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'judge':
      return '/dashboard/judge';
    case 'participant':
      return '/dashboard/participant';
    default:
      return '/dashboard';
  }
}