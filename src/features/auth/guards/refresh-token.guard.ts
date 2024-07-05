import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  RefreshTokensMetaDBType,
  RefreshTokensMetaDocument,
} from '../../../db/schemes/token.schemes';
import { Model } from 'mongoose';
import { AuthQueryRepository } from '../auth.query.repository';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private authQueryRepository: AuthQueryRepository,
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException([
        {
          message: 'Access Denied. No refresh token provided.',
          field: 'refreshToken',
        },
      ]);
    }

    try {
      await this.jwtService.verify(
        refreshToken,
        this.configService.get('auth.JWT_SECRET'),
      );
    } catch (error) {
      throw new UnauthorizedException([
        {
          message: 'Access Denied. No refresh token provided.',
          field: 'refreshToken',
        },
      ]);
    }

    const user = await this.jwtService.verify(
      refreshToken,
      this.configService.get('auth.JWT_SECRET'),
    );

    // const refreshTokenMeta = await this.refreshTokenMetaModel.findOne({
    //   deviceId: user.deviceId,
    // });

    const query = `
        SELECT "issuetAt", "deviceId", "ip", "deviceName", "userId", "id"
            FROM public."RefreshTokenMeta"
            WHERE "deviceId" = $1;
        `

    const refreshTokenMeta = await this.dataSource.query(
        query,[
          user.deviceId
        ]);

    if (!refreshTokenMeta[0]) {
      throw new UnauthorizedException([
        {
          message: 'Access Denied. No refresh token provided.',
          field: 'refreshToken',
        },
      ]);
    }

    if (refreshTokenMeta[0]?.issuetAt !== user.issuedAt) {
      throw new UnauthorizedException([
        {
          message: 'Access Denied. No refresh token provided.',
          field: 'refreshToken',
        },
      ]);
    }
    if (refreshTokenMeta[0]?.issuetAt === user.issuedAt) {
      request.user = await this.authQueryRepository.getUserById(
        refreshTokenMeta[0]!.userId,
      );
      request.refreshTokenMeta = refreshTokenMeta[0];
      //return refreshTokenMeta;
      return true;
    }
    throw new UnauthorizedException([
      {
        message: 'Access Denied. No refresh token provided.',
        field: 'refreshToken',
      },
    ]);
  }
}
