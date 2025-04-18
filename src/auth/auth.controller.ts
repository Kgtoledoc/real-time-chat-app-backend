import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly usersService: UsersService, // Inject the AuthService to handle authentication logic 
  ) {}
  
  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    return this.authService.register(username, password);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login (@Request() req: any) {
    return this.authService.login(req.user);
  }
}
