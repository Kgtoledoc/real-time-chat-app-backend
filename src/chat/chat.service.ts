import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from 'src/chat/schema/message.schema';
import { EncryptionService } from 'src/common/encryption.service';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        private readonly encryptionService: EncryptionService,
    ) { }

    async createMessage(
        username: string,
        content: string,
        room?: string,
    ): Promise<Message> {
        console.log('Creating message:', { username, content, room });
        const encryptedContent = this.encryptionService.encrypt(content);
        const newMessage = new this.messageModel({
            username,
            content: encryptedContent,
            room,
            timestamp: new Date()
        });
        return newMessage.save()
    }

    async getRecentMessages(room?: string, limit: number = 50): Promise<Message[]> {
        console.log('Getting recent messages:', { room, limit });
        const query = room ? { room } : {};
        const messages = await this.messageModel.find(query).sort({ timestamp: -1 }).limit(limit).exec()

        return messages.map((message) => ({
            ...message,
            username: message.username,
            content: this.encryptionService.decrypt(message.content),
        }));

    }

    async getRoomMessages(room: string): Promise<Message[]> {
        console.log('Getting room messages:', { room });
        const messages = await this.messageModel.find({ room }).sort({ timestamp: -1 }).exec()
        console.log('Messages:', messages);
        return messages.map((message) => ({
            ...message,
            username: message.username,
            content: this.encryptionService.decrypt(message.content),
        }));
    }

    async deleteMessage(id: string) {
        return this.messageModel.findByIdAndDelete(id).exec()
    }

}
