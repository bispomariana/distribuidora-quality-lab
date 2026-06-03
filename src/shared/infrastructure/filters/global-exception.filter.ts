import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  DomainException,
  ValidationException,
  NotFoundException,
  ConflictException,
  BusinessRuleException,
} from '@shared/domain/exceptions';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = this.buildErrorResponse(exception);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof ValidationException) {
      return this.buildDomainErrorResponse(exception, HttpStatus.BAD_REQUEST, 'Bad Request');
    }

    if (exception instanceof NotFoundException) {
      return this.buildDomainErrorResponse(exception, HttpStatus.NOT_FOUND, 'Not Found');
    }

    if (exception instanceof ConflictException) {
      return this.buildDomainErrorResponse(exception, HttpStatus.CONFLICT, 'Conflict');
    }

    if (exception instanceof BusinessRuleException) {
      return this.buildDomainErrorResponse(
        exception,
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Unprocessable Entity',
      );
    }

    if (exception instanceof DomainException) {
      return this.buildDomainErrorResponse(
        exception,
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Unprocessable Entity',
      );
    }

    if (exception instanceof HttpException) {
      return this.buildHttpExceptionResponse(exception);
    }

    return this.buildInternalErrorResponse();
  }

  private buildDomainErrorResponse(
    exception: DomainException,
    statusCode: number,
    error: string,
  ): ErrorResponse {
    const response: ErrorResponse = {
      statusCode,
      error,
      message: exception.message,
      timestamp: new Date().toISOString(),
    };

    if (exception.details) {
      response.details = exception.details;
    }

    return response;
  }

  private buildHttpExceptionResponse(exception: HttpException): ErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const response: ErrorResponse = {
      statusCode: status,
      error: this.getHttpErrorName(status),
      message: '',
      timestamp: new Date().toISOString(),
    };

    if (typeof exceptionResponse === 'string') {
      response.message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const body = exceptionResponse as Record<string, unknown>;
      response.message = (body['message'] as string) ?? 'An error occurred';

      if (Array.isArray(body['message'])) {
        response.message = 'Validation failed';
        response.details = { errors: body['message'] as unknown as Record<string, unknown> };
      }
    }

    return response;
  }

  private buildInternalErrorResponse(): ErrorResponse {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };
  }

  private getHttpErrorName(status: number): string {
    const names: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };
    return names[status] ?? 'Error';
  }
}
