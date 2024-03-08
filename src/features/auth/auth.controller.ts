import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Response,
  BadRequestException,
  Get,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { v4 as uuidv4 } from 'uuid';
import { newPasswordModel } from './models/input/newPasswordModel';
import { CreateUserModel } from '../users/models/input/CreateUserModel';
import { AuthQueryRepository } from './auth.query.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { mapServiceCodeToHttpStatus } from './mapper/status-code-mapper';
import { CreateUserCommand } from './application/use-cases/create.user.use.case';
import { ConfirmEmailCommand } from './application/use-cases/confirm.email.use.case';
import { RecoveryPasswordCommand } from './application/use-cases/recovery.password.use.case';
import { RefreshAndAccessTokenUseCase } from './application/use-cases/refresh.and.access.token.use.case';
import { CommandBus } from '@nestjs/cqrs';
import { ResendingConfirmEmailCommand } from './application/use-cases/resending.confirm.email.use.case';
import { NewPasswordCommand } from './application/use-cases/new.password.use.case';

@Controller('auth')
export class AuthController {
  constructor(
    protected refreshAndAccessTokenUseCase: RefreshAndAccessTokenUseCase,
    protected authQueryRepository: AuthQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response({ passthrough: true }) res) {
    const accessToken = await this.refreshAndAccessTokenUseCase.login(
      req.user.id,
    );

    const dataRefreshToken = {
      issuedAt: new Date().toISOString(),
      deviceId: uuidv4(),
      userId: req.user.id,
      ip: req.ip!,
      deviseName: req.headers['user-agent'] ?? 'Device',
    };

    const refreshToken =
      await this.refreshAndAccessTokenUseCase.refreshToken(dataRefreshToken);

    await this.refreshAndAccessTokenUseCase.createRefreshTokensMeta(
      dataRefreshToken,
    );

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.status(200).send({
      accessToken: accessToken,
    });
  }
  @Post('password-recovery')
  async passwordRecovery(@Body() email: string) {
    await this.commandBus.execute(
      new RecoveryPasswordCommand({ email: email }),
    );
    return;
  }
  @Post('new-password')
  async newPassword(@Body() inputModel: newPasswordModel) {
    await this.commandBus.execute(new NewPasswordCommand(inputModel));
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body('code') code: string) {
    const result = await this.commandBus.execute(new ConfirmEmailCommand(code));

    if (!result) {
      throw new BadRequestException([
        { message: 'Confirmation code is incorrect', field: 'code' },
      ]);
    }
    return;
  }
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() inputModel: CreateUserModel) {
    const newUser = await this.commandBus.execute(
      new CreateUserCommand(inputModel),
    );
    return mapServiceCodeToHttpStatus(newUser);
  }
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body('email') email: string) {
    const result = await this.commandBus.execute(
      new ResendingConfirmEmailCommand(email),
    );
    if (result) {
      return;
    } else {
      throw new BadRequestException([
        { message: 'email dont sent', field: 'email' },
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
    if (!user) throw new UnauthorizedException();
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
