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

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private authQueryRepository: AuthQueryRepository,
    @InjectModel(RefreshTokensMetaDBType.name)
    private refreshTokenMetaModel: Model<RefreshTokensMetaDocument>,
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

    const refreshTokenMeta = await this.refreshTokenMetaModel.findOne({
      deviceId: user.deviceId,
    });

    if (!refreshTokenMeta) {
      throw new UnauthorizedException([
        {
          message: 'Access Denied. No refresh token provided.',
          field: 'refreshToken',
        },
      ]);
    }

    if (refreshTokenMeta?.issuedAt !== user.issuedAt) {
      throw new UnauthorizedException([
        {
          message: 'Access Denied. No refresh token provided.',
          field: 'refreshToken',
        },
      ]);
    }
    if (refreshTokenMeta?.issuedAt === user.issuedAt) {
      request.user = await this.authQueryRepository.getUserById(
        refreshTokenMeta!.userId,
      );
      request.refreshTokenMeta = refreshTokenMeta;
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
