/**
 * Interface représentant la paire de tokens JWT + refresh
 */
export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}
