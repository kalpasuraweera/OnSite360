import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: 1,
      password: 'changeme',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      password: 'guess',
      email: 'maria@example.com',
      firstName: 'Maria',
      lastName: 'Smith',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findOne(email: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find((user) => user.email === email));
  }
}
