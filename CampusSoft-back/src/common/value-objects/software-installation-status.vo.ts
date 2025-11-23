/**
 * Value Object: SoftwareInstallationStatus
 * Statut d'installation d'un logiciel dans une demande
 */
export enum SoftwareInstallationStatus {
  EN_ATTENTE = 'en_attente',
  TOUS_INSTALLES = 'tous_installés',
  PARTIELLEMENT_INSTALLE = 'partiellement_installé',
  PROBLEME = 'problème',
  CHANGEMENT = 'changement',
}

/**
 * Valide qu'un statut d'installation est valide
 */
export function isValidSoftwareInstallationStatus(
  status: string,
): status is SoftwareInstallationStatus {
  return Object.values(SoftwareInstallationStatus).includes(status as SoftwareInstallationStatus);
}

/**
 * Calcule le statut d'installation basé sur les salles installées/non installées
 */
export function calculateInstallationStatus(
  totalSalles: number,
  sallesInstallees: number,
  hasProbleme: boolean = false,
  hasChangement: boolean = false,
): SoftwareInstallationStatus {
  if (hasChangement) {
    return SoftwareInstallationStatus.CHANGEMENT;
  }
  if (hasProbleme) {
    return SoftwareInstallationStatus.PROBLEME;
  }
  if (totalSalles === 0) {
    return SoftwareInstallationStatus.EN_ATTENTE;
  }
  if (sallesInstallees === 0) {
    return SoftwareInstallationStatus.EN_ATTENTE;
  }
  if (sallesInstallees === totalSalles) {
    return SoftwareInstallationStatus.TOUS_INSTALLES;
  }
  return SoftwareInstallationStatus.PARTIELLEMENT_INSTALLE;
}

