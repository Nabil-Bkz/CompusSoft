import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception métier : Transition d'état invalide
 */
export class InvalidStateTransitionException extends HttpException {
  constructor(
    currentState: string,
    targetState: string,
    entityName: string = 'Entity',
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid state transition for ${entityName}: cannot transition from ${currentState} to ${targetState}`,
        error: 'Invalid State Transition',
        currentState,
        targetState,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

