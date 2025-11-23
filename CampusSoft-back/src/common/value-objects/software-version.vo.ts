/**
 * Value Object: SoftwareVersion
 * Version d'un logiciel (semantic versioning)
 */
export class SoftwareVersion {
  constructor(
    public readonly version: string,
    public readonly major: number,
    public readonly minor: number,
    public readonly patch: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.version || this.version.trim() === '') {
      throw new Error('SoftwareVersion version cannot be empty');
    }
    if (this.major < 0 || this.minor < 0 || this.patch < 0) {
      throw new Error('SoftwareVersion numbers must be non-negative');
    }
  }

  /**
   * Parse une version string (ex: "1.2.3") en SoftwareVersion
   */
  static fromString(version: string): SoftwareVersion {
    const parts = version.split('.').map((p) => parseInt(p, 10));
    
    if (parts.length < 3 || parts.some(isNaN)) {
      throw new Error(`Invalid version format: ${version}. Expected format: major.minor.patch`);
    }
    
    return new SoftwareVersion(version, parts[0], parts[1], parts[2]);
  }

  /**
   * Compare deux versions
   * Returns: -1 si this < other, 0 si égal, 1 si this > other
   */
  compare(other: SoftwareVersion): number {
    if (this.major !== other.major) {
      return this.major > other.major ? 1 : -1;
    }
    if (this.minor !== other.minor) {
      return this.minor > other.minor ? 1 : -1;
    }
    if (this.patch !== other.patch) {
      return this.patch > other.patch ? 1 : -1;
    }
    return 0;
  }

  /**
   * Vérifie si cette version est supérieure à une autre
   */
  isGreaterThan(other: SoftwareVersion): boolean {
    return this.compare(other) > 0;
  }

  /**
   * Vérifie si cette version est inférieure à une autre
   */
  isLessThan(other: SoftwareVersion): boolean {
    return this.compare(other) < 0;
  }

  /**
   * Retourne la représentation string
   */
  toString(): string {
    return this.version;
  }
}

