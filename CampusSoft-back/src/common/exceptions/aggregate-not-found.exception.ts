import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception métier : Aggregate non trouvé
 */
export class AggregateNotFoundException extends HttpException {
  constructor(aggregateName: string, id: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${aggregateName} with id ${id} not found`,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

