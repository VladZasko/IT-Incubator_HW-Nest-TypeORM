import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateAuthUserPassModel } from './models/input/CreateAuthUserModel';
import { UsersAuthViewModel } from './models/output/UsersViewModel';
import { LoginOrEmailModel } from './models/input/LoginAuthUserModel';
import { CreatePostBlogModel } from './models/input/ConfirmCodeModel';
import { User } from '../../db/entitys/user.entity';
import { EmailConfirmation } from '../../db/entitys/email.confirmatiom.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepository: Repository<EmailConfirmation>,
  ) {}
  async createUser(
    accountData: any,
    emailConfirmation: any,
  ): Promise<UsersAuthViewModel> {
    // const query = `
    //         INSERT INTO public."Users"(
    //         "login", "email", "createdAt", "passwordHash", "passwordSalt", "id")
    //         VALUES ($1, $2, $3, $4, $5, $6)
    //         RETURNING "login", "email", "createdAt", "id";
    //         `;
    //
    // const user = await this.dataSource.query(query, [
    //   createData.accountData.login,
    //   createData.accountData.email,
    //   createData.accountData.createdAt,
    //   createData.accountData.passwordHash,
    //   createData.accountData.passwordSalt,
    //   createData.accountData.id,
    // ]);
    //
    // const query2 = `
    //         INSERT INTO public."EmailConfirmation"(
    //         "userId", "confirmationCode", "expirationDate", "isConfirmed")
    //         VALUES ($1, $2, $3, $4);`;
    //
    // const emailConfirmation = await this.dataSource.query(query2, [
    //   createData.accountData.id,
    //   createData.emailConfirmation.confirmationCode,
    //   createData.emailConfirmation.expirationDate,
    //   createData.emailConfirmation.isConfirmed,
    // ]);
    //
    // return user;

    const user = await this.usersRepository.save(accountData);
    await this.emailConfirmationRepository.save(emailConfirmation);

    return user;
  }

  async updateConfirmation(id: string) {
    const query = `
            UPDATE public."EmailConfirmation"
            SET  "isConfirmed" = true
            WHERE "userId" = $1;
            `;

    await this.dataSource.query(query, [id]);

    return true;
  }

  async newConfirmationCode(
    id: string,
    data: Date,
    newConfirmationCode: string,
  ) {
    const query = `
            UPDATE public."EmailConfirmation"
            SET  "confirmationCode"= $2, "expirationDate" = $3
            WHERE "userId" = $1
            `;

    await this.dataSource.query(query, [id, newConfirmationCode, data]);

    return true;
  }

  async updatePassword(user: any, salt: string, hash: string) {
    const query = `
            UPDATE public."Users"
            SET "passwordHash"= $3, "passwordSalt"= $2
            WHERE "id" = $1;
            `;

    await this.dataSource.query(query, [user.userId, salt, hash]);

    return true;
  }

  async passwordRecovery(
    id: string,
    passwordRecoveryCode: string,
    expirationDate: Date,
  ) {
    const query = `
            INSERT INTO public."PasswordRecovery"(
            "userId", "expirationDate", "recoveryCode")
            VALUES ($1, $2, $3);
            `;

    const user = await this.dataSource.query(query, [
      id,
      expirationDate,
      passwordRecoveryCode,
    ]);

    return true;
  }

  async deleteUserById(id: string): Promise<boolean> {
    const query = `
            DELETE FROM public."Users"
            WHERE "id" = $1;
            `;

    await this.dataSource.query(query, [id]);

    return true;
  }

  async createRefreshTokensMeta(refreshTokenDto: any) {
    const query = `
            INSERT INTO public."RefreshTokenMeta"(
            "issuetAt", "deviceId", "ip", "deviceName", "userId", "id")
            VALUES ($1, $2, $3, $4, $5, $6);
            `;

    const user = await this.dataSource.query(query, [
      refreshTokenDto.issuedAt,
      refreshTokenDto.deviceId,
      refreshTokenDto.ip,
      refreshTokenDto.deviseName,
      refreshTokenDto.userId,
      refreshTokenDto.id,
    ]);

    return true;
  }
  async updateRefreshTokensMeta(refreshTokenDto: any) {
    const query = `
            UPDATE public."RefreshTokenMeta"
            SET "issuetAt"= $2
            WHERE "deviceId"= $1;
            `;

    await this.dataSource.query(query, [
      refreshTokenDto.deviceId,
      refreshTokenDto.issuedAt,
    ]);

    return true;
  }
  async deleteRefreshTokensMeta(deviceId: string) {
    const query = `
            DELETE FROM public."RefreshTokenMeta"
            WHERE "deviceId" = $1;
            `;

    await this.dataSource.query(query, [deviceId]);

    return true;
  }

  async findUserByConfirmationCode(emailConfirmationCode: string) {
    const query = `
            SELECT *
            FROM public."EmailConfirmation"
            WHERE "confirmationCode" = $1
            `;

    const result = await this.dataSource.query(query, [emailConfirmationCode]);

    return result[0];
  }

  async findUserByRecoveryCode(recoveryCode: string) {
    const query = `
            SELECT *
            FROM public."PasswordRecovery"
            WHERE "recoveryCode" = $1
            `;

    const result = await this.dataSource.query(query, [recoveryCode]);

    return result[0];
  }

  async findByLoginOrEmail(createData: LoginOrEmailModel) {
    // const query = `
    //         SELECT u.*, ec.*
    //         FROM "Users" as u
    //         LEFT JOIN "EmailConfirmation" as ec
    //         ON u."id" = ec."userId"
    //         WHERE "login" like $1 OR "email" like $2;
    //         `;
    //
    // const findByLoginOrEmail = await this.dataSource.query(query, [
    //   createData.login,
    //   createData.email,
    // ]);
    //
    // console.log(findByLoginOrEmail[0]);

    const user = this.usersRepository.findOne({
      where: [{ email: createData.email }, { login: createData.login }],
    });

    return user;
  }

  async findByEmail(email: string) {
    const query = `
            SELECT *
            FROM "Users" as u
            WHERE "email" like $1 ;
            `;

    const findByEmail = await this.dataSource.query(query, [email]);

    console.log(findByEmail[0]);

    return findByEmail[0];
  }

  // async updateUser(user: User): Promise<boolean> {
  //     await this.usersRepository.save(user);
  //
  //     return true;
  // }
  //
  // async getUserById(id: string): Promise<User> {
  //     return this.usersRepository.findOneBy({
  //         id: id,
  //     });
  // }
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
