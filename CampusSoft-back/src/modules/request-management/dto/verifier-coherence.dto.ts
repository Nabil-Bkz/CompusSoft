/**
 * DTO de réponse pour la vérification de cohérence
 */
export interface VerifierCohérenceResponseDto {
  cohérent: boolean;
  détails: {
    demande: {
      id: string;
      etat: string;
      nombreLogiciels: number;
    };
    logiciels: Array<{
      id: string;
      statut: string;
      nombreSalles: number;
      sallesInstallees: number;
      sallesNonInstallees: number;
    }>;
    problèmes?: string[];
  };
}








