import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        // Inject the UsersService to access user-related methods
        private readonly usersService: UsersService,
        // Inject the JwtService to handle JWT operations
        private readonly jwtService: JwtService,
    ) { }
    // Validate user credentials
    async validateUser(username: string, password: string): Promise<any> {
        try {
            const user = await this.usersService.findOne(username);

            if (user && (await bcrypt.compare(password, user.password))) {

                const { password, ...result } = user;
                return result;

            }
            return null;

        } catch (error) {
            this.logger.error(`Error validating user ${username}: ${error.message}`);
            throw new InternalServerErrorException('Error validating user');

        }
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }


    async register(username: string, password: string) {
        try {
            const existingUser = await this.usersService.findOne(username);
            if (existingUser) {
                throw new BadRequestException('User already exists');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Hashed Password:', hashedPassword);
            return this.usersService.create(username, hashedPassword);
        } catch (error) {
            this.logger.error(`Error registering user ${username}: ${error.message}`);
            throw new InternalServerErrorException('Error registering user');
        }
    }


    async getUserFromToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return await this.usersService.findOne(decoded.username);
        } catch (error) {
            throw new BadRequestException('Invalid token');
        }
    }


    async findUser(username: string) {
        return this.usersService.findOne(username);
    }
}
