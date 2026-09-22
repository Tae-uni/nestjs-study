import { Injectable } from '@nestjs/common';
import { LoggerService } from './user.logger.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
  ];

  findAllUsers(name: string = '') {
    this.logger.log('Finding all users');

    return this.users.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  findOneUser(id: number) {
    this.logger.log(`Finding user ${id}`);

    return this.users.find((user) => user.id === id) ?? null;
  }

  createUser(dto: CreateUserDto) {
    this.logger.log('Creating a user');

    const newUsers: User = { id: this.users.length + 1, email: '', ...dto };
    this.users.push(newUsers);

    return newUsers;
  }

  updateUser(id: number, dto:UpdateUserDto) {
    this.logger.log(`Updating user ${id}`);

    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return null;

    this.users[index] = {...this.users[index], ...dto };

    return this.users[index];
  }

  deleteUser(id: number) {
    this.logger.log(`Deleting user ${id}`);

    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return null;

    const [deleted] = this.users.splice(index, 1);

    return deleted;
  }
}

// UserController -> needs UserService
// UserService -> needs LoggerService
// Nest -> creates and connects everything