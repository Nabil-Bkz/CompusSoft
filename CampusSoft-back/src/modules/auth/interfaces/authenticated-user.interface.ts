import { UserRole } from '../../../common/value-objects/user-role.vo';

/**
 * Interface représentant l’utilisateur attaché à request.user après auth
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  actif: boolean;
}
