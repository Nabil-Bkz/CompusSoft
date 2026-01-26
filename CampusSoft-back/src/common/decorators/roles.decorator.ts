import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../value-objects/user-role.vo';

/**
 * Key used by RolesGuard to read allowed roles from route metadata
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator pour définir les rôles autorisés pour un endpoint
 * @param roles Liste de rôles autorisés
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
