import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from 'src/schema/message.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    ) { }

    async createMessage(
        username: string,
        content: string,
        room?: string,
    ): Promise<Message> {
        const newMessage = new this.messageModel({
            username,
            content,
            room,
            timestamp: new Date()
        });
        return newMessage.save()
    }

    async getRecentMessages(room?: string, limit: number = 50): Promise<Message[]> {
        const query = room ? { room } : {};
        return this.messageModel.find(query).sort({ timestamp: -1 }).limit(limit).exec()
    }

    async getRoomMessages(room: string): Promise<Message[]> {
        return this.messageModel.find({ room }).sort({ timestamp: 1 }).exec()
    }

    async deleteMessage(id: string) {
        return this.messageModel.findByIdAndDelete(id).exec()
    }

}
