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
  Ip,
  NotFoundException,
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
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import {CreatePostBlogModel} from "./models/input/ConfirmCodeModel";
import {LoginAuthUserModel} from "./models/input/EmailModel";

//@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    protected refreshAndAccessTokenUseCase: RefreshAndAccessTokenUseCase,
    protected authQueryRepository: AuthQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req, @Response({ passthrough: true }) res) {
    const accessToken = await this.refreshAndAccessTokenUseCase.login(
      req.user.id,
    );

    const dataRefreshToken = {
      id: uuidv4(),
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

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .send({
        accessToken: accessToken,
      });
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async passwordRecovery(@Body() email: LoginAuthUserModel) {
    await this.commandBus.execute(
      new RecoveryPasswordCommand(email.email),
    );
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async newPassword(@Body() inputModel: newPasswordModel) {
    await this.commandBus.execute(new NewPasswordCommand(inputModel));
    return;
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(
    @Ip() ip,
    @Request() req,
    @Response({ passthrough: true }) res,
  ) {
    const dataRefreshToken = {
      issuedAt: new Date().toISOString(),
      deviceId: req.refreshTokenMeta!.deviceId,
      userId: req.user.id,
      ip: ip,
      deviseName: req.headers['user-agent'] ?? 'Device',
    };

    try {
      const accessToken = await this.refreshAndAccessTokenUseCase.login(
        req.user.id,
      );
      const newRefreshToken =
        await this.refreshAndAccessTokenUseCase.refreshToken(dataRefreshToken);
      await this.refreshAndAccessTokenUseCase.updateRefreshTokensMeta(
        dataRefreshToken,
      );

      res
        .cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: true,
        })
        .send({
          accessToken: accessToken,
        });
    } catch (error) {
      throw new UnauthorizedException([
        {
          message: 'Access Denied. No refresh token provided.',
          field: 'refreshToken',
        },
      ]);
    }

    return;
  }
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body()  code: CreatePostBlogModel) {
    const result = await this.commandBus.execute(new ConfirmEmailCommand(code.code));

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

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Request() req) {
    const foundDevice =
      await this.refreshAndAccessTokenUseCase.deleteRefreshTokensMeta(
        req.refreshTokenMeta!.deviceId,
      );
    if (!foundDevice) {
      throw new NotFoundException();
    }
    return;
  }

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
