import request from 'supertest';
import { RouterPaths } from '../../../src/routerPaths';
import { ERRORS_MESSAGES } from '../../../src/utils/errors';
import { UsersTestManager } from '../users/utils/usersTestManager';
import {
  dataTestUserCreate01,
  dataTestUserCreate02,
  incorrectUserData,
} from '../users/dataForTest/dataTestforUser';
import { dataTestUserAuth } from './dataForTest/dataTestforAuth';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { AuthQueryRepository } from '../../../src/features/auth/auth.query.repository';
import { AuthTestManager } from './utils/authTestManager';
import { EmailAdapter } from '../../../src/features/auth/adapters/email-adapter';
import { applyAppSettings } from '../../../src/settings/apply.app.settings';

describe('/auth', () => {
  let app: INestApplication;
  let httpServer;
  let emailAdapter: EmailAdapter;
  let authQueryRepository: AuthQueryRepository;
  let authTestManager: AuthTestManager;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    applyAppSettings(app);
    await app.init();

    httpServer = app.getHttpServer();

    emailAdapter = moduleFixture.get<EmailAdapter>(EmailAdapter);
    authQueryRepository =
      moduleFixture.get<AuthQueryRepository>(AuthQueryRepository);
    authTestManager = new AuthTestManager(
      authQueryRepository,
      app,
      emailAdapter,
    );

    usersTestManager = new UsersTestManager(app);
  });
  beforeEach(async () => {
    await request(httpServer).delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 400 with empty login Or Email', async () => {
    await request(httpServer)
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: '',
        password: dataTestUserCreate01.password,
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 400 with empty password', async () => {
    await request(httpServer)
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: dataTestUserCreate01.login,
        password: '',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 401 incorrect password', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    await request(httpServer)
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: dataTestUserCreate01.login,
        password: 'qwrty',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`should return 401 incorrect login Or Email`, async () => {
    await request(httpServer)
      .post(`${RouterPaths.auth}/login`)
      .set('authorization', 'Basic YWRtaW46cXdlcnR5')
      .send({
        loginOrEmail: dataTestUserCreate02.login,
        password: dataTestUserCreate01.password,
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 401 with Basic authorization ', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token = await authTestManager.createToken(dataTestUserAuth);

    await request(httpServer)
      .get(`${RouterPaths.auth}/me`)
      .set('authorization', `Basic ${token.createdEntity.accessToken}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 401 with not corresponding to JWT token ', async () => {
    await request(httpServer)
      .get(`${RouterPaths.auth}/me`)
      .set('authorization', `Bearer YWRtaW46cXdlcnR5`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 401 with old refresh token', async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token = await authTestManager.createToken(dataTestUserAuth);

    const responseData = {
      email: user.createdEntity.email,
      login: user.createdEntity.login,
      userId: user.createdEntity.id,
    };

    await request(httpServer)
      .get(`${RouterPaths.auth}/me`)
      .set('authorization', `Bearer ${token.createdEntity.accessToken}`)
      .expect(HttpStatus.OK, responseData);

    await request(httpServer)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token.refreshToken)
      .expect(HttpStatus.OK);

    await request(httpServer)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token.refreshToken)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 200 and new access token and refresh token', async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token = await authTestManager.createToken(dataTestUserAuth);

    const responseData = {
      email: user.createdEntity.email,
      login: user.createdEntity.login,
      userId: user.createdEntity.id,
    };

    await request(httpServer)
      .get(`${RouterPaths.auth}/me`)
      .set('authorization', `Bearer ${token.createdEntity.accessToken}`)
      .expect(HttpStatus.OK, responseData);

    await request(httpServer)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token.refreshToken!)
      .expect(HttpStatus.OK);
  });

  it('should return 401 with old refresh token /logout', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token = await authTestManager.createToken(dataTestUserAuth);

    await request(httpServer)
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', token.refreshToken!)
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token.refreshToken!)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 204 logout', async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token = await authTestManager.createToken(dataTestUserAuth);

    const responseData = {
      email: user.createdEntity.email,
      login: user.createdEntity.login,
      userId: user.createdEntity.id,
    };

    await request(httpServer)
      .get(`${RouterPaths.auth}/me`)
      .set('authorization', `Bearer ${token.createdEntity.accessToken}`)
      .expect(HttpStatus.OK, responseData);

    await request(httpServer)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token.refreshToken!)
      .expect(HttpStatus.OK);
  });

  it('should return 200 access token and refresh token', async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token = await authTestManager.createToken(dataTestUserAuth);

    const responseData = {
      email: user.createdEntity.email,
      login: user.createdEntity.login,
      userId: user.createdEntity.id,
    };

    await request(httpServer)
      .get(`${RouterPaths.auth}/me`)
      .set('authorization', `Bearer ${token.createdEntity.accessToken}`)
      .expect(HttpStatus.OK, responseData);
  });

  it('should return 400 user with the given email already exists', async () => {
    await authTestManager.userEmailRegistration(dataTestUserCreate01);

    await authTestManager.userEmailRegistration(
      dataTestUserCreate01,
      HttpStatus.BAD_REQUEST,
      1,
    );
  });

  it('should return 204 email registration', async () => {
    await authTestManager.userEmailRegistration(dataTestUserCreate01);
  });

  it('should return 400  confirmation code is incorrect', async () => {
    const user =
      await authTestManager.userEmailRegistration(dataTestUserCreate01);

    const data = {
      ...user.createEntity!,
      emailConfirmation: {
        ...user.createEntity!.emailConfirmation,
        confirmationCode: ' 123',
      },
    };
    await authTestManager.userEmailConfirmation(
      data,
      HttpStatus.BAD_REQUEST,
      1,
    );
  });

  it('should return 400 email has already been confirmed.', async () => {
    const user =
      await authTestManager.userEmailRegistration(dataTestUserCreate01);

    await authTestManager.userEmailConfirmation(user.createEntity!);

    await authTestManager.userEmailConfirmation(
      user.createEntity!,
      HttpStatus.BAD_REQUEST,
      1,
    );
  });

  it('should return 204 email was verified. Account was activated', async () => {
    const user =
      await authTestManager.userEmailRegistration(dataTestUserCreate01);

    await authTestManager.userEmailConfirmation(user.createEntity!);
  });

  it('should return 400 with old code', async () => {
    const user =
      await authTestManager.userEmailRegistration(dataTestUserCreate01);

    await authTestManager.userEmailConfirmationResending(user.createEntity!);

    await authTestManager.userEmailConfirmation(
      user.createEntity!,
      HttpStatus.BAD_REQUEST,
      1,
    );
  });

  it('should return 204 email resending.', async () => {
    const user =
      await authTestManager.userEmailRegistration(dataTestUserCreate01);

    const userNewCode = await authTestManager.userEmailConfirmationResending(
      user.createEntity!,
    );

    await authTestManager.userEmailConfirmation(userNewCode.createEntity!);
  });

  it('should return 400 if the inputModel has invalid email ', async () => {
    await authTestManager.userEmailRecoveryPassword(
      incorrectUserData.incorrectEmail,
      HttpStatus.BAD_REQUEST,
      1,
    );
  });

  // it('should return 429 More than 5 attempts from one IP-address during 10 seconds', async () => {
  //   const user = await usersTestManager.createUserAdmin(dataTestUserCreate02);
  //
  //   await authTestManager.userEmailRecoveryPassword(user.createdEntity.email);
  //   await authTestManager.userEmailRecoveryPassword(user.createdEntity.email);
  //   await authTestManager.userEmailRecoveryPassword(user.createdEntity.email);
  //   await authTestManager.userEmailRecoveryPassword(user.createdEntity.email);
  //   await authTestManager.userEmailRecoveryPassword(user.createdEntity.email);
  //   await authTestManager.userEmailRecoveryPassword(
  //     user.createdEntity.email,
  //     HttpStatus.TOO_MANY_REQUESTS,
  //   );
  // });

  it('should return 204 send email for change password', async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate02);

    await authTestManager.userEmailRecoveryPassword(user.createdEntity.email);
  });

  it("shouldn't change password 400 recoveryCode is incorrect", async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate01);

    await authTestManager.userEmailRecoveryPassword(user.createdEntity.email);

    const newPassword = {
      newPassword: 'string',
      recoveryCode: 'incorrect code',
    };

    await request(httpServer)
      .post(`${RouterPaths.auth}/new-password`)
      .send(newPassword)
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [ERRORS_MESSAGES.AUTH_RECOVERY_CODE],
      });

    await authTestManager.createToken(dataTestUserAuth);
  });

  /*    it("shouldn't change password 400 recoveryCode is expired", async () => {
              const user = await usersTestManager.createUserAdmin(dataTestUserCreate01)

              const recoveryCode = await authTestManager.userEmailRecoveryPassword(user.createdEntity.email)

              const expiredCodeData = {
                  _id:new ObjectId(user.createdEntity.id),
                  recoveryCode: recoveryCode.createEntity!.passwordRecovery!.recoveryCode,
                  expirationDate: sub(new Date(), {
                      minutes: 15
                  })
              }
              await AuthMongoRepository.passwordRecovery(expiredCodeData._id, expiredCodeData.recoveryCode, expiredCodeData.expirationDate)

              const newPassword = {
                  newPassword: "string",
                  recoveryCode: expiredCodeData.recoveryCode
              }

              await getRequest()
                  .post(`${RouterPaths.auth}/new-password`)
                  .send(newPassword)
                  .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                      errorsMessages: [ERRORS_MESSAGES.AUTH_RECOVERY_CODE]
                  })

              await authTestManager.createToken(dataTestUserAuth)
          })*/

  it('should return 204 change password', async () => {
    const user = await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const recoveryCode = await authTestManager.userEmailRecoveryPassword(
      user.createdEntity.email,
    );

    const newPassword = {
      newPassword: 'string',
      recoveryCode: recoveryCode.createEntity!.passwordRecovery.recoveryCode,
    };

    await request(httpServer)
      .post(`${RouterPaths.auth}/new-password`)
      .send(newPassword)
      .expect(HttpStatus.NO_CONTENT);

    await authTestManager.createToken(
      dataTestUserAuth,
      HttpStatus.UNAUTHORIZED,
    );

    const userWithNewPassword = {
      ...dataTestUserAuth,
      password: newPassword.newPassword,
    };

    await authTestManager.createToken(userWithNewPassword);
  });
});
