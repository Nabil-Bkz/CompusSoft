/**
 * Value Object: AttestationStatus
 * Statut d'une attestation (réattestation annuelle)
 */
export enum AttestationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  NOT_REQUIRED = 'not_required',
}

/**
 * Valide qu'un statut d'attestation est valide
 */
export function isValidAttestationStatus(status: string): status is AttestationStatus {
  return Object.values(AttestationStatus).includes(status as AttestationStatus);
}

