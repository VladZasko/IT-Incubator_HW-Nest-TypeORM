import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Response,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.servis';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { v4 as uuidv4 } from 'uuid';
import { newPasswordModel } from './models/input/newPasswordModel';
import { CreateUserModel } from '../users/models/input/CreateUserModel';
import { AuthQueryRepository } from './auth.query.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected usersService: UsersService,
    protected authQueryRepository: AuthQueryRepository,
  ) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response({ passthrough: true }) res) {
    const accessToken = await this.authService.login(req.user.id);

    const dataRefreshToken = {
      issuedAt: new Date().toISOString(),
      deviceId: uuidv4(),
      userId: req.user.id,
      ip: req.ip!,
      deviseName: req.headers['user-agent'] ?? 'Device',
    };

    const refreshToken = await this.authService.refreshToken(dataRefreshToken);

    await this.authService.createRefreshTokensMeta(dataRefreshToken);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.status(200).send({
      accessToken: accessToken,
    });
  }
  @Post('password-recovery')
  async passwordRecovery(@Body() email: string) {
    await this.authService.passwordRecovery(email);
    return;
  }
  @Post('new-password')
  async newPassword(@Body() inputModel: newPasswordModel) {
    await this.authService.newPassword(inputModel);

    return;
  }
  /*@Post('refresh-token')
  async refreshToken(@Cookies) {
    const refreshToken = req.cookies.refreshToken;

    const dataRefreshToken = {
      issuedAt: new Date().toISOString(),
      deviceId: req.refreshTokenMeta!.deviceId,
      userId: req.user!.id,
      ip: req.ip!,
      deviseName: req.headers['user-agent'] ?? 'Device',
    };

    try {
      const accessToken = await jwtService.createJWTAccessToken(req.user!.id);
      const newRefreshToken =
        await jwtService.createJWTRefreshToken(dataRefreshToken);
      await RefreshTokensMetaModel.updateOne(
        { deviceId: req.refreshTokenMeta!.deviceId },
        {
          $set: {
            issuedAt: dataRefreshToken.issuedAt,
            deviceId: dataRefreshToken.deviceId,
            userId: dataRefreshToken.userId,
            ip: dataRefreshToken.ip,
            deviseName: dataRefreshToken.deviseName,
          },
        },
      );

      res
        .cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: true,
        })
        .status(HTTP_STATUSES.OK_200)
        .send(accessToken);
    } catch (error) {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .send('Invalid refresh token.');
    }

    return;
  }*/
  @Post('registration-confirmation')
  async registrationConfirmation(@Body('code') code: string) {
    const result = await this.authService.confirmEmail(code);

    if (!result) {
      throw new BadRequestException([
        { message: 'Confirmation code is incorrect', field: 'code' },
      ]);
    }
    return;
  }
  @Post('registration')
  async registration(@Body() inputModel: CreateUserModel) {
    const newUser = await this.authService.createUser(inputModel);
    if (newUser) {
      return;
    } else {
      throw new BadRequestException([
        { message: 'User dont create', field: 'registration' },
      ]);
    }
  }
  @Post('registration-email-resending')
  async registrationEmailResending(@Body('email') email: string) {
    const result = await this.authService.resendingConfirmEmail(email);
    if (result) {
      return;
    } else {
      throw new BadRequestException([
        { message: 'email dont sent', field: 'EmailResending' },
      ]);
    }
  }
  /*  @Post()
  async logout() {
    const foundDevice = await this.authService.deleteRefreshTokensMeta(inputModel);
    if (!foundDevice) {
      throw new NotFoundException();
    }
    return;
  }*/

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    const user = await this.authQueryRepository.getUserById(req.user.userId);
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
