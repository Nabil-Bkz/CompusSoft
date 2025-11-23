import { PartialType } from '@nestjs/swagger';
import { CreateDepartementDto } from './create-departement.dto';

/**
 * DTO pour mettre à jour un département
 */
export class UpdateDepartementDto extends PartialType(CreateDepartementDto) {}

