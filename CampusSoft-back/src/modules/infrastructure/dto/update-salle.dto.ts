import { PartialType } from '@nestjs/swagger';
import { CreateSalleDto } from './create-salle.dto';

/**
 * DTO pour mettre à jour une salle
 */
export class UpdateSalleDto extends PartialType(CreateSalleDto) {}

