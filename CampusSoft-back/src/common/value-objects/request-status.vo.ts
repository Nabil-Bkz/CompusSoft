/**
 * Value Object: RequestStatus
 * État d'une demande selon le MCD
 */
export enum RequestStatus {
  NOUVELLE = 'nouvelle',
  EN_COURS = 'en_cours',
  INSTALLEE = 'installée',
  EXPIREE = 'expirée',
  FERMEE = 'fermée',
}

/**
 * Valide qu'un statut est valide
 */
export function isValidRequestStatus(status: string): status is RequestStatus {
  return Object.values(RequestStatus).includes(status as RequestStatus);
}

/**
 * Transitions valides d'états
 */
export const REQUEST_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.NOUVELLE]: [RequestStatus.EN_COURS, RequestStatus.FERMEE],
  [RequestStatus.EN_COURS]: [RequestStatus.INSTALLEE, RequestStatus.EXPIREE, RequestStatus.FERMEE],
  [RequestStatus.INSTALLEE]: [RequestStatus.EXPIREE],
  [RequestStatus.EXPIREE]: [],
  [RequestStatus.FERMEE]: [],
};

/**
 * Vérifie si une transition d'état est valide
 */
export function canTransitionTo(from: RequestStatus, to: RequestStatus): boolean {
  return REQUEST_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

