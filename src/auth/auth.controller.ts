import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user/user.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('full_name') fullName: string,
    @Body('role') role: string,
  ) {
    const user = await this.authService.register(
      username,
      password,
      fullName,
      role,
    );

    return {
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const verified = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (verified) {
      const user = await this.userService.findOne(loginDto.username);
      return this.authService.login(user);
    }
    return { message: 'Invalid credentials' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.userId;
    const targetUser = await this.userService.findById(userId);

    return {
      username: targetUser.username,
      full_name: targetUser.full_name,
      role: targetUser.role,
      created_at: targetUser.created_at,
    };
  }
}
