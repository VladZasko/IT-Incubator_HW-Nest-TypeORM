import request from 'supertest';
import { ErrorMessage } from '../../../../src/utils/errors';
import { authModel } from '../../../../src/features/auth/models/authModels';
import { errors } from '../../../utils/error';
import { CreateUserModel } from '../../../../src/features/users/models/input/CreateUserModel';
import { EmailAdapter } from '../../../../src/features/auth/adapters/email-adapter';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { HttpStatusType } from '../../../utils/utils';
import { AuthQueryRepository } from '../../../../src/features/auth/auth.query.repository';
import { dataTestUserCreate01 } from '../../users/dataForTest/dataTestforUser';
import { RouterPaths } from '../../../../src/routerPaths';
import { UserDBType } from '../../../../src/db/schemes/users.schemes';

let app: INestApplication;
const httpServer = app.getHttpServer();

export class AuthTestManager {
  constructor(protected authQueryRepository: AuthQueryRepository) {}
  async createToken(
    data: authModel,
    expectedStatusCode: HttpStatusType = HttpStatus.OK,
    expectedErrorsMessages?: ErrorMessage,
  ) {
    const result = await request(httpServer)
      .post(`${RouterPaths.auth}/login`)
      .send(data)
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      await errors.errors(result.body, expectedErrorsMessages);
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
    expectedErrorsMessages?: ErrorMessage,
  ) {
    jest
      .spyOn(EmailAdapter, 'sendCode')
      .mockImplementation(() => Promise.resolve(true));

    const response = await request(httpServer)
      .post(`${RouterPaths.auth}/registration`)
      .send(data)
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      await errors.errors(response.body, expectedErrorsMessages);
    }

    const user = await this.authQueryRepository.findByLoginOrEmail(
      dataTestUserCreate01.email,
    );

    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      expect(user!.accountData.login).toBe(data.login);
      expect(user!.emailConfirmation!.isConfirmed).toBe(false);
    }
    return { response: response, createEntity: user };
  }
  async userEmailConfirmation(
    data: UserDBType,
    expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
    expectedErrorsMessages?: ErrorMessage,
  ) {
    const response = await request(httpServer)
      .post(`${RouterPaths.auth}/registration-confirmation`)
      .send({ code: data.emailConfirmation!.confirmationCode })
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      await errors.errors(response.body, expectedErrorsMessages);
    }

    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      const userConfirmation =
        await this.authQueryRepository.findByLoginOrEmail(
          data.accountData.email,
        );

      expect(userConfirmation!.accountData.login).toBe(data.accountData.login);
      expect(userConfirmation!.emailConfirmation!.isConfirmed).toBe(true);
    }

    return { response: response };
  }
  async userEmailConfirmationResending(
    data: UserDBType,
    expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
    expectedErrorsMessages?: ErrorMessage,
  ) {
    jest
      .spyOn(EmailAdapter, 'sendNewCode')
      .mockImplementation(() => Promise.resolve(true));

    const response = await request(httpServer)
      .post(`${RouterPaths.auth}/registration-email-resending`)
      .send({ email: data.accountData.email })
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      await errors.errors(response.body, expectedErrorsMessages);
    }

    const userConfirmation = await this.authQueryRepository.findByLoginOrEmail(
      dataTestUserCreate01.email,
    );

    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      expect(userConfirmation!.accountData.login).toBe(data.accountData.login);
      expect(userConfirmation!.emailConfirmation!.confirmationCode).not.toBe(
        data.emailConfirmation!.confirmationCode,
      );
    }

    return { response: response, createEntity: userConfirmation };
  }
  async userEmailRecoveryPassword(
    email: string,
    expectedStatusCode: HttpStatusType = HttpStatus.NO_CONTENT,
    expectedErrorsMessages?: ErrorMessage,
  ) {
    jest
      .spyOn(EmailAdapter, 'sendRecoveryCode')
      .mockImplementation(() => Promise.resolve(true));

    const response = await request(httpServer)
      .post(`${RouterPaths.auth}/password-recovery`)
      .send({ email: email })
      .expect(expectedStatusCode);

    if (expectedStatusCode === HttpStatus.BAD_REQUEST) {
      await errors.errors(response.body, expectedErrorsMessages);
    }

    const user = await this.authQueryRepository.findByLoginOrEmail(email);

    if (expectedStatusCode === HttpStatus.NO_CONTENT) {
      expect(user!.passwordRecovery!.recoveryCode).toEqual(expect.any(String));
      expect(user!.passwordRecovery!.expirationDate).toEqual(expect.any(Date));
    }
    return { response: response, createEntity: user };
  }
}
