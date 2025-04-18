import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async create(username: string, password: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10); // TODO: Hash the password before saving
        const newUser = new this.userModel({
            username,
            password: hashedPassword,
            createdAt: new Date(),
        });
        return newUser.save();
    }

    async findOne(username: string): Promise<User | null> {
        return this.userModel.findOne({ username }).exec();
    }
}

