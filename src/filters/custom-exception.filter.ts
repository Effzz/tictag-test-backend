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

    // Check if it's an instance of HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message || 'Internal server error';

      return response.status(status).json({
        status: status,
        timestamp: new Date().toISOString(),
        message: message,
      });
    }

    if (exception instanceof MongooseError) {
      const status = HttpStatus.BAD_REQUEST;

      return response.status(status).json({
        status: status,
        timestamp: new Date().toISOString(),
        message: exception.message,
      });
    }

    // Handle other unknown exceptions
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    return response.status(status).json({
      status: status,
      timestamp: new Date().toISOString(),
      message: 'Internal server error',
    });
  }
}
