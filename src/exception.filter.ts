import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (process.env.envorinment !== 'production') {
      response
        .status(500)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send('some error occurred');
    }
  }
}
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 500 && process.env.envorinment !== 'production') {
      response.status(status).json(exception);
    }

    if (status === HttpStatus.BAD_REQUEST) {
      const errorResponse = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();
      if (Array.isArray(responseBody.message)) {
        (responseBody.message as string[]).forEach((m) =>
          // @ts-ignore
          errorResponse.errorsMessages.push(m),
        );
      } else {
        // @ts-ignore
        errorResponse.errorsMessages.push(responseBody.message);
      }
      response.status(status).json(errorResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
