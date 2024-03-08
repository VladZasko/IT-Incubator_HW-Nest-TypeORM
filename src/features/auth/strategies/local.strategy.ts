import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginAuthUserModel } from '../models/input/LoginAuthUserModel';
import { CheckCredentialsCommand } from '../application/use-cases/check.credentials.use.case';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const checkCredentialsDto: LoginAuthUserModel = {
      loginOrEmail: loginOrEmail,
      password: password,
    };
    const user = await this.commandBus.execute(
      new CheckCredentialsCommand(checkCredentialsDto),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
