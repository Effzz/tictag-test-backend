import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MongooseError } from 'mongoose';
import { Response } from 'express';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();
      const message =
        typeof responseBody === 'string'
          ? responseBody
          : (responseBody as any).message || 'Internal server error';

      return response.status(status).json({
        status,
        timestamp: new Date().toISOString(),
        message,
        ...(typeof responseBody !== 'string' ? { details: responseBody } : {}),
      });
    }

    // MongooseError
    if (exception instanceof MongooseError) {
      const status = HttpStatus.BAD_REQUEST;
      const message = exception.message || 'Database error';

      return response.status(status).json({
        status,
        timestamp: new Date().toISOString(),
        message,
        details:
          exception instanceof MongooseError
            ? this.formatMongooseError(exception)
            : undefined,
      });
    }

    // Others
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = (exception as Error).message || 'Internal server error';

    return response.status(status).json({
      status,
      timestamp: new Date().toISOString(),
      message,
      details: process.env.NODE_ENV === 'development' ? exception : undefined,
    });
  }

  private formatMongooseError(error: MongooseError): string {
    if (error.name === 'ValidationError') {
      return Object.values((error as any).errors)
        .map((err: any) => err.message)
        .join(', ');
    }
    return error.message;
  }
}
