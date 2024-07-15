import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessRolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;

    if (!auth) {
      request.userId = null;
      return true; // Если токен отсутствует, вернуть null
    }

    const [bearer, token] = auth!.split(' ');

    if (bearer !== 'Bearer') {
      request.userId = null;
      return true;
    }

    try {
      const decoded = this.jwtService.verify(
        token,
        this.configService.get('auth.JWT_SECRET'),
      );

      console.log(decoded)
      request.userId = decoded.sub; // Добавить декодированные данные из токена в объект запроса
      return true;
    } catch (error) {
      return true; // Если токен недействителен, отклонить запрос
    }
  }
}
