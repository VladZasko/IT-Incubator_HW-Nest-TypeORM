import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LoginAuthUserModel } from '../models/input/LoginAuthUserModel';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const checkCredentialsDto: LoginAuthUserModel = {
      loginOrEmail: loginOrEmail,
      password: password,
    };
    const user = await this.authService.checkCredentials(checkCredentialsDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
