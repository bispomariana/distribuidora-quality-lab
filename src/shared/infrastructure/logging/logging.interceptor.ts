import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const method = request.method;
    const path = request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const response = httpContext.getResponse<Response>();
          const duration_ms = Date.now() - startTime;

          this.logger.logRequest({
            level: 'info',
            method,
            path,
            status_code: response.statusCode,
            duration_ms,
          });
        },
        error: (error: { status?: number; getStatus?: () => number }) => {
          const duration_ms = Date.now() - startTime;
          const status_code =
            typeof error?.getStatus === 'function' ? error.getStatus() : (error?.status ?? 500);

          this.logger.logRequest({
            level: 'error',
            method,
            path,
            status_code,
            duration_ms,
          });
        },
      }),
    );
  }
}
