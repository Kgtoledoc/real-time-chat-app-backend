import { Catch, ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';


@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const error = exception.getError();
    const message = typeof error === 'string' ? error : (error as { message: string }).message;

    this.logger.error(`WebSocket Error: ${message}`);
    client.emit('error', { message });
  }
}