import request from 'supertest';
import { app } from '../../../src/app';
import { HTTP_STATUSES } from '../../../src/utils/utils';
import { RouterPaths } from '../../../src/routerPaths';
import { usersTestManager } from '../users/utils/usersTestManager';
import {
  dataTestUserCreate01,
  dataTestUserCreate02,
} from '../users/dataForTest/dataTestforUser';
import { dbControl } from '../../../src/db/db';
import { AuthTestManager } from '../auth/utils/authTestManager';
import {
  dataTestUserAuth,
  dataTestUserAuth2,
} from '../auth/dataForTest/dataTestforAuth';

const getRequest = () => {
  return request(app);
};
describe('/securityDevices', () => {
  beforeAll(async () => {
    await dbControl.run();
  });

  beforeEach(async () => {
    await getRequest().delete('/testing/all-data');
  });

  afterAll(async () => {
    await dbControl.stop();
  });

  it('should return 401 if refreshToken inside cookie is missing', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token = await AuthTestManager.createToken(dataTestUserAuth);

    await getRequest()
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token.refreshToken!)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);
  });

  it('should return 200 and three devices', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token1 = await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth);

    const resalt = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resalt.body.length).toBe(3);
  });

  it("shouldn't delete device. 401 JWT refreshToken inside cookie is missing, expired or incorrect", async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token1 = await AuthTestManager.createToken(dataTestUserAuth);
    const token2 = await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth);

    const resalt = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resalt.body.length).toBe(3);

    await getRequest()
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .delete(`${RouterPaths.security}/devices/${resalt.body[1].deviceId}`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);

    const resalt2 = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token2.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resalt2.body.length).toBe(3);
  });

  it("shouldn't delete device. 403 if try to delete the deviceId of other user", async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);
    await usersTestManager.createUserAdmin(dataTestUserCreate02);

    const tokenUser1 = await AuthTestManager.createToken(dataTestUserAuth);
    const tokenUser2 = await AuthTestManager.createToken(dataTestUserAuth2);
    await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth2);

    const resaltUser1 = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resaltUser1.body.length).toBe(2);

    const resaltUser2 = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser2.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resaltUser2.body.length).toBe(2);

    await getRequest()
      .delete(`${RouterPaths.security}/devices/${resaltUser2.body[1].deviceId}`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HTTP_STATUSES.FORBIDDEN_403);

    const deviceUser1 = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(deviceUser1.body.length).toBe(2);

    const deviceUser2 = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser2.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(deviceUser2.body.length).toBe(2);
  });

  it("shouldn't delete device. 404 not found", async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const tokenUser1 = await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth);

    const resaltUser1 = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resaltUser1.body.length).toBe(3);

    await getRequest()
      .delete(`${RouterPaths.security}/devices/${123}`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    const deviceUser1 = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', tokenUser1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(deviceUser1.body.length).toBe(3);
  });

  it('should return 204 delete one device', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token1 = await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth);

    const resalt = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resalt.body.length).toBe(3);

    await getRequest()
      .delete(`${RouterPaths.security}/devices/${resalt.body[1].deviceId}`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const resalt2 = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resalt2.body.length).toBe(2);
  });

  it("shouldn't delete all device. 401 JWT refreshToken inside cookie is missing, expired or incorrect", async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token1 = await AuthTestManager.createToken(dataTestUserAuth);
    const token2 = await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth);

    const resalt = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resalt.body.length).toBe(3);

    await getRequest()
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    await getRequest()
      .delete(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.UNAUTHORIZED_401);

    const resalt2 = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token2.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resalt2.body.length).toBe(3);
  });

  it('should return 204 delete all device', async () => {
    await usersTestManager.createUserAdmin(dataTestUserCreate01);

    const token1 = await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth);
    await AuthTestManager.createToken(dataTestUserAuth);

    const resalt = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resalt.body.length).toBe(3);

    await getRequest()
      .delete(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    const resalt2 = await getRequest()
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', token1.refreshToken!)
      .expect(HTTP_STATUSES.OK_200);

    expect(resalt2.body.length).toBe(1);
  });
});
