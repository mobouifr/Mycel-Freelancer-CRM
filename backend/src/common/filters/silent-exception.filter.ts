import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

/**
 * Global exception filter that swallows all console output for expected HTTP
 * errors (4xx / 5xx). NestJS's default BaseExceptionFilter logs every thrown
 * HttpException — this replaces that behaviour with a silent response.
 */
@Catch()
export class SilentExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body   = exception.getResponse();
      response.status(status).json(
        typeof body === 'string' ? { message: body, statusCode: status } : body,
      );
      return;
    }

    // Non-HTTP exception (unexpected crash) — return 500 without leaking details
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:    'Internal server error',
    });
  }
}
