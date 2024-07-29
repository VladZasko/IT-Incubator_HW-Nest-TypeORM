import { Injectable } from '@nestjs/common';
import { UsersAuthViewModel } from '../models/output/UsersViewModel';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../db/entitys/user.entity';
@Injectable()
export class AuthQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async getUserById(id: string): Promise<UsersAuthViewModel | null> {
    return this.usersRepository
      .createQueryBuilder('u')
      .select(['u.login', 'u.id', 'u.email', 'u.createdAt'])
      .where('u.id = :id', { id })
      .getOne();
  }
  async findByLoginOrEmail(loginOrEmail: string) {
    return this.usersRepository
      .createQueryBuilder('u')
      .select(['u.login', 'u.id', 'u.email', 'u.createdAt', 'ec', 'pc'])
      .leftJoinAndSelect('u.emailConfirmation', 'ec')
      .leftJoinAndSelect('u.passwordRecovery', 'pc')
      .where('u.login LIKE :searchTerm', { searchTerm: `%${loginOrEmail}%` })
      .orWhere('u.email LIKE :searchTerm', { searchTerm: `%${loginOrEmail}%` })
      .getOne();
  }
}
