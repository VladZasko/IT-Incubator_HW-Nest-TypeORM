import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RefreshTokenMeta } from '../../../db/entitys/refresh.token.meta.entity';
import { AuthRepository } from '../repository/auth.repository';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private authRepository: AuthRepository,
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectRepository(RefreshTokenMeta)
    private readonly refreshTokenMetaRepository: Repository<RefreshTokenMeta>,
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

    const refreshTokenMeta = await this.refreshTokenMetaRepository.findOneBy({
      deviceId: user.deviceId,
    });

    console.log(refreshTokenMeta);

    if (!refreshTokenMeta) throw new UnauthorizedException();

    if (refreshTokenMeta.issuedAt !== user.issuedAt) {
      throw new UnauthorizedException([
        {
          message: 'Access Denied. No refresh token provided.',
          field: 'refreshToken',
        },
      ]);
    }
    if (refreshTokenMeta.issuedAt === user.issuedAt) {
      request.user = await this.authRepository.getUserById(
        refreshTokenMeta.userId,
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
