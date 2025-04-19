import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type MessageDocument = Message & Document;

@Schema({ timestamps: true})
export class Message {
  _id: Types.ObjectId;
  
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop()
  room?: string;

}

export const MessageSchema = SchemaFactory.createForClass(Message);


