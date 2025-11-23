import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception métier : Violation de règle métier
 */
export class BusinessRuleViolationException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Business Rule Violation',
        details,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

