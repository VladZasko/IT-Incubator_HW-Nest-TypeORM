import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserModel } from '../../../users/models/input/CreateUserModel';
import { AuthRepository } from '../../repository/auth.repository';
import { RefreshTokenMeta } from '../../../../db/entitys/refresh.token.meta.entity';

export class RefreshAndAccessTokenCommand {
  constructor(public createData: CreateUserModel) {}
}
@Injectable()
export class RefreshAndAccessTokenUseCase {
  constructor(
    protected authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      //expiresIn: this.configService.get('auth.ACCESS_TOKEN_TIME'),
      expiresIn: '1000s',
    });
  }

  async refreshToken(dataRefreshToken: any) {
    const payload = {
      deviceId: dataRefreshToken.deviceId,
      id: dataRefreshToken.userId,
      issuedAt: dataRefreshToken.issuedAt,
    };
    return this.jwtService.sign(payload, {
      //expiresIn: this.configService.get('auth.REFRESH_TOKEN_TIME'),
      expiresIn: '2000s',
    });
  }

  async createRefreshTokensMeta(dataRefreshToken: any) {
    const newRefreshTokenMeta = new RefreshTokenMeta();

    newRefreshTokenMeta.id = dataRefreshToken.id;
    newRefreshTokenMeta.deviceName = dataRefreshToken.deviseName;
    newRefreshTokenMeta.userId = dataRefreshToken.userId;
    newRefreshTokenMeta.issuedAt = dataRefreshToken.issuedAt;
    newRefreshTokenMeta.deviceId = dataRefreshToken.deviceId;
    newRefreshTokenMeta.ip = dataRefreshToken.ip;

    return await this.authRepository.createRefreshTokensMeta(
      newRefreshTokenMeta,
    );
  }

  async updateRefreshTokensMeta(refreshTokenUpdateDto: any) {
    const updateRefreshTokensMeta =
      await this.authRepository.findRefreshTokensMeta(
        refreshTokenUpdateDto.deviceId,
      );

    updateRefreshTokensMeta!.issuedAt = refreshTokenUpdateDto.issuedAt;

    return this.authRepository.updateRefreshTokensMeta(updateRefreshTokensMeta);
  }
  async deleteRefreshTokensMeta(deviceId: string) {
    return this.authRepository.deleteRefreshTokensMeta(deviceId);
  }
}
