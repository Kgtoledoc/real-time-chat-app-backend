import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        // Inject the UsersService to access user-related methods
        private readonly usersService: UsersService,
        // Inject the JwtService to handle JWT operations
        private readonly jwtService: JwtService,
    ) {}
    // Validate user credentials
    async validateUser(username: string, password: string): Promise<any> {  
        console.log('Validating user:', username);
        const user = await this.usersService.findOne(username);
        console.log('User:', user);
        console.log('Password:', password);
        console.log('Hashed Password:', user?.password);
        console.log('Password Match:', user?.password ? await bcrypt.compare("test", user.password) : false);
        if (user && (await bcrypt.compare(password, user.password))) {
            // Exclude the password field from the returned user object
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async register(username: string, password: string) {
        const existingUser = await this.usersService.findOne(username);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.usersService.create(username, hashedPassword);
    }
    async getUserFromToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return await this.usersService.findOne(decoded.username);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}
