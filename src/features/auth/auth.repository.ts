import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDBType, UserDocument } from '../../db/schemes/users.schemes';
import {
  RefreshTokensMetaDBType,
  RefreshTokensMetaDocument,
} from '../../db/schemes/token.schemes';
import { CreateAuthUserPassModel } from './models/input/CreateAuthUserModel';
import { UsersAuthViewModel } from './models/output/UsersViewModel';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(UserDBType.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshTokensMetaDBType.name)
    private refreshTokenMetaModel: Model<RefreshTokensMetaDocument>,
  ) {}
  async createUser(
    createData: CreateAuthUserPassModel,
  ): Promise<UsersAuthViewModel> {
    const user = await this.userModel.create({ ...createData });

    return {
      createdAt: createData.accountData.createdAt,
      email: createData.accountData.email,
      login: createData.accountData.login,
      id: user.id,
    };
  }

  async updateConfirmation(_id: ObjectId) {
    const result = await this.userModel.updateOne(
      { _id },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return result.modifiedCount === 1;
  }

  async newConfirmationCode(
    _id: ObjectId,
    data: Date,
    newConfirmationCode: string,
  ) {
    const result = await this.userModel.updateOne(
      { _id },
      {
        $set: {
          'emailConfirmation.confirmationCode': newConfirmationCode,
          'emailConfirmation.expirationDate': data,
        },
      },
    );

    return result.modifiedCount === 1;
  }

  async updatePassword(user: any, salt: string, hash: string) {
    const result = await this.userModel.updateOne(
      { _id: new ObjectId(user.id) },
      {
        $set: {
          'accountData.passwordHash': hash,
          'accountData.passwordSalt': salt,
        },
        $unset: {
          passwordRecovery: 1,
        },
      },
    );
    return result.modifiedCount === 1;
  }

  async passwordRecovery(
    _id: ObjectId,
    passwordRecoveryCode: string,
    expirationDate: Date,
  ) {
    const result = await this.userModel.updateOne(
      { _id },
      {
        $set: {
          'passwordRecovery.recoveryCode': passwordRecoveryCode,
          'passwordRecovery.expirationDate': expirationDate,
        },
      },
    );

    return result.modifiedCount === 1;
  }

  async deleteUserById(id: string): Promise<boolean> {
    const foundUser = await this.userModel.deleteOne({ _id: new ObjectId(id) });

    return !!foundUser.deletedCount;
  }

  async createRefreshTokensMeta(refreshTokenDto: any) {
    return this.refreshTokenMetaModel.insertMany(refreshTokenDto);
  }
  async updateRefreshTokensMeta(refreshTokenDto: any) {
    return this.refreshTokenMetaModel.updateOne(
      { deviceId: refreshTokenDto.deviceId },
      {
        $set: {
          issuedAt: refreshTokenDto.issuedAt,
          deviceId: refreshTokenDto.deviceId,
          userId: refreshTokenDto.userId,
          ip: refreshTokenDto.ip,
          deviseName: refreshTokenDto.deviseName,
        },
      },
    );
  }
  async deleteRefreshTokensMeta(deviceId: string) {
    return this.refreshTokenMetaModel.deleteOne({ deviceId });
  }
}
