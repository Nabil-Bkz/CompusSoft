/**
 * Interface représentant le payload JWT
 * Attaché dans le token et validé par JwtStrategy
 */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  iat?: number; // timestamp d’émission
  exp?: number; // timestamp d’expiration
}
