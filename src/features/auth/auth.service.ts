import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { LoginAuthUserModel } from './models/input/LoginAuthUserModel';
import {
  UsersRepoViewModel,
  UsersViewModel,
} from '../users/models/output/UsersViewModel';
import { AuthQueryRepository } from './auth.query.repository';
import { userAuthDBMapper } from './mapper/mappers';
import * as bcrypt from 'bcrypt';
import { CreateUserModel } from '../users/models/input/CreateUserModel';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';
import { emailAdapter } from './adapters/email-adapter';
import { EmailAdapterDto } from './models/input/EmailAdapterDto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    protected authRepository: AuthRepository,
    protected authQueryRepository: AuthQueryRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createData: CreateUserModel): Promise<UsersViewModel> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      createData.password,
      passwordSalt,
    );

    const newUser = {
      accountData: {
        login: createData.login,
        email: createData.email,
        createdAt: new Date().toISOString(),
        passwordHash,
        passwordSalt,
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          minutes: 15,
        }),
        resendingCode: new Date(),
        isConfirmed: false,
      },
    };
    const createResult = await this.authRepository.createUser(newUser);
    try {
      const emailAdapterDto: EmailAdapterDto = {
        email: newUser.accountData.email,
        confirmationCode: newUser.emailConfirmation.confirmationCode,
      };
      await emailAdapter.sendCode(emailAdapterDto);
    } catch (error) {
      console.error(error);
      await this.authRepository.deleteUserById(createResult.id);
    }
    return createResult;
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user =
      await this.authQueryRepository.findUserByConfirmationCode(code);
    if (!user) return false;
    if (user.emailConfirmation!.isConfirmed) return false;
    if (user.emailConfirmation!.confirmationCode !== code) return false;
    if (user.emailConfirmation!.expirationDate < new Date()) return false;

    return await this.authRepository.updateConfirmation(user._id);
  }

  async resendingConfirmEmail(email: string): Promise<boolean> {
    const user = await this.authQueryRepository.findByLoginOrEmail(email);
    if (!user) return false;

    const newConfirmationCode = uuidv4();
    const newExpirationDate = add(new Date(), {
      minutes: 15,
    });

    const result = await this.authRepository.newConfirmationCode(
      user._id,
      newExpirationDate,
      newConfirmationCode,
    );

    const resendingConfirmEmailDto: EmailAdapterDto = {
      email: user.accountData.email,
      newCode: newConfirmationCode,
    };
    try {
      await emailAdapter.sendNewCode(resendingConfirmEmailDto);
    } catch (error) {
      console.error(error);
      return false;
    }

    return result;
  }

  async passwordRecovery(email: string): Promise<boolean> {
    const user = await this.authQueryRepository.findByLoginOrEmail(email);
    if (!user) return true;

    const passwordRecoveryCode = uuidv4();
    const expirationDate = add(new Date(), {
      minutes: 15,
    });

    const result = await this.authRepository.passwordRecovery(
      user!._id,
      passwordRecoveryCode,
      expirationDate,
    );

    const sendRecoveryCodeDto: EmailAdapterDto = {
      email: user.accountData.email,
      recoveryCode: passwordRecoveryCode,
    };
    try {
      await emailAdapter.sendRecoveryCode(sendRecoveryCodeDto);
    } catch (error) {
      console.error(error);
      return false;
    }

    return result;
  }

  async newPassword(data: any): Promise<boolean> {
    const user = await this.authQueryRepository.findUserByRecoveryCode(
      data.recoveryCode,
    );
    if (!user) return false;
    if (user.passwordRecovery!.recoveryCode !== data.recoveryCode) return false;
    if (user.passwordRecovery!.expirationDate < new Date()) return false;

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      data.newPassword,
      passwordSalt,
    );

    return await this.authRepository.updatePassword(
      user,
      passwordSalt,
      passwordHash,
    );
  }

  async checkCredentials(
    checkCredentialsDto: LoginAuthUserModel,
  ): Promise<UsersRepoViewModel | null> {
    const user = await this.authQueryRepository.findByLoginOrEmail(
      checkCredentialsDto.loginOrEmail,
    );
    if (!user) {
      return null;
    }

    const passwordHash = await this._generateHash(
      checkCredentialsDto.password,
      user.accountData.passwordHash,
    );

    if (user.accountData.passwordHash !== passwordHash) {
      return null;
    }

    return userAuthDBMapper(user);
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  async login(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, { expiresIn: '30s' });
  }

  async refreshToken(dataRefreshToken: any) {
    const payload = {
      sub: {
        deviceId: dataRefreshToken.deviceId,
        id: dataRefreshToken.userId,
        issuedAt: dataRefreshToken.issuedAt,
      },
    };
    return {
      refreshToken: this.jwtService.sign(payload, { expiresIn: '60s' }),
    };
  }

  async createRefreshTokensMeta(refreshTokenDto: any) {
    return this.authRepository.createRefreshTokensMeta(refreshTokenDto);
  }

  async updateRefreshTokensMeta(refreshTokenUpdateDto: any) {
    return this.authRepository.updateRefreshTokensMeta(refreshTokenUpdateDto);
  }
  async deleteRefreshTokensMeta(deviceId: string) {
    return this.authRepository.deleteRefreshTokensMeta(deviceId);
  }
}
