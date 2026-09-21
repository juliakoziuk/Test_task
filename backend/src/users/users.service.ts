import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { User } from './models/user.model';

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async create(data: NewUser): Promise<User> {
    try {
      const user = await this.userModel.create({ ...data });
      return this.findOne(user.id);
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw new ConflictException(`User with email ${data.email} already exists`);
      }
      throw err;
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.findAll({ order: [['id', 'ASC']] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /** Includes the password hash - only for credential checks. */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userModel.scope('withPassword').findOne({ where: { email } });
  }
}
