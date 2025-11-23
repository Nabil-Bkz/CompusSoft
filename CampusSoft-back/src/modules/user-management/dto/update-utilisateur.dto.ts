import { PartialType } from '@nestjs/swagger';
import { CreateUtilisateurDto } from './create-utilisateur.dto';

/**
 * DTO pour mettre à jour un utilisateur
 */
export class UpdateUtilisateurDto extends PartialType(CreateUtilisateurDto) {}

