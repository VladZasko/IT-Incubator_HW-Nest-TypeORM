import request from 'supertest';
import { authModel } from '../../../../src/features/auth/models/authModels';
import { CreateUserModel } from '../../../../src/features/users/models/input/CreateUserModel';
import { EmailAdapter } from '../../../../src/features/auth/adapters/email-adapter';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { HttpStatusType } from '../../../utils/utils';
import { AuthQueryRepository } from '../../../../src/features/auth/auth.query.repository';
import { dataTestUserCreate01 } from '../../users/dataForTest/dataTestforUser';
import { RouterPaths } from '../../../../src/routerPaths';
import { User } from '../../../../src/db/entitys/user.entity';

export class AuthTestManager {
  constructor(
    protected authQueryRepository: AuthQueryRepository,
    protected readonly app: INestApplication,
    protected readonly emailAdapter: EmailAdapter,
  ) {}
  async createToken(
    data: authModel,
    expectedStatusCode: HttpStatusType = HttpStatus.OK,
    expectedErrorsMessagesLength?: number,
  ) {
    const result = await request(this.app.getHttpServer())
      .post(`${RouterPaths.auth}/login`)
      .send(data)
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      expect(result.body.errorsMessages.length).toBe(
        expectedErrorsMessagesLength,
      );
    }

    let createdEntity;
    let refreshToken;

    if (expectedStatusCode === HttpStatus.OK) {
      createdEntity = result.body;
      refreshToken = result.header['set-cookie'];
      expect(createdEntity).toEqual(result.body);
    }

    return {
      response: result,
      createdEntity: createdEntity,
      refreshToken: refreshToken,
    };
  }
  async userEmailRegistration(
    data: CreateUserModel,
    expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
    expectedErrorsMessagesLength?: number,
  ) {
    jest
      .spyOn(this.emailAdapter, 'sendCode')
      .mockImplementation(() => Promise.resolve(true));

    const response = await request(this.app.getHttpServer())
      .post(`${RouterPaths.auth}/registration`)
      .send(data)
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      expect(response.body.errorsMessages.length).toBe(
        expectedErrorsMessagesLength,
      );
    }

    const user = await this.authQueryRepository.findByLoginOrEmail(
      dataTestUserCreate01.email,
    );

    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      expect(user!.login).toBe(data.login);
      expect(user!.emailConfirmation.isConfirmed).toBe(false);
    }
    return { response: response, createEntity: user };
  }
  async userEmailConfirmation(
    data: User,
    expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
    expectedErrorsMessagesLength?: number,
  ) {
    const response = await request(this.app.getHttpServer())
      .post(`${RouterPaths.auth}/registration-confirmation`)
      .send({ code: data.emailConfirmation.confirmationCode })
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      expect(response.body.errorsMessages.length).toBe(
        expectedErrorsMessagesLength,
      );
    }

    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      const userConfirmation =
        await this.authQueryRepository.findByLoginOrEmail(data.email);

      expect(userConfirmation!.login).toBe(data.login);
      expect(userConfirmation!.emailConfirmation.isConfirmed).toBe(true);
    }

    return { response: response };
  }
  async userEmailConfirmationResending(
    data: User,
    expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
    expectedErrorsMessagesLength?: number,
  ) {
    jest
      .spyOn(this.emailAdapter, 'sendNewCode')
      .mockImplementation(() => Promise.resolve(true));

    const response = await request(this.app.getHttpServer())
      .post(`${RouterPaths.auth}/registration-email-resending`)
      .send({ email: data.email })
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      expect(response.body.errorsMessages.length).toBe(
        expectedErrorsMessagesLength,
      );
    }

    const userConfirmation = await this.authQueryRepository.findByLoginOrEmail(
      dataTestUserCreate01.email,
    );

    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      expect(userConfirmation!.login).toBe(data.login);
      expect(userConfirmation!.emailConfirmation.confirmationCode).not.toBe(
        data.emailConfirmation.confirmationCode,
      );
    }

    return { response: response, createEntity: userConfirmation };
  }
  async userEmailRecoveryPassword(
    email: string,
    expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
    expectedErrorsMessagesLength?: number,
  ) {
    jest
      .spyOn(this.emailAdapter, 'sendRecoveryCode')
      .mockImplementation(() => Promise.resolve(true));

    const response = await request(this.app.getHttpServer())
      .post(`${RouterPaths.auth}/password-recovery`)
      .send({ email: email })
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      expect(response.body.errorsMessages.length).toBe(
        expectedErrorsMessagesLength,
      );
    }

    const user = await this.authQueryRepository.findByLoginOrEmail(email);

    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      expect(user!.passwordRecovery.recoveryCode).toEqual(expect.any(String));
      expect(user!.passwordRecovery.expirationDate).toEqual(expect.any(String));
    }
    return { response: response, createEntity: user };
  }
}
