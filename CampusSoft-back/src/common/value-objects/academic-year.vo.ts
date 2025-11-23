/**
 * Value Object: AcademicYear
 * Représente une année universitaire
 */
export class AcademicYear {
  constructor(
    public readonly year: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.year || this.year.length !== 4) {
      throw new Error('AcademicYear year must be 4 characters');
    }
    if (this.startDate >= this.endDate) {
      throw new Error('AcademicYear startDate must be before endDate');
    }
  }

  /**
   * Crée une année universitaire à partir d'une année (ex: "2025")
   */
  static fromYear(year: string): AcademicYear {
    const yearInt = parseInt(year, 10);
    if (isNaN(yearInt) || yearInt < 2000 || yearInt > 2100) {
      throw new Error('Invalid year for AcademicYear');
    }
    
    // Année universitaire: septembre année N à août année N+1
    const startDate = new Date(yearInt, 8, 1); // 1er septembre
    const endDate = new Date(yearInt + 1, 7, 31); // 31 août
    
    return new AcademicYear(year, startDate, endDate);
  }

  /**
   * Crée une année universitaire pour l'année en cours
   */
  static current(): AcademicYear {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Si on est avant septembre, l'année universitaire a commencé l'année précédente
    if (now.getMonth() < 8) {
      return AcademicYear.fromYear((currentYear - 1).toString());
    }
    return AcademicYear.fromYear(currentYear.toString());
  }

  /**
   * Vérifie si une date est dans cette année universitaire
   */
  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  /**
   * Retourne la représentation string (ex: "2025-2026")
   */
  toString(): string {
    const startYear = this.startDate.getFullYear();
    const endYear = this.endDate.getFullYear();
    return `${startYear}-${endYear}`;
  }
}

