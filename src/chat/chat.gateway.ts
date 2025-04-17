import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: '*',
  }
}
)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server: Server;
  private users: Map<string, string> = new Map()

  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: any) {
    const username = this.users.get(client.id);
    this.users.delete(client.id);
    this.server.emit('userLeft', username);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, username: string) {
    this.users.set(client.id, username);
    this.server.emit('userJoined', username);
  }
  @SubscribeMessage('message')
  handleMessage(client: Socket, message: string) {
    const username = this.users.get(client.id);
    this.server.emit('message', {
      username,
      message,
      timestamp: new Date()
    })
  }
}
