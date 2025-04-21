import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/chat/schema/message.schema';
import { JwtModule } from '@nestjs/jwt';
import { EncryptionService } from 'src/common/encryption.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CommonModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey'
    }),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule { }
