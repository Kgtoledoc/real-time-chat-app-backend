import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: Date.now })
    createdAt: Date;

/*     @Prop({ required: true, unique: true })
    email: string; */

    /* @Prop({ default: null })
    avatarUrl: string; */

   /*  @Prop({ default: false })
    isActive: boolean; */
    
}
export const UserSchema = SchemaFactory.createForClass(User);