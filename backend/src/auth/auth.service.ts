import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/auth.types';
import { RegisterDto } from './dto/register.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private notifications: NotificationsService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.validateUserPassword(email, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email };
    const result = {
      accessToken: await this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          expiresIn: '1h',
        },
      ),
      refreshToken: await this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          expiresIn: '7d',
        },
      ),
      user,
    };

    // Update user's lastTokenAt timestamp (non-blocking)
    this.usersService.updateLastTokenAt(user.id).catch((err) => {
      console.error('Failed to update lastTokenAt on signIn:', err);
    });

    // Non-blocking: create a sign-in notification for the user
    // Do not fail the sign-in flow if notification creation fails
    this.notifications
      .sendNotification(
        user.id,
        'New sign-in',
        `A new sign-in to your OnSite360 account was detected at ${new Date().toLocaleString()}.`,
        { sendEmail: false },
      )
      .catch((err) => {
        // Minimal logging; don't surface to client
        console.error('Failed to create sign-in notification:', err);
      });

    return result;
  }

  async register(user: RegisterDto): Promise<any> {
    const existingUser = await this.usersService.findOne(user.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Save user to database through UsersService
    const savedUser = await this.usersService.create(user);
    const payload = { sub: savedUser.id, email: savedUser.email };

    // Update user's lastTokenAt timestamp (non-blocking)
    this.usersService.updateLastTokenAt(savedUser.id).catch((err) => {
      console.error('Failed to update lastTokenAt on register:', err);
    });

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

      // Update user's lastTokenAt timestamp (non-blocking)
      this.usersService.updateLastTokenAt(user.id).catch((err) => {
        console.error('Failed to update lastTokenAt on refreshToken:', err);
      });

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
