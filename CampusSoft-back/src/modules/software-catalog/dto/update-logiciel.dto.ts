import { PartialType } from '@nestjs/swagger';
import { CreateLogicielDto } from './create-logiciel.dto';

/**
 * DTO pour mettre à jour un logiciel
 */
export class UpdateLogicielDto extends PartialType(CreateLogicielDto) {}

