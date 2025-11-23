import { SoftwareInstallationStatus } from './software-installation-status.vo';

/**
 * Value Object: ResumeInstallation
 * Résumé d'installation d'un logiciel dans une demande
 */
export class ResumeInstallation {
  constructor(
    public readonly logicielId: string,
    public readonly logicielNom: string,
    public readonly nombreSallesTotales: number,
    public readonly nombreSallesInstallées: number,
    public readonly nombreSallesNonInstallées: number,
    public readonly statutInstallation: SoftwareInstallationStatus,
    public readonly sallesInstallées: Array<{ id: string; nom: string }>,
    public readonly sallesNonInstallées: Array<{ id: string; nom: string }>,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.nombreSallesTotales !== this.nombreSallesInstallées + this.nombreSallesNonInstallées) {
      throw new Error('ResumeInstallation: nombreSallesTotales must equal sum of installed and non-installed');
    }
    if (this.nombreSallesInstallées !== this.sallesInstallées.length) {
      throw new Error('ResumeInstallation: nombreSallesInstallées must match sallesInstallées length');
    }
    if (this.nombreSallesNonInstallées !== this.sallesNonInstallées.length) {
      throw new Error('ResumeInstallation: nombreSallesNonInstallées must match sallesNonInstallées length');
    }
  }

  /**
   * Pourcentage d'installation
   */
  get pourcentageInstallation(): number {
    if (this.nombreSallesTotales === 0) {
      return 0;
    }
    return Math.round((this.nombreSallesInstallées / this.nombreSallesTotales) * 100);
  }

  /**
   * Vérifie si toutes les salles sont installées
   */
  get estCompletementInstalle(): boolean {
    return (
      this.statutInstallation === SoftwareInstallationStatus.TOUS_INSTALLES &&
      this.nombreSallesNonInstallées === 0
    );
  }
}

