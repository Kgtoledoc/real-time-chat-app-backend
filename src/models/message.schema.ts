import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  content: String,
  timestamp: { type: Date, default: Date.now },
});