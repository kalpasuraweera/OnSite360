import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<any> {
    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    const user = {
      userId: Date.now(), // Simple ID generation for demo purposes
      email,
      password: password, // In a real app, hash the password before saving
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Here you would typically save the user to the database
    // For this example, we will just return the user object
    return {
      access_token: await this.jwtService.signAsync({
        sub: user.userId,
        email: user.email,
      }),
      user,
    };
  }
}
