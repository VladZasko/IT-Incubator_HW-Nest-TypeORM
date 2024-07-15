import { Injectable } from '@nestjs/common';
import { AuthMongoRepository } from '../../auth.mongo.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserModel } from '../../../users/models/input/CreateUserModel';
import {AuthRepository} from "../../auth.repository";

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
