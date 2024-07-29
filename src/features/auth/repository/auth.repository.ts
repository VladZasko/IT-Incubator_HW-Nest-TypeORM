import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { UsersAuthViewModel } from '../models/output/UsersViewModel';
import { LoginOrEmailModel } from '../models/input/LoginAuthUserModel';
import { User } from '../../../db/entitys/user.entity';
import { EmailConfirmation } from '../../../db/entitys/email.confirmatiom.entity';
import { PasswordRecovery } from '../../../db/entitys/password.recovery.entity';
import { RefreshTokenMeta } from '../../../db/entitys/refresh.token.meta.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepository: Repository<EmailConfirmation>,
    @InjectRepository(PasswordRecovery)
    private readonly passwordRecoveryRepository: Repository<PasswordRecovery>,
    @InjectRepository(RefreshTokenMeta)
    private readonly refreshTokenMetaRepository: Repository<RefreshTokenMeta>,
  ) {}
  async createUser(
    newUserDto: User,
    emailConfirmationDto: EmailConfirmation,
  ): Promise<UsersAuthViewModel> {
    const user = await this.usersRepository.save(newUserDto);

    await this.emailConfirmationRepository.save(emailConfirmationDto);

    return user;
  }

  async updateConfirmation(
    emailConfirmationDto: EmailConfirmation,
  ): Promise<boolean> {
    return !!(await this.emailConfirmationRepository.save(
      emailConfirmationDto,
    ));
  }

  async newConfirmationCode(emailConfirmationDto: EmailConfirmation) {
    return !!(await this.emailConfirmationRepository.save(
      emailConfirmationDto,
    ));
  }

  async updatePassword(user: User): Promise<boolean> {
    return !!(await this.usersRepository.save(user));
  }

  async passwordRecovery(passwordRecoveryDto: PasswordRecovery) {
    return !!(await this.passwordRecoveryRepository.save(passwordRecoveryDto));
  }

  async deleteUserById(id: string): Promise<boolean> {
    const deleteUserById = await this.usersRepository.delete(id);

    return !!deleteUserById.affected;
  }

  async createRefreshTokensMeta(refreshTokenDto: RefreshTokenMeta) {
    return this.refreshTokenMetaRepository.save(refreshTokenDto);
  }

  async findRefreshTokensMeta(
    deviceId: string,
  ): Promise<RefreshTokenMeta | null> {
    return this.refreshTokenMetaRepository.findOneBy({
      deviceId: deviceId,
    });
  }
  async updateRefreshTokensMeta(refreshTokenDto: any) {
    return this.refreshTokenMetaRepository.save(refreshTokenDto);
  }
  async deleteRefreshTokensMeta(deviceId: string) {
    const deleteRefreshTokensMeta =
      await this.refreshTokenMetaRepository.delete({ deviceId: deviceId });

    return !!deleteRefreshTokensMeta.affected;
  }

  async findUserByConfirmationCode(
    emailConfirmationCode: string,
  ): Promise<EmailConfirmation | null> {
    return this.emailConfirmationRepository.findOneBy({
      confirmationCode: emailConfirmationCode,
    });
  }

  async findConfirmationCodeUserByUserId(
    userId: string,
  ): Promise<EmailConfirmation | null> {
    return this.emailConfirmationRepository.findOneBy({
      userId: userId,
    });
  }

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<PasswordRecovery | null> {
    // const query = `
    //         SELECT *
    //         FROM public."PasswordRecovery"
    //         WHERE "recoveryCode" = $1
    //         `;
    //
    // const result = await this.dataSource.query(query, [recoveryCode]);
    //
    // return result[0];

    return this.passwordRecoveryRepository.findOneBy({
      recoveryCode: recoveryCode,
    });
  }

  async findByLoginOrEmail(
    loginOrEmailDto: LoginOrEmailModel,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [
        { email: loginOrEmailDto.email },
        { login: loginOrEmailDto.login },
      ],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({
      email: email,
    });
  }

  // async updateUser(user: User): Promise<boolean> {
  //     await this.usersRepository.save(user);
  //
  //     return true;
  // }
  //
  async getUserById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({
      id: id,
    });
  }
  //
  // async getAllUser() {
  //     const user = await this.usersRepository
  //         .createQueryBuilder('user')
  //         .leftJoin('user.post', 'post')
  //         .select('user')
  //         .addSelect('post')
  //         .where((qb) => {
  //             const subQb = qb
  //                 .subQuery()
  //                 .select('id')
  //                 .from(Post, 'post1')
  //                 .where('post1.userId = user.id')
  //                 .orderBy('post1.createdAt')
  //                 .limit(1)
  //                 .getQuery();
  //             return 'post.id =' + subQb;
  //         })
  //         .leftJoin('user.likes', 'like')
  //         .addSelect((qb) => {
  //             return qb
  //                 .select('COUNT(1)')
  //                 .from(Like, 'like')
  //                 .where('like.postId = post.id')
  //                 .groupBy('like.postId');
  //         }, 'like')
  //         .getRawMany();
  //
  //     //return user.map((u) => mapper(u));
  //     return this.usersRepository
  //         .createQueryBuilder('user')
  //         .leftJoinAndSelect(
  //             'user.post',
  //             'post',
  //             'post.id IN (SELECT l.postId FROM "like" l WHERE l.postId = post.id)',
  //         )
  //         .leftJoinAndSelect('post.likes', 'like')
  //         .addSelect('COUNT(like.id)', 'likeCount')
  //         .groupBy('user.id, post.id')
  //         .getMany();
  // }
  //
  // async findByEmail(email: string): Promise<User> {
  //     return this.usersRepository.findOneBy({
  //         email: email,
  //     });
  // }
}
