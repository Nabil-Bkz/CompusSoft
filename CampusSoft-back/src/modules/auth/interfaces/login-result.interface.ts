import { AuthenticatedUser } from './authenticated-user.interface';
import { TokenPair } from './token-pair.interface';

/**
 * Interface représentant le résultat d’une connexion réussie
 */
export interface LoginResult {
  user: AuthenticatedUser;
  tokens: TokenPair;
}
