/**
 * Value Object: DetailInstallation
 * Détails d'installation d'un logiciel dans une salle spécifique
 */
export class DetailInstallation {
  constructor(
    public readonly salleId: string,
    public readonly salleNom: string,
    public readonly estInstallée: boolean,
    public readonly dateInstallation: Date | null,
    public readonly dateAssignation: Date,
    public readonly commentaire: string | null,
  ) {}

  /**
   * Crée un DétailInstallation à partir d'un objet
   */
  static fromObject(obj: {
    salleId: string;
    salleNom: string;
    estInstallée: boolean;
    dateInstallation?: Date | null;
    dateAssignation: Date;
    commentaire?: string | null;
  }): DetailInstallation {
    return new DetailInstallation(
      obj.salleId,
      obj.salleNom,
      obj.estInstallée,
      obj.dateInstallation || null,
      obj.dateAssignation,
      obj.commentaire || null,
    );
  }
}

