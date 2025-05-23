import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WsException, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io'
import { Logger, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { WsExceptionFilter } from 'src/common/filters/ws-exception.filter';
import { EncryptionService } from 'src/common/encryption.service';

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*',
  }
}
)

@UseGuards(JwtAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  private users: Map<string, { username: string, room?: string }> = new Map()

  constructor(private chatService: ChatService, private jwtService: JwtService, private readonly encryptionService: EncryptionService,) { }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      console.log('Token:', token);
      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }
      const decoded = this.jwtService.verify(token);
      const user = decoded.username;

      this.users.set(client.id, { username: user });
      this.broadcastOnlineUsers();
      this.logger.log(`User ${user} connected with ID: ${client.id}`);
    } catch (error) {
      this.logger.error('Error during connection:', error.message);
      client.disconnect();
      throw new UnauthorizedException('Invalid token');
    }

  }

  handleDisconnect(client: Socket) {
    const userData = this.users.get(client.id);
    if (userData) {
      const { username, room } = userData;
      this.users.delete(client.id);
      if (room) {
        this.server.to(room).emit('userLeft', username);
      }
      this.broadcastOnlineUsers();
      this.logger.log(`User ${username} disconnected with ID: ${client.id}`);
    }
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, data: { username: string; room?: string }) {
    const { username, room } = data;
    this.users.set(client.id, { username, room });

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
    try{
    const userData = this.users.get(client.id);
    if (!userData) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (!data.content) {
      throw new WsException('Message content is required');
    }
    if (data.content.length > 500) {
      throw new Error('Message content exceeds maximum length of 500 characters');
    }
    if (data.room && data.room.length > 50) {
      throw new Error('Room name exceeds maximum length of 50 characters');
    }

    const { username } = userData;
    let room = userData.room;
    if (room == undefined) {
      room = data.room;
    }
    const savedMessage = await this.chatService.createMessage(
      username,
      data.content,
      room,
    );

    const messageData = {
      id: savedMessage._id,
      username,
      content: this.encryptionService.decrypt(savedMessage.content),
      timestamp: savedMessage.timestamp,
      room,
    };

    if (room) {
      this.server.to(room).emit('message', messageData);
    } else {
      this.server.emit('message', messageData);
    }
  } catch (error) { 
    this.logger.error(`Error handling message: ${error.message}`);
    throw error;
  }
  }


  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, room: string) {
    const userData = this.users.get(client.id);
    if (userData) {
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

  sendFile(roomId: string, fileData: any) {
    this.server.to(roomId).emit('newFile', fileData);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody() data: { to: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userData = this.users.get(client.id);
    if (!userData) {
      throw new UnauthorizedException('User not authenticated');
    }
    const { username } = userData;
    const recipientSocketId = Array.from(this.users.entries()).find(([_, user]) => user.username === data.to)?.[0];

    if (!recipientSocketId) {
      throw new WsException('Recipient not connected');
    }
    await this.chatService.createPrivateMessage(userData.username, data.to, data.content);

    client.to(recipientSocketId).emit('privateMessage', {
      from: username,
      content: data.content,
    });

  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: {room?: string, isTyping: boolean},
    @ConnectedSocket() client: Socket,
  ) {
    const userData = this.users.get(client.id);
    if (!userData) {
      throw new UnauthorizedException('User not authenticated');
    }
    const { username } = userData;
    const { room, isTyping } = data;
    if (room) {
      // Notificar a los usuarios de la sala que el usuario esta escribiendo
      this.server.to(room).emit('typing', { username, isTyping });
    } else {
      // Notificar a todos los usuarios que el usuario esta escribiendo
      this.server.emit('typing', { username, isTyping });
    }
  }



  private broadcastOnlineUsers() {
    const onlineUsers = Array.from(this.users.values()).map(user => user.username);
    this.server.emit('onlineUsers', onlineUsers);
  }


}
