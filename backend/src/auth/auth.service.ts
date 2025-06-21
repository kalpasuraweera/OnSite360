import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/auth.types';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.validateUserPassword(email, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          expiresIn: '1h', // Set access token expiration
        },
      ),
      refreshToken: await this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          expiresIn: '7d', // Set refresh token expiration
        },
      ),
      user,
    };
  }

  async register(user: RegisterDto): Promise<any> {
    const existingUser = await this.usersService.findOne(user.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Save user to database through UsersService
    const savedUser = await this.usersService.create(user);
    const payload = { sub: savedUser.id, email: savedUser.email };

    return {
      accessToken: await this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          expiresIn: '1h', // Set access token expiration
        },
      ),
      refreshToken: await this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          expiresIn: '7d', // Set refresh token expiration
        },
      ),
      user: savedUser,
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      // Verify the refresh token
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      // Check if user still exists and is valid
      const user = await this.usersService.findOne(payload.email);
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Generate new tokens
      const newPayload = { sub: user.id, email: user.email };

      return {
        accessToken: await this.jwtService.signAsync(
          { ...newPayload, type: 'access' },
          {
            expiresIn: '1h', // Set access token expiration
          },
        ),
        refreshToken: await this.jwtService.signAsync(
          { ...newPayload, type: 'refresh' },
          {
            expiresIn: '7d', // Set refresh token expiration
          },
        ),
        user,
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout(userId: string): Promise<{ success: boolean }> {
    try {
      // Here you would implement token revocation logic
      // For example, add the token to a blacklist or
      // invalidate the user's sessions in your database

      // For now, we'll return a success response
      // When you implement session management, you can update this method
      // to properly invalidate tokens
      console.log(`User ${userId} logged out successfully.`);
      return Promise.resolve({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      return Promise.resolve({ success: false });
    }
  }

  //TODO: Implement session management for revoking tokens
}
