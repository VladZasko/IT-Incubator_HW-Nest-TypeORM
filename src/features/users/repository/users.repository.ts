import { Injectable } from '@nestjs/common';
import { UsersViewModel } from '../models/output/UsersViewModel';
import { userMapper } from '../mappers/mappers';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../db/entitys/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async createUser(newUserDto: User): Promise<UsersViewModel> {
    const user = await this.usersRepository.save(newUserDto);

    return userMapper(user);
  }
  async deleteUserById(id: string): Promise<boolean> {
    const deleteUserById = await this.usersRepository.delete(id);

    return !!deleteUserById.affected;
  }
}
