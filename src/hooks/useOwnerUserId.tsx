import { useAuth } from './useAuth';
import { useCurrentEmployee } from './useCurrentEmployee';

/**
 * Returns the owner's user_id for data access.
 * - For owners/admins: returns their own user.id
 * - For employees: returns the user_id of the owner who created them
 * 
 * This ensures employees with proper permissions see the same data as the owner.
 */
export function useOwnerUserId(): string | null {
  const { user } = useAuth();
  const { employee, isAdmin, hasFullAccess } = useCurrentEmployee();

  // Any employee should use the owner's user_id for data operations
  // The employee.user_id field contains the ID of the owner who created this employee
  if (employee) {
    return employee.user_id;
  }
  
  // Otherwise use the current user's ID (they are the owner)
  return user?.id || null;
}
