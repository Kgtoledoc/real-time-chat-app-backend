import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io'
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  }
}
)

@UseGuards(JwtAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server: Server;

  private users: Map<string, {username: string, room?: string}> = new Map()

  constructor(private chatService: ChatService, private jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token){
        throw new UnauthorizedException('Token not provided');
      }

      const decoded = this.jwtService.verify(token);
      const user = decoded.username;

      this.users.set(client.id, {username: user});
      console.log(`User ${user} connected with ID: ${client.id}`);
    } catch (error) {
      console.error('Error during connection:', error.message);
      client.disconnect();
      throw new UnauthorizedException('Invalid token');
    }

  }

  handleDisconnect(client: Socket) {
    const userData = this.users.get(client.id);
    if(userData){
      const { username, room } = userData;
      this.users.delete(client.id);
      if (room) {
        this.server.to(room).emit('userLeft', username);
      }
      console.log(`User ${username} disconnected with ID: ${client.id}`);
    }
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, data: {username: string; room?: string}) {
    const { username, room } = data;
    this.users.set(client.id, {username, room});

    if (room) {
      client.join(room);
      // Enviar mensajes recientes de la sala al usuario
      const recentMessages = await this.chatService.getRoomMessages(room);
      client.emit('recentMessages', recentMessages);
    }

    this.server.to(room!).emit('userJoined', username);
  }


  @SubscribeMessage('message')
  async handleMessage(
    client: Socket, data: { content: string; room?: string },
  ) {
    const userData = this.users.get(client.id);
    if (userData) {
      const { username, room } = userData;
      const savedMessage = await this.chatService.createMessage(
        username,
        data.content,
        room,
      );

      const messageData = {
        id: savedMessage._id,
        username,
        content: data.content,
        timestamp: savedMessage.timestamp,
        room,
      };

      if (room) {
        this.server.to(room).emit('message', messageData);
      } else {
        this.server.emit('message', messageData);
      }
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, room: string){
    const userData = this.users.get(client.id);
    if(userData) {
      const oldRoom = userData.room;
      if (oldRoom) {
        client.leave(oldRoom);
      }
      userData.room = room;
      this.users.set(client.id, userData);
      client.join(room);

      const recentMessages = await this.chatService.getRoomMessages(room);
      client.emit('recentMessages', recentMessages);
    }

  }

    
}
