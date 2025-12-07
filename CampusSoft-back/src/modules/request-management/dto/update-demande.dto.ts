import { PartialType } from '@nestjs/swagger';
import { CreateDemandeDto } from './create-demande.dto';

/**
 * DTO pour mettre à jour une demande
 */
export class UpdateDemandeDto extends PartialType(CreateDemandeDto) {}

