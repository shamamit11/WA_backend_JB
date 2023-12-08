// whatsapp.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WhatsappGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('WhatsappGateway');

  @SubscribeMessage('msgToServer')
  handleMessage (client: Socket, text: string): void {
    console.log(text);
  }

  @SubscribeMessage('join')
  handleJoin (client: Socket, userId: string): void {
    client.join(userId);
    this.logger.log(`User ${ userId } joined room ${ userId }`);
  }


  sendDirectMessage (userId: string, message: any): void {
    this.server.to(userId).emit(userId, message);
  }

  afterInit (server: Server): void {
    this.logger.log('Socket.io server initialized');
  }

  handleConnection (client: Socket, ...args: any[]): void {
    this.logger.log(`Client connected: ${ client.id }`);
  }

  handleDisconnect (client: Socket): void {
    this.logger.log(`Client disconnected: ${ client.id }`);
  }
}
