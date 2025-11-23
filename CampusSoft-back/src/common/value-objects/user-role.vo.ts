/**
 * Value Object: UserRole
 * Rôles utilisateurs selon le MCD
 */
export enum UserRole {
  ENSEIGNANT = 'enseignant',
  RESPONSABLE_DEPARTEMENT = 'responsable_département',
  RESPONSABLE_SALLE = 'responsable_salle',
  SERVICE_INFORMATIQUE = 'service_informatique',
  ADMINISTRATEUR = 'administrateur',
}

/**
 * Valide qu'un rôle utilisateur est valide
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Vérifie si un rôle peut créer des demandes
 */
export function canCreateDemande(role: UserRole): boolean {
  return role === UserRole.ENSEIGNANT || role === UserRole.ADMINISTRATEUR;
}

/**
 * Vérifie si un rôle peut consulter toutes les demandes
 */
export function canViewAllDemandes(role: UserRole): boolean {
  return (
    role === UserRole.SERVICE_INFORMATIQUE ||
    role === UserRole.ADMINISTRATEUR
  );
}

