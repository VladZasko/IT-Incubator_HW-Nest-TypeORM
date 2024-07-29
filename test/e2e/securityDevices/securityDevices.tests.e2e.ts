import request from 'supertest';
import { RouterPaths } from '../../../src/routerPaths';
import { UsersTestManager } from '../users/utils/usersTestManager';
import {
  dataTestUserCreate01,
  dataTestUserCreate02,
} from '../users/dataForTest/dataTestforUser';
import { AuthTestManager } from '../auth/utils/authTestManager';
import {
  dataTestUserAuth,
  dataTestUserAuth2,
} from '../auth/dataForTest/dataTestforAuth';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { EmailAdapter } from '../../../src/features/auth/adapters/email-adapter';
import { AuthQueryRepository } from '../../../src/features/auth/auth.query.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply.app.settings';

describe('/securityDevices', () => {
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

  it('should return 401 if refreshToken inside cookie is missing', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token = await authTestManager.createToken(dataTestUserAuth);

    await request(httpServer)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token.refreshToken!)
      .expect(HttpStatus.OK);

    await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token.refreshToken!)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 200 and three devices', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token1 = await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth);

    const resalt = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resalt.body.length).toBe(3);
  });

  it("shouldn't delete device. 401 JWT refreshToken inside cookie is missing, expired or incorrect", async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token1 = await authTestManager.createToken(dataTestUserAuth);
    const token2 = await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth);

    const resalt = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resalt.body.length).toBe(3);

    await request(httpServer)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.OK);

    await request(httpServer)
      .delete(`${RouterPaths.security}/devices/${resalt.body[1].deviceId}`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.UNAUTHORIZED);

    const resalt2 = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token2.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resalt2.body.length).toBe(3);
  });

  it("shouldn't delete device. 403 if try to delete the deviceId of other user", async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);
    await usersTestManager.createUserAdmin(dataTestUserCreate02);

    const tokenUser1 = await authTestManager.createToken(dataTestUserAuth);
    const tokenUser2 = await authTestManager.createToken(dataTestUserAuth2);
    await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth2);

    const resaltUser1 = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resaltUser1.body.length).toBe(2);

    const resaltUser2 = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser2.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resaltUser2.body.length).toBe(2);

    await request(httpServer)
      .delete(`${RouterPaths.security}/devices/${resaltUser2.body[1].deviceId}`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HttpStatus.FORBIDDEN);

    const deviceUser1 = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(deviceUser1.body.length).toBe(2);

    const deviceUser2 = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser2.refreshToken!)
      .expect(HttpStatus.OK);

    expect(deviceUser2.body.length).toBe(2);
  });

  it("shouldn't delete device. 404 not found", async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const tokenUser1 = await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth);

    const resaltUser1 = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resaltUser1.body.length).toBe(3);

    await request(httpServer)
      .delete(`${RouterPaths.security}/devices/${123}`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HttpStatus.BAD_REQUEST);

    const deviceUser1 = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(deviceUser1.body.length).toBe(3);
  });

  it('should return 204 delete one device', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token1 = await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth);

    const resalt = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resalt.body.length).toBe(3);

    await request(httpServer)
      .delete(`${RouterPaths.security}/devices/${resalt.body[1].deviceId}`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.NO_CONTENT);

    const resalt2 = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resalt2.body.length).toBe(2);
  });

  it("shouldn't delete all device. 401 JWT refreshToken inside cookie is missing, expired or incorrect", async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token1 = await authTestManager.createToken(dataTestUserAuth);
    const token2 = await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth);

    const resalt = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resalt.body.length).toBe(3);

    await request(httpServer)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.OK);

    await request(httpServer)
      .delete(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.UNAUTHORIZED);

    const resalt2 = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token2.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resalt2.body.length).toBe(3);
  });

  it('should return 204 delete all device', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token1 = await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth);
    await authTestManager.createToken(dataTestUserAuth);

    const resalt = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resalt.body.length).toBe(3);

    await request(httpServer)
      .delete(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.NO_CONTENT);

    const resalt2 = await request(httpServer)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HttpStatus.OK);

    expect(resalt2.body.length).toBe(1);
  });
});
