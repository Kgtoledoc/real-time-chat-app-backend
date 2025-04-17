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

  private users: Map<string, {username: string, room?: string}> = new Map()

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    const userData = this.users.get(client.id);
    if(userData){
      const { username, room } = userData;
      this.users.delete(client.id);
      this.server.to(room!).emit('userLeft', username);
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
