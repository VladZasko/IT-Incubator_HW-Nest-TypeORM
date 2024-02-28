import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import * as process from 'process';
@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      passReqToCallback: true,
    });
  }

  public validate = async (req, username, password): Promise<boolean> => {
    if (
      process.env.AUTH_LOGIN === username &&
      process.env.AUTH_PASSWORD === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
